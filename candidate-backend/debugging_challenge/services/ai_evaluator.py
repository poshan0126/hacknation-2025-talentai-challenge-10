from .react_grading_agent import ReActGradingAgent
from typing import List, Dict, Tuple
import json
import re
import os
from shared.llm_config import llm_config
from ..models.submission import BugIdentification
from ..models.challenge import Bug

class CommentEvaluator:
    def __init__(self):
        # Use ReAct agent for grading with configured model
        self.react_grader = ReActGradingAgent()
    
    def extract_comments(self, annotated_code: str) -> List[Tuple[int, str]]:
        comments = []
        lines = annotated_code.split('\n')
        
        comment_patterns = [
            r'#\s*BUG:\s*(.*)',
            r'//\s*BUG:\s*(.*)',
            r'/\*\s*BUG:\s*(.*?)\*/',
            r'#\s*bug:\s*(.*)',
            r'//\s*bug:\s*(.*)',
        ]
        
        for i, line in enumerate(lines, 1):
            for pattern in comment_patterns:
                match = re.search(pattern, line, re.IGNORECASE)
                if match:
                    comments.append((i, match.group(1).strip()))
                    break
        
        return comments
    
    def evaluate_submission(self, candidate_analysis: str, expected_bugs: List[Bug], 
                           language: str, buggy_code: str = "") -> Dict:
        """
        Evaluate candidate's bug analysis using Claude
        """
        try:
            # Use configured LLM for grading
            llm = llm_config.get_grading_llm()
            
            # Prepare expected bugs for prompt
            expected_bugs_str = "\n".join([
                f"- Line {bug.line_number}: {bug.description} (Type: {bug.bug_type})"
                for bug in expected_bugs
            ])
            
            prompt = f"""Evaluate this bug analysis submission. Be strict but fair.

Expected Bugs in the Code:
{expected_bugs_str}

Candidate's Analysis:
{candidate_analysis}

Return ONLY valid JSON with this exact structure:
{{
    "bugs_found": <integer count of correctly identified bugs>,
    "bugs_missed": <integer count of missed bugs>,
    "false_positives": <integer count of incorrect bug claims>,
    "accuracy_rate": <float percentage 0-100>,
    "score": <float score 0-100>,
    "ai_feedback": "<constructive feedback message>",
    "identified_bugs": [
        {{
            "line_number": <int>,
            "is_correct": <boolean>,
            "feedback": "<specific feedback for this identification>"
        }}
    ]
}}

Be encouraging but honest. If they found 0 bugs, score should be 0."""
            
            response = llm.invoke(prompt)
            
            # Extract content from response
            if hasattr(response, 'content'):
                response_text = response.content
            else:
                response_text = str(response)
            
            # Extract JSON from response
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
                
                # Add actual bugs to the result
                result["actual_bugs"] = [
                    {"line_number": bug.line_number, "description": bug.description} 
                    for bug in expected_bugs
                ]
                
                # Ensure all required fields exist
                result.setdefault("evaluation_details", {"method": "claude"})
                
                # Convert identified_bugs to proper format
                identified_bugs = []
                for bug_data in result.get("identified_bugs", []):
                    identified_bugs.append(BugIdentification(
                        line_number=bug_data.get("line_number", 0),
                        comment=candidate_analysis,  # Use the full analysis
                        is_correct=bug_data.get("is_correct", False),
                        feedback=bug_data.get("feedback", "")
                    ))
                result["identified_bugs"] = identified_bugs
                
                return result
            else:
                raise ValueError("Claude did not return valid JSON")
                
        except Exception as e:
            print(f"Claude grading failed: {e}, using fallback")
            return self._fallback_evaluation(candidate_analysis, expected_bugs)
    
    def _process_evaluation_result(self, result: Dict, annotated_code: str) -> Dict:
        identified_bugs = []
        
        for bug in result.get("bugs_correctly_identified", []):
            identified_bugs.append(BugIdentification(
                line_number=bug["line_number"],
                comment=bug["comment"],
                is_correct=True,
                feedback="Correct identification!"
            ))
        
        for bug in result.get("false_positives", []):
            identified_bugs.append(BugIdentification(
                line_number=bug["line_number"],
                comment=bug["comment"],
                is_correct=False,
                feedback=bug["explanation"]
            ))
        
        bugs_found = len(result.get("bugs_correctly_identified", []))
        bugs_missed = len(result.get("bugs_missed", []))
        false_positives = len(result.get("false_positives", []))
        
        accuracy_score = result.get("accuracy_score", 0)
        if accuracy_score == 0 and bugs_found > 0:
            total_bugs = bugs_found + bugs_missed
            accuracy_score = (bugs_found / total_bugs * 100) if total_bugs > 0 else 0
            if false_positives > 0:
                accuracy_score *= (1 - false_positives * 0.1)
        
        return {
            "identified_bugs": identified_bugs,
            "bugs_found": bugs_found,
            "bugs_missed": bugs_missed,
            "false_positives": false_positives,
            "accuracy_rate": accuracy_score,
            "score": accuracy_score,
            "ai_feedback": result.get("overall_feedback", "Good effort!"),
            "evaluation_details": result
        }
    
    def _fallback_evaluation(self, candidate_analysis: str, expected_bugs: List[Bug]) -> Dict:
        # Parse plain text analysis (new format)
        analysis_lines = candidate_analysis.strip().split('\n')
        identified_bugs = []
        bugs_found = 0
        
        # Handle explicit "no-bugs" sentinel (line_number == 0)
        has_no_bugs_sentinel = any(bug.line_number == 0 for bug in expected_bugs)
        expected_line_numbers = {bug.line_number for bug in expected_bugs if bug.line_number > 0}
        found_line_numbers = set()
        
        for analysis_line in analysis_lines:
            analysis_line = analysis_line.strip()
            if not analysis_line:
                continue
                
            # Extract line number from analysis like "Line 2: description"
            line_match = re.search(r'line\s*(\d+)', analysis_line.lower())
            line_number = int(line_match.group(1)) if line_match else 0
            
            if has_no_bugs_sentinel:
                # In a no-bugs challenge, any claimed bug is a false positive
                is_correct = False
            else:
                is_correct = line_number in expected_line_numbers
            if is_correct and line_number not in found_line_numbers:
                bugs_found += 1
                found_line_numbers.add(line_number)
            
            identified_bugs.append(BugIdentification(
                line_number=line_number,
                comment=analysis_line,
                is_correct=is_correct,
                feedback="Correct bug identification!" if is_correct else ("Duplicate identification" if line_number in found_line_numbers else "No bug found on this line")
            ))
        
        if has_no_bugs_sentinel:
            bugs_missed = 0
            false_positives = len([bug for bug in identified_bugs if not bug.is_correct])
        else:
            bugs_missed = len(expected_line_numbers - found_line_numbers)
            false_positives = len([bug for bug in identified_bugs if not bug.is_correct])
        
        if has_no_bugs_sentinel:
            total_bugs = 0
            # If candidate reports nothing (no lines), perfect score; else penalize
            reported_any = any(line.strip() for line in analysis_lines)
            accuracy = 100.0 if not reported_any else max(0, 100.0 - false_positives * 20)
        else:
            total_bugs = len(expected_bugs)
            accuracy = (bugs_found / total_bugs * 100) if total_bugs > 0 else 0
        
        # Calculate score with penalties for false positives
        if has_no_bugs_sentinel:
            score = accuracy
        else:
            score = max(0, accuracy - (false_positives * 10))
        
        return {
            "identified_bugs": identified_bugs,
            "bugs_found": bugs_found,
            "bugs_missed": bugs_missed,
            "false_positives": false_positives,
            "accuracy_rate": accuracy,
            "score": score,
            "ai_feedback": (
                "This was a trick challenge with no bugs. You correctly reported no issues."
                if has_no_bugs_sentinel and score == 100.0 else
                (f"This was a trick challenge with no bugs. You reported {false_positives} issues that don't exist."
                 if has_no_bugs_sentinel else
                 f"You found {bugs_found} out of {total_bugs} bugs correctly. " +
                 (f"Great job!" if bugs_found == total_bugs else f"Keep practicing to find the remaining {bugs_missed} bugs!")
                )
            ),
            "actual_bugs": (
                [] if has_no_bugs_sentinel else
                [{"line_number": bug.line_number, "description": bug.description} for bug in expected_bugs]
            ),
            "evaluation_details": {
                "method": "fallback",
                "lines_analyzed": len([line for line in analysis_lines if line.strip()])
            }
        }
    
    def calculate_similarity_score(self, text1: str, text2: str) -> float:
        try:
            emb1 = self.embeddings.embed_query(text1)
            emb2 = self.embeddings.embed_query(text2)
            
            import numpy as np
            similarity = np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2))
            return float(similarity)
        except:
            return 0.0