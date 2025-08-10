"""
LLM client for multiple providers (Ollama, LM Studio, Groq)
"""
import httpx
import asyncio
from typing import Dict, Any, Optional, List
from ..config.settings import settings


class LLMClient:
    """Multi-provider LLM client"""
    
    def __init__(self):
        self.provider = settings.llm_provider
        self.ollama_base_url = settings.ollama_base_url
        self.ollama_model = settings.ollama_model
        self.lm_studio_url = settings.lm_studio_url
        self.groq_api_key = settings.groq_api_key
        self.groq_model = settings.groq_model
    
    async def generate(
        self, 
        prompt: str, 
        provider: Optional[str] = None,
        **kwargs
    ) -> str:
        """
        Generate text using the specified LLM provider
        
        Args:
            prompt: Input prompt
            provider: LLM provider (ollama, lm_studio, groq)
            **kwargs: Additional parameters for the LLM
            
        Returns:
            Generated text response
        """
        provider = provider or self.provider
        
        if provider == "ollama":
            return await self._generate_ollama(prompt, **kwargs)
        elif provider == "lm_studio":
            return await self._generate_lm_studio(prompt, **kwargs)
        elif provider == "groq":
            return await self._generate_groq(prompt, **kwargs)
        else:
            raise ValueError(f"Unsupported LLM provider: {provider}")
    
    async def _generate_ollama(self, prompt: str, **kwargs) -> str:
        """Generate text using Ollama"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.ollama_base_url}/api/generate",
                    json={
                        "model": self.ollama_model,
                        "prompt": prompt,
                        "stream": False,
                        **kwargs
                    },
                    timeout=60.0
                )
                response.raise_for_status()
                result = response.json()
                return result.get("response", "")
        except Exception as e:
            print(f"Ollama generation error: {e}")
            return f"Error generating response: {str(e)}"
    
    async def _generate_lm_studio(self, prompt: str, **kwargs) -> str:
        """Generate text using LM Studio"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.lm_studio_url}/v1/chat/completions",
                    json={
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": kwargs.get("temperature", 0.7),
                        "max_tokens": kwargs.get("max_tokens", 1000),
                        "stream": False
                    },
                    timeout=60.0
                )
                response.raise_for_status()
                result = response.json()
                return result.get("choices", [{}])[0].get("message", {}).get("content", "")
        except Exception as e:
            print(f"LM Studio generation error: {e}")
            return f"Error generating response: {str(e)}"
    
    async def _generate_groq(self, prompt: str, **kwargs) -> str:
        """Generate text using Groq"""
        if not self.groq_api_key:
            return "Groq API key not configured"
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.groq_api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.groq_model,
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": kwargs.get("temperature", 0.7),
                        "max_tokens": kwargs.get("max_tokens", 1000)
                    },
                    timeout=60.0
                )
                response.raise_for_status()
                result = response.json()
                return result.get("choices", [{}])[0].get("message", {}).get("content", "")
        except Exception as e:
            print(f"Groq generation error: {e}")
            return f"Error generating response: {str(e)}"
    
    async def generate_interview_questions(
        self, 
        job_title: str, 
        job_description: str,
        candidate_level: str = "mid"
    ) -> List[str]:
        """Generate interview questions for a specific job"""
        prompt = f"""
        Generate 5 relevant interview questions for a {candidate_level} level {job_title} position.
        
        Job Description:
        {job_description}
        
        Please provide questions that assess:
        1. Technical skills
        2. Problem-solving abilities
        3. Team collaboration
        4. Industry knowledge
        5. Career goals
        
        Format as a simple list of questions.
        """
        
        response = await self.generate(prompt)
        # Simple parsing - split by newlines and clean up
        questions = [q.strip() for q in response.split('\n') if q.strip() and '?' in q]
        return questions[:5]  # Return max 5 questions
    
    async def analyze_candidate_fit(
        self, 
        job_requirements: str, 
        candidate_summary: str
    ) -> Dict[str, Any]:
        """Analyze candidate fit for a job using LLM"""
        prompt = f"""
        Analyze the fit between a candidate and a job posting.
        
        Job Requirements:
        {job_requirements}
        
        Candidate Summary:
        {candidate_summary}
        
        Provide analysis in the following format:
        - Overall Fit Score (0-100)
        - Key Strengths
        - Areas of Concern
        - Specific Recommendations
        - Interview Priority (High/Medium/Low)
        """
        
        response = await self.generate(prompt)
        
        # Parse the response (simplified for now)
        return {
            "analysis": response,
            "overall_fit": "To be parsed from response",
            "strengths": [],
            "concerns": [],
            "recommendations": "",
            "interview_priority": "Medium"
        }
