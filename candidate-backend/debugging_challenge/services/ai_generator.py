from .react_bug_generator import ReActBugGeneratorAgent
from typing import List, Dict, Tuple, Optional
import json
import re
from ..models.challenge import Bug, BugType, DifficultyLevel

class BugGenerator:
    def __init__(self):
        # Use ReAct agent for bug generation with configured model
        self.react_agent = ReActBugGeneratorAgent()
    
    def analyze_skills_for_challenge(self, user_skills: Dict) -> Dict:
        """
        Analyze user skills to determine appropriate challenge parameters
        """
        return self.react_agent.analyze_skills_for_challenge(user_skills)
    
    def generate_bugs(self, clean_code: str, language: str, 
                     difficulty: DifficultyLevel, num_bugs: int,
                     bug_types: List[BugType], user_skills: Optional[Dict] = None) -> Tuple[str, List[Bug]]:
        """
        Generate buggy code using ReAct agent - MUST use dynamic generation
        """
        max_retries = 2
        for attempt in range(max_retries):
            try:
                # Always use ReAct agent for dynamic bug generation
                print(f"Attempting ReAct bug generation (attempt {attempt + 1}/{max_retries})...")
                result = self.react_agent.generate_buggy_code(
                    clean_code=clean_code,
                    language=language,
                    difficulty=difficulty,
                    num_bugs=num_bugs,
                    bug_types=bug_types
                )
                print("ReAct bug generation successful!")
                return result
            except Exception as e:
                print(f"ReAct attempt {attempt + 1} failed: {e}")
                if attempt == max_retries - 1:
                    # Last resort: use fallback but log it as a failure
                    print("WARNING: Using fallback bug injection - this should not happen!")
                    return self._fallback_bug_injection(clean_code, language, difficulty, num_bugs)
    
    def _fallback_bug_injection(self, clean_code: str, language: str,
                               difficulty: DifficultyLevel, num_bugs: int) -> Tuple[str, List[Bug]]:
        """
        CRITICAL ERROR FALLBACK - This should NEVER be called
        If this is called, it means the ReAct agent has completely failed
        """
        
        print("="*60)
        print("CRITICAL ERROR: ReAct agent failed after all retries!")
        print("This is a system failure - AI bug generation is not working")
        print("Returning original code with error marker")
        print("="*60)
        
        # Return the original code unchanged with an error marker
        bugs = [Bug(
            line_number=0,
            bug_type=BugType.LOGIC_ERROR,
            description="SYSTEM ERROR: ReAct agent failed to generate bugs",
            hint="Please restart the service or check AI model configuration"
        )]
        
        return clean_code, bugs