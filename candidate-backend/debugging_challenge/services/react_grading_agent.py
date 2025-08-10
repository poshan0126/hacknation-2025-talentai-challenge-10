"""
ReAct Agent for Auto-Grading Bug Analysis Submissions
"""

from shared.llm_config import llm_config
from langchain.agents import Tool, AgentExecutor, create_react_agent
from langchain.prompts import PromptTemplate
from typing import List, Dict, Any, Optional
import json
import re
import difflib
import logging
import os

# Suppress LangChain and Ollama verbose output
logging.getLogger("langchain").setLevel(logging.ERROR)
logging.getLogger("httpx").setLevel(logging.ERROR)
os.environ.setdefault("LANGCHAIN_VERBOSE", "false")

from ..models.submission import BugIdentification
from ..models.challenge import Bug
from ..prompts.grading_agent_prompts import (
    REACT_GRADING_SYSTEM_PROMPT,
    REACT_GRADING_PROMPT
)

class ReActGradingAgent:
    """
    ReAct agent specialized in grading candidate bug analysis submissions
    Uses reasoning and acting approach to provide fair and educational evaluation
    """
    
    def __init__(self):
        # Use configured LLM for grading
        self.llm = llm_config.get_grading_llm()
        
        # Create tools for the ReAct agent
        self.tools = self._create_tools()
        
        # Create the ReAct agent
        self.agent_prompt = PromptTemplate.from_template(
            REACT_GRADING_PROMPT + """
            
You have access to the following tools:
{tools}

Tool names: {tool_names}

Use the following format:
Thought: [Your reasoning about how to evaluate this submission]
Action: [tool_name]
Action Input: [input to the tool]
Observation: [result of the action]
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now have completed the evaluation
Final Answer: [JSON response with detailed grading results]

{agent_scratchpad}
"""
        )
        
        self.agent = create_react_agent(
            llm=self.llm,
            tools=self.tools,
            prompt=self.agent_prompt
        )
        
        self.agent_executor = AgentExecutor(
            agent=self.agent,
            tools=self.tools,
            verbose=True,  # Enable verbose for debugging
            handle_parsing_errors=True,
            max_iterations=5,  # Allow more iterations with longer timeout
            max_execution_time=120  # 2 minute max execution time
        )
    
    def _create_tools(self) -> List[Tool]:
        """Create tools for the ReAct grading agent"""
        
        def parse_candidate_analysis(analysis: str) -> str:
            """Parse candidate's analysis into structured bug identifications"""
            lines = analysis.strip().split('\n')
            parsed_bugs = []
            
            for line_text in lines:
                line_text = line_text.strip()
                if not line_text:
                    continue
                
                # Extract line number references
                line_match = re.search(r'line\s*(\d+)', line_text.lower())
                line_number = int(line_match.group(1)) if line_match else None
                
                # AI will identify patterns dynamically - no static patterns
                parsed_bugs.append({
                    "original_text": line_text,
                    "line_number": line_number,
                    "word_count": len(line_text.split())
                })
            
            return json.dumps({
                "total_identifications": len(parsed_bugs),
                "parsed_bugs": parsed_bugs,
                "has_line_references": sum(1 for b in parsed_bugs if b["line_number"]) > 0,
                "average_detail_level": sum(b["word_count"] for b in parsed_bugs) / len(parsed_bugs) if parsed_bugs else 0
            }, indent=2)
        
        def match_against_ground_truth(candidate_bugs: str, ground_truth: str) -> str:
            """Match candidate identifications against ground truth bugs"""
            candidate_data = json.loads(candidate_bugs)
            ground_truth_bugs = json.loads(ground_truth)
            
            matches = []
            unmatched_ground_truth = list(range(len(ground_truth_bugs)))
            false_positives = []
            
            for candidate_bug in candidate_data["parsed_bugs"]:
                best_match = None
                best_score = 0
                best_gt_index = None
                
                for gt_index, gt_bug in enumerate(ground_truth_bugs):
                    if gt_index not in unmatched_ground_truth:
                        continue
                    
                    score = self._calculate_match_score(candidate_bug, gt_bug)
                    if score > best_score and score > 0.3:  # Threshold for considering a match
                        best_match = gt_bug
                        best_score = score
                        best_gt_index = gt_index
                
                if best_match:
                    matches.append({
                        "candidate": candidate_bug,
                        "ground_truth": best_match,
                        "match_score": best_score,
                        "match_type": self._classify_match_quality(best_score)
                    })
                    unmatched_ground_truth.remove(best_gt_index)
                else:
                    false_positives.append(candidate_bug)
            
            # Remaining ground truth bugs are missed
            missed_bugs = [ground_truth_bugs[i] for i in unmatched_ground_truth]
            
            return json.dumps({
                "matches": matches,
                "false_positives": false_positives,
                "missed_bugs": missed_bugs,
                "match_statistics": {
                    "total_matches": len(matches),
                    "perfect_matches": len([m for m in matches if m["match_type"] == "perfect"]),
                    "good_matches": len([m for m in matches if m["match_type"] == "good"]),
                    "partial_matches": len([m for m in matches if m["match_type"] == "partial"]),
                    "false_positive_count": len(false_positives),
                    "missed_count": len(missed_bugs)
                }
            }, indent=2)
        
        def calculate_final_score(match_results: str, total_possible_bugs: int) -> str:
            """Calculate final score based on matching results"""
            results = json.loads(match_results)
            matches = results["matches"]
            stats = results["match_statistics"]
            
            # Calculate weighted score
            total_points = 0
            max_possible_points = total_possible_bugs * 100
            
            for match in matches:
                match_type = match["match_type"]
                if match_type == "perfect":
                    points = 100
                elif match_type == "good":
                    points = 80
                elif match_type == "partial":
                    points = 50
                else:
                    points = 30
                total_points += points
            
            # Apply penalties for false positives
            false_positive_penalty = min(stats["false_positive_count"] * 10, 30)
            total_points = max(0, total_points - false_positive_penalty)
            
            # Calculate percentages
            final_score = min(100, (total_points / max_possible_points) * 100) if max_possible_points > 0 else 0
            accuracy_rate = (stats["total_matches"] / total_possible_bugs * 100) if total_possible_bugs > 0 else 0
            
            return json.dumps({
                "final_score": round(final_score, 1),
                "accuracy_rate": round(accuracy_rate, 1),
                "total_points_earned": total_points,
                "max_possible_points": max_possible_points,
                "bugs_found": stats["total_matches"],
                "bugs_missed": stats["missed_count"],
                "false_positives": stats["false_positive_count"],
                "score_breakdown": {
                    "perfect_matches": stats["perfect_matches"],
                    "good_matches": stats["good_matches"],
                    "partial_matches": stats["partial_matches"],
                    "false_positive_penalty": false_positive_penalty
                }
            }, indent=2)
        
        def generate_feedback(match_results: str, score_data: str) -> str:
            """Generate constructive feedback for the candidate"""
            results = json.loads(match_results)
            scores = json.loads(score_data)
            
            # Determine grade level
            score = scores["final_score"]
            if score >= 90:
                grade_level = "excellent"
            elif score >= 75:
                grade_level = "good"
            elif score >= 60:
                grade_level = "fair"
            else:
                grade_level = "needs_improvement"
            
            # Generate specific feedback
            strengths = []
            improvements = []
            
            if scores["score_breakdown"]["perfect_matches"] > 0:
                strengths.append("Identified bugs with precise accuracy and clear explanations")
            if scores["bugs_found"] > scores["bugs_missed"]:
                strengths.append("Found majority of the bugs in the code")
            if scores["false_positives"] == 0:
                strengths.append("Avoided false positive identifications")
            
            if scores["bugs_missed"] > 0:
                improvements.append(f"Missed {scores['bugs_missed']} bugs - review the code more thoroughly")
            if scores["false_positives"] > 0:
                improvements.append(f"Identified {scores['false_positives']} non-existent bugs - be more careful")
            if scores["score_breakdown"]["partial_matches"] > scores["score_breakdown"]["perfect_matches"]:
                improvements.append("Provide more specific and detailed bug descriptions")
            
            return json.dumps({
                "grade_level": grade_level,
                "overall_feedback": f"AI-generated feedback for {grade_level} performance",
                "strengths": strengths if strengths else ["Attempted the analysis"],
                "improvements": improvements if improvements else ["Keep practicing!"],
                "learning_insights": [
                    "Focus on systematic code review techniques",
                    "Pay attention to common bug patterns",
                    "Be specific about bug locations and causes"
                ]
            }, indent=2)
        
        return [
            Tool(
                name="parse_candidate_analysis",
                description="Parse candidate's text analysis into structured bug identifications",
                func=parse_candidate_analysis
            ),
            Tool(
                name="match_against_ground_truth",
                description="Match candidate identifications against ground truth bugs: candidate_bugs,ground_truth",
                func=lambda input_str: match_against_ground_truth(*json.loads(f'[{input_str}]') if input_str.startswith('{') else input_str.split(',', 1))
            ),
            Tool(
                name="calculate_final_score",
                description="Calculate final score based on matching results: match_results,total_bugs",
                func=lambda input_str: calculate_final_score(*input_str.split(',', 1))
            ),
            Tool(
                name="generate_feedback",
                description="Generate constructive feedback: match_results,score_data",
                func=lambda input_str: generate_feedback(*input_str.split(',', 1))
            )
        ]
    
    def _calculate_match_score(self, candidate_bug: Dict, ground_truth_bug: Dict) -> float:
        """Calculate similarity score between candidate identification and ground truth"""
        score = 0.0
        
        # Line number match (30% weight)
        if candidate_bug.get("line_number") == ground_truth_bug.get("line_number"):
            score += 0.3
        elif candidate_bug.get("line_number") and ground_truth_bug.get("line_number"):
            # Close line numbers get partial credit
            diff = abs(candidate_bug["line_number"] - ground_truth_bug["line_number"])
            if diff <= 2:
                score += 0.3 * (1 - diff/3)
        
        # Text similarity (40% weight)
        candidate_text = candidate_bug["original_text"].lower()
        gt_description = ground_truth_bug.get("description", "").lower()
        
        similarity = difflib.SequenceMatcher(None, candidate_text, gt_description).ratio()
        score += 0.4 * similarity
        
        # Pattern match (30% weight)
        gt_bug_type = ground_truth_bug.get("bug_type", "").lower()
        pattern_matches = 0
        for pattern in candidate_bug.get("detected_patterns", []):
            if any(keyword in gt_bug_type for keyword in pattern.split('_')):
                pattern_matches += 1
        
        if candidate_bug.get("detected_patterns"):
            score += 0.3 * (pattern_matches / len(candidate_bug["detected_patterns"]))
        
        return min(1.0, score)
    
    def _classify_match_quality(self, score: float) -> str:
        """Classify match quality based on score"""
        if score >= 0.9:
            return "perfect"
        elif score >= 0.7:
            return "good" 
        elif score >= 0.5:
            return "partial"
        else:
            return "poor"
    
    def grade_submission(self, candidate_analysis: str, expected_bugs: List[Bug], 
                        buggy_code: str, language: str) -> Dict[str, Any]:
        """
        Grade a candidate's bug analysis submission using ReAct agent
        """
        
        # Convert expected bugs to JSON format
        ground_truth = json.dumps([{
            "line_number": bug.line_number,
            "bug_type": bug.bug_type.value,
            "description": bug.description,
            "hint": bug.hint
        } for bug in expected_bugs])
        
        try:
            # Execute the ReAct grading agent
            result = self.agent_executor.invoke({
                "candidate_analysis": candidate_analysis,
                "expected_bugs": ground_truth,
                "buggy_code": buggy_code,
                "language": language
            })
            
            # Parse agent output
            agent_output = result.get("output", "")
            
            # Extract JSON from agent output
            json_match = re.search(r'\{.*\}', agent_output, re.DOTALL)
            if json_match:
                evaluation_result = json.loads(json_match.group())
                return self._process_evaluation_result(evaluation_result, candidate_analysis)
            else:
                raise ValueError("Agent did not return valid JSON")
                
        except Exception as e:
            # Silently fallback to simple evaluation
            return self._fallback_evaluation(candidate_analysis, expected_bugs)
    
    def _process_evaluation_result(self, result: Dict, candidate_analysis: str) -> Dict:
        """Process and format the evaluation result"""
        
        identified_bugs = []
        for detail in result.get("detailed_evaluation", []):
            identified_bugs.append(BugIdentification(
                line_number=detail.get("line_number", 0),
                comment=detail.get("candidate_response", ""),
                is_correct=detail.get("match_type") in ["perfect", "good"],
                feedback=detail.get("feedback", "")
            ))
        
        return {
            "identified_bugs": identified_bugs,
            "bugs_found": result.get("bugs_found", 0),
            "bugs_missed": result.get("bugs_missed", 0), 
            "false_positives": result.get("false_positives", 0),
            "accuracy_rate": result.get("accuracy_rate", 0),
            "score": result.get("total_score", 0),
            "ai_feedback": result.get("overall_feedback", ""),
            "evaluation_details": result
        }
    
    def _fallback_evaluation(self, candidate_analysis: str, expected_bugs: List[Bug]) -> Dict:
        """Simple fallback evaluation when ReAct agent fails"""
        
        analysis_lines = candidate_analysis.strip().split('\n')
        identified_bugs = []
        bugs_found = 0
        
        has_no_bugs_sentinel = any(bug.line_number == 0 for bug in expected_bugs)
        for line in analysis_lines:
            if line.strip():
                # Simple line number extraction
                line_match = re.search(r'line\s*(\d+)', line.lower())
                line_number = int(line_match.group(1)) if line_match else 0
                
                # Check if this roughly matches any expected bug
                if has_no_bugs_sentinel:
                    is_correct = False
                else:
                    is_correct = any(
                        abs(bug.line_number - line_number) <= 1 for bug in expected_bugs
                    ) if line_number > 0 else False
                
                if is_correct:
                    bugs_found += 1
                
                identified_bugs.append(BugIdentification(
                    line_number=line_number,
                    comment=line.strip(),
                    is_correct=is_correct,
                    feedback="Basic evaluation - enable AI for detailed feedback"
                ))
        
        if has_no_bugs_sentinel:
            bugs_missed = 0
            false_positives_count = len(identified_bugs)
            accuracy = 100.0 if false_positives_count == 0 else max(0, 100.0 - false_positives_count * 20)
        else:
            bugs_missed = max(0, len(expected_bugs) - bugs_found)
            accuracy = (bugs_found / len(expected_bugs) * 100) if expected_bugs else 0
        
        return {
            "identified_bugs": identified_bugs,
            "bugs_found": bugs_found,
            "bugs_missed": bugs_missed,
            "false_positives": len(identified_bugs) - bugs_found,
            "accuracy_rate": accuracy,
            "score": accuracy,
            "ai_feedback": (
                "This was a trick challenge with no bugs. You correctly reported no issues."
                if has_no_bugs_sentinel and accuracy == 100.0 else
                (f"This was a trick challenge with no bugs. You reported {len(identified_bugs)} issues that don't exist."
                 if has_no_bugs_sentinel else
                 f"Found {bugs_found} out of {len(expected_bugs)} bugs. Basic evaluation completed.")
            ),
            "evaluation_details": {"method": "fallback"}
        }

