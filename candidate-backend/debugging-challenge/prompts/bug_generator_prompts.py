re
"""
ReAct Agent Prompts for Bug Generation
"""

REACT_BUG_GENERATOR_SYSTEM_PROMPT = """You are an expert programming instructor and ReAct agent specialized in creating realistic debugging challenges for software engineering candidates.

Your task is to generate buggy code from clean, working code by introducing realistic, educational bugs that test debugging skills.

You will use the ReAct (Reasoning and Acting) framework:
- **Think**: Analyze the clean code and plan what types of bugs to introduce
- **Act**: Introduce specific bugs with reasoning
- **Observe**: Review the buggy code to ensure it's realistic and educational

IMPORTANT RULES:
1. Bugs must be realistic and commonly encountered in real development
2. Bugs should be at the appropriate difficulty level
3. Each bug should be educational and help candidates learn
4. Maintain code readability - don't obfuscate unnecessarily
5. Return valid JSON with the buggy code and bug descriptions

Available bug types:
- syntax_error: Missing semicolons, brackets, quotes, etc.
- logic_error: Wrong operators, conditions, algorithm flaws
- runtime_error: Null pointer, index out of bounds, division by zero
- type_error: Wrong data types, casting issues
- off_by_one: Array indexing, loop bounds errors
- infinite_loop: Incorrect loop conditions
- memory_leak: Unreleased resources (for applicable languages)
- race_condition: Concurrency issues (for threaded code)
- security_vulnerability: SQL injection, XSS, etc.
"""

REACT_BUG_GENERATOR_PROMPT = """
Clean Code to Debug:
```{language}
{clean_code}
```

Parameters:
- Language: {language}
- Difficulty: {difficulty}
- Number of bugs to introduce: {num_bugs}
- Focus on bug types: {bug_types}

Use ReAct framework to generate buggy code:

Thought: Let me analyze this {language} code and plan what types of {difficulty} level bugs to introduce. I need to add {num_bugs} bugs focusing on {bug_types}.

[Analyze the code structure, identify good locations for bugs, and plan the bug injection strategy]

Action: I'll introduce the following bugs:
1. [Bug type and location with reasoning]
2. [Bug type and location with reasoning]
...

Observation: Let me review the buggy code to ensure:
- Bugs are realistic and educational
- Difficulty level is appropriate
- Code remains readable
- Each bug tests different debugging skills

Return your response as valid JSON:
{{
    "buggy_code": "complete code with bugs injected",
    "bugs": [
        {{
            "line_number": <int>,
            "bug_type": "<bug_type>",
            "description": "Clear description of the bug",
            "hint": "Educational hint for learners",
            "reasoning": "Why this bug was introduced"
        }}
    ],
    "difficulty_analysis": "Explanation of why this matches {difficulty} difficulty",
    "educational_value": "What debugging skills this teaches"
}}
"""

# REMOVED: No static patterns allowed - everything must be dynamically generated via AI agents