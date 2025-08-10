"""
ReAct Agent for Buggy Code Generation
"""

from shared.llm_config import llm_config
from langchain.agents import Tool, AgentExecutor, create_react_agent
from langchain.prompts import PromptTemplate
from typing import List, Dict, Tuple, Optional
import json
import re
import random
import logging
import os

# Suppress LangChain and Ollama verbose output
logging.getLogger("langchain").setLevel(logging.ERROR)
logging.getLogger("httpx").setLevel(logging.ERROR) 
os.environ.setdefault("LANGCHAIN_VERBOSE", "false")

from ..models.challenge import Bug, BugType, DifficultyLevel
from ..prompts.bug_generator_prompts import (
    REACT_BUG_GENERATOR_SYSTEM_PROMPT, 
    REACT_BUG_GENERATOR_PROMPT
)

class ReActBugGeneratorAgent:
    """
    ReAct agent specialized in generating realistic buggy code from clean code
    Uses reasoning and acting approach to create educational debugging challenges
    """
    
    def __init__(self):
        # Use configured LLM for bug generation
        self.llm = llm_config.get_bug_generation_llm()
        
        # Create tools for the ReAct agent
        self.tools = self._create_tools()
        
        # Create the ReAct agent
        self.agent_prompt = PromptTemplate.from_template(
            REACT_BUG_GENERATOR_PROMPT + """
            
You have access to the following tools:
{tools}

Tool names: {tool_names}

Use the following format:
Thought: [Your reasoning about what to do next]
Action: [tool_name]
Action Input: [input to the tool]
Observation: [result of the action]
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now have the complete buggy code and analysis
Final Answer: [JSON response with buggy code and bugs]

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
            verbose=True,  # Enable verbose to see what's happening
            handle_parsing_errors=True,
            max_iterations=5,  # Allow more iterations with longer timeout
            max_execution_time=120  # 2 minute max execution time
        )
    
    def _create_tools(self) -> List[Tool]:
        """Create tools for the ReAct agent"""
        
        def analyze_code_structure(code: str) -> str:
            """Analyze code structure to identify good locations for bug injection"""
            lines = code.split('\n')
            analysis = {
                "total_lines": len(lines),
                "functions": [],
                "loops": [],
                "conditions": [],
                "assignments": [],
                "potential_bug_locations": []
            }
            
            for i, line in enumerate(lines, 1):
                stripped = line.strip().lower()
                if any(keyword in stripped for keyword in ['def ', 'function ', 'class ']):
                    analysis["functions"].append(f"Line {i}: Function/class definition")
                if any(keyword in stripped for keyword in ['for ', 'while ']):
                    analysis["loops"].append(f"Line {i}: Loop structure")
                if any(keyword in stripped for keyword in ['if ', 'elif ', 'else']):
                    analysis["conditions"].append(f"Line {i}: Conditional statement")
                if '=' in line and not any(op in line for op in ['==', '!=', '<=', '>=']):
                    analysis["assignments"].append(f"Line {i}: Assignment statement")
                
                # Identify high-value bug locations
                if any(pattern in stripped for pattern in ['range(', 'len(', 'for i in', '==', '!=']):
                    analysis["potential_bug_locations"].append(f"Line {i}: High-value bug location")
            
            return json.dumps(analysis, indent=2)
        
        def select_bug_types(difficulty: str, requested_types: str, num_bugs: int) -> str:
            """Select appropriate bug types based on difficulty and requirements"""
            all_bug_types = list(BugType.__members__.keys())
            
            difficulty_mapping = {
                "easy": ["SYNTAX_ERROR", "LOGIC_ERROR", "OFF_BY_ONE"],
                "medium": ["LOGIC_ERROR", "RUNTIME_ERROR", "TYPE_ERROR", "OFF_BY_ONE"],
                "hard": ["RUNTIME_ERROR", "MEMORY_LEAK", "RACE_CONDITION", "SECURITY_VULNERABILITY"]
            }
            
            suitable_types = difficulty_mapping.get(difficulty.lower(), all_bug_types)
            requested_list = [t.strip().upper() for t in requested_types.split(',')]
            
            # Filter suitable types by requested types
            selected = [t for t in suitable_types if t in requested_list] if requested_list else suitable_types
            
            # Ensure we have enough types
            if len(selected) < num_bugs:
                selected.extend(all_bug_types)
            
            return json.dumps({
                "recommended_bug_types": selected[:num_bugs],
                "difficulty_rationale": f"Selected {difficulty} level bugs",
                "type_descriptions": {bt: getattr(BugType, bt).value for bt in selected[:num_bugs] if hasattr(BugType, bt)}
            }, indent=2)
        
        def inject_bug(code: str, line_num: int, bug_type: str, description: str) -> str:
            """Inject a specific bug into code at specified location"""
            lines = code.split('\n')
            if 1 <= line_num <= len(lines):
                original_line = lines[line_num - 1]
                
                # Apply bug injection based on type
                if bug_type.lower() == "off_by_one":
                    if "range(len(" in original_line:
                        modified_line = original_line.replace("range(len(", "range(len(").replace("))", ") - 1)")
                    else:
                        modified_line = original_line.replace("[i]", "[i+1]").replace("[0]", "[1]")
                elif bug_type.lower() == "logic_error":
                    modified_line = original_line.replace("==", "=").replace("+=", "=").replace("and", "or")
                elif bug_type.lower() == "syntax_error":
                    if ":" in original_line:
                        modified_line = original_line.replace(":", "")
                    else:
                        modified_line = original_line + " # missing semicolon"
                else:
                    # Generic modification
                    modified_line = f"{original_line}  # BUG: {description}"
                
                lines[line_num - 1] = modified_line
                return '\n'.join(lines)
            return code
        
        return [
            Tool(
                name="analyze_code_structure",
                description="Analyze code structure to identify good locations for bug injection",
                func=analyze_code_structure
            ),
            Tool(
                name="select_bug_types",
                description="Select appropriate bug types based on difficulty: difficulty,requested_types,num_bugs",
                func=lambda input_str: select_bug_types(*input_str.split(',', 2))
            ),
            Tool(
                name="inject_bug",
                description="Inject specific bug into code: code,line_num,bug_type,description",
                func=lambda input_str: inject_bug(*input_str.split(',', 3))
            )
        ]
    
    def generate_buggy_code(self, clean_code: str, language: str, 
                           difficulty: DifficultyLevel, num_bugs: int,
                           bug_types: List[BugType]) -> Tuple[str, List[Bug]]:
        """
        Generate buggy code directly - creates code with bugs in one step
        """
        
        bug_types_str = ", ".join([bt.value for bt in bug_types])
        
        try:
            # Use Claude directly without ReAct agent for simpler implementation
            prompt = f"""Generate a Python function with exactly {num_bugs} bugs.
Difficulty: {difficulty.value}
Bug types to include: {", ".join([bt.value for bt in bug_types])}

Return ONLY valid JSON:
{{
    "buggy_code": "def function_name():\\n    # Complete Python code with {num_bugs} bugs",
    "bugs": [
        {{
            "line_number": 3,
            "bug_type": "{bug_types[0].value if bug_types else 'logic_error'}",
            "description": "Clear description",
            "hint": "Helpful hint"
        }}
    ]
}}"""
            
            # Call configured LLM
            response = self.llm.invoke(prompt)
            
            # Extract the content from response
            if hasattr(response, 'content'):
                response_text = response.content
            else:
                response_text = str(response)
            
            # Extract JSON from response
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                parsed_result = json.loads(json_match.group())
                
                bugs = []
                for bug_data in parsed_result.get("bugs", []):
                    bug = Bug(
                        line_number=bug_data["line_number"],
                        bug_type=BugType(bug_data["bug_type"]),
                        description=bug_data["description"],
                        hint=bug_data.get("hint", ""),
                    )
                    bugs.append(bug)
                
                return parsed_result["buggy_code"], bugs
            else:
                raise ValueError("No valid JSON in response")
                
        except Exception as e:
            print(f"Direct LLM call failed: {e}")
            # Fallback
            return self._fallback_generation(clean_code, language, difficulty, num_bugs)
    
    def _fallback_generation(self, clean_code: str, language: str, 
                            difficulty: DifficultyLevel, num_bugs: int) -> Tuple[str, List[Bug]]:
        """Emergency fallback - this should NEVER be used in production"""
        
        print("CRITICAL ERROR: ReAct agent failed completely - returning code with no bugs")
        print("This indicates a serious problem with the AI model or configuration")
        
        # Return the original code unchanged with a special "no bugs" marker
        bugs = [Bug(
            line_number=0,
            bug_type=BugType.LOGIC_ERROR,
            description="ReAct agent failed - no bugs generated",
            hint="System error - please retry",
        )]
        
        return clean_code, bugs

# Usage example and testing
def test_react_bug_generator():
    """Test the ReAct bug generator"""
    
    generator = ReActBugGeneratorAgent()
    
    clean_code = """def calculate_sum(numbers):
    total = 0
    for i in range(len(numbers)):
        total += numbers[i]
    return total

def main():
    arr = [1, 2, 3, 4, 5]
    result = calculate_sum(arr)
    if result == 15:
        print("Test passed!")
    else:
        print("Test failed!")
"""
    
    buggy_code, bugs = generator.generate_buggy_code(
        clean_code=clean_code,
        language="python",
        difficulty=DifficultyLevel.EASY,
        num_bugs=3,
        bug_types=[BugType.LOGIC_ERROR, BugType.OFF_BY_ONE, BugType.SYNTAX_ERROR]
    )
    
    print("Generated Buggy Code:")
    print(buggy_code)
    print("\nIdentified Bugs:")
    for bug in bugs:
        print(f"Line {bug.line_number}: {bug.description}")

if __name__ == "__main__":
    test_react_bug_generator()