# Testing function
def test_react_grading_agent():
    """Test the ReAct grading agent"""
    
    grader = ReActGradingAgent()
    
    candidate_analysis = """Line 3: Off-by-one error in the range function, should not subtract 1
Line 4: Using assignment operator instead of addition operator
Line 12: Using assignment instead of comparison operator"""
    
    expected_bugs = [
        Bug(line_number=3, bug_type="off_by_one", description="Range function off by one", hint="Check loop bounds"),
        Bug(line_number=4, bug_type="logic_error", description="Assignment instead of addition", hint="Check operators"),
        Bug(line_number=12, bug_type="syntax_error", description="Assignment instead of comparison", hint="Check equality")
    ]
    
    buggy_code = """def calculate_sum(numbers):
    total = 0
    for i in range(len(numbers) - 1):  # Bug here
        total = numbers[i]  # Bug here
    return total

def main():
    arr = [1, 2, 3, 4, 5]
    result = calculate_sum(arr)
    if result = 15:  # Bug here
        print("Test passed!")
"""
    
    result = grader.grade_submission(candidate_analysis, expected_bugs, buggy_code, "python")
    
    print("Grading Result:")
    print(f"Score: {result['score']}")
    print(f"Accuracy: {result['accuracy_rate']}%")
    print(f"Feedback: {result['ai_feedback']}")

if __name__ == "__main__":
    test_react_grading_agent()