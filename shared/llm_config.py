"""
Centralized LLM configuration for the TalentAI platform
"""
import os
from typing import Optional
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic

class LLMConfig:
    """Centralized LLM configuration"""
    
    def __init__(self):
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        self.anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
    
    def get_bug_generation_llm(self):
        """Get LLM for bug generation tasks"""
        if self.groq_api_key and self.groq_api_key != "your_groq_api_key_here":
            return ChatGroq(
                groq_api_key=self.groq_api_key,
                model_name="llama-3.3-70b-versatile",
                temperature=0.7,
                max_tokens=2048
            )
        elif self.anthropic_api_key and self.anthropic_api_key != "your_anthropic_api_key_here":
            return ChatAnthropic(
                anthropic_api_key=self.anthropic_api_key,
                model_name="claude-3-haiku-20240307",
                temperature=0.7,
                max_tokens=2048
            )
        elif self.openai_api_key and self.openai_api_key != "your_openai_api_key_here":
            return ChatOpenAI(
                openai_api_key=self.openai_api_key,
                model_name="gpt-3.5-turbo",
                temperature=0.7,
                max_tokens=2048
            )
        else:
            raise ValueError("No valid API key found. Please set GROQ_API_KEY, ANTHROPIC_API_KEY, or OPENAI_API_KEY")
    
    def get_grading_llm(self):
        """Get LLM for grading tasks"""
        if self.groq_api_key and self.groq_api_key != "your_groq_api_key_here":
            return ChatGroq(
                groq_api_key=self.groq_api_key,
                model_name="llama-3.3-70b-versatile",
                temperature=0.0,  # Lower temperature for consistent grading
                max_tokens=1024
            )
        elif self.anthropic_api_key and self.anthropic_api_key != "your_anthropic_api_key_here":
            return ChatAnthropic(
                anthropic_api_key=self.anthropic_api_key,
                model_name="claude-3-haiku-20240307",
                temperature=0.0,
                max_tokens=1024
            )
        elif self.openai_api_key and self.openai_api_key != "your_openai_api_key_here":
            return ChatOpenAI(
                openai_api_key=self.openai_api_key,
                model_name="gpt-3.5-turbo",
                temperature=0.0,
                max_tokens=1024
            )
        else:
            raise ValueError("No valid API key found. Please set GROQ_API_KEY, ANTHROPIC_API_KEY, or OPENAI_API_KEY")

# Global instance
llm_config = LLMConfig()