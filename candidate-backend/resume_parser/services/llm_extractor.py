"""
LLM-based resume data extractor.
Uses LLM to extract structured data from resume text.
"""

import logging
import json
from typing import Dict, List, Optional
from pathlib import Path

from ..models.resume import ResumeStruct, Education, Experience
from .summarizer import get_summarizer

logger = logging.getLogger(__name__)


class LLMResumeExtractor:
    """Extract structured resume data using LLM."""
    
    def __init__(self):
        self.summarizer = get_summarizer()
        
    def extract_from_text(self, text: str) -> ResumeStruct:
        """
        Extract structured resume data from text using LLM.
        
        Args:
            text: Resume text content
            
        Returns:
            ResumeStruct with extracted data
        """
        # Create prompt for structured extraction
        extraction_prompt = f"""
Extract the following information from this resume text and return it as JSON:

{{
  "name": "candidate's full name",
  "title": "current or most recent job title",
  "email": "email address",
  "phone": "phone number",
  "location": "city, state or location",
  "education": [
    {{
      "institution": "university/school name",
      "degree": "degree type (BS, MS, etc)",
      "field_of_study": "major/field",
      "year": graduation year as number,
      "gpa": GPA as number or null,
      "location": "location or empty string"
    }}
  ],
  "experience": [
    {{
      "company": "company name",
      "title": "job title",
      "start": "start date",
      "end": "end date or Present",
      "location": "location",
      "highlights": ["bullet point 1", "bullet point 2"]
    }}
  ],
  "skills": {{
    "Programming": ["Python", "Java", etc],
    "Tools": ["Git", "Docker", etc],
    "Other": ["skill1", "skill2"]
  }}
}}

Resume Text:
{text[:3000]}

Extract as much information as possible. If a field is not found, use empty string for strings, empty array for arrays, empty object for objects, and 0 for numbers.

JSON Response:"""
        
        try:
            # Use the summarizer's LLM to extract data
            if hasattr(self.summarizer, '_current_provider') and self.summarizer._current_provider:
                provider = self.summarizer._current_provider
                
                # Create a mock request for the provider
                class ExtractionRequest:
                    def __init__(self, prompt):
                        self.prompt = prompt
                    
                    def to_prompt(self):
                        return self.prompt
                
                request = ExtractionRequest(extraction_prompt)
                response = provider.summarize(request)
                
                # Try to parse JSON from response
                try:
                    # Clean response and find JSON
                    json_str = response.strip()
                    if json_str.startswith('```json'):
                        json_str = json_str[7:]
                    if json_str.startswith('```'):
                        json_str = json_str[3:]
                    if json_str.endswith('```'):
                        json_str = json_str[:-3]
                    
                    data = json.loads(json_str)
                    
                    # Convert to ResumeStruct
                    education_list = []
                    for edu in data.get('education', []):
                        if edu.get('institution'):  # Only add if there's actual data
                            education_list.append(Education(
                                institution=edu.get('institution', ''),
                                degree=edu.get('degree', ''),
                                field_of_study=edu.get('field_of_study', ''),
                                year=edu.get('year', 0),
                                gpa=edu.get('gpa'),
                                location=edu.get('location', '')
                            ))
                    
                    experience_list = []
                    for exp in data.get('experience', []):
                        if exp.get('company') or exp.get('title'):  # Only add if there's actual data
                            experience_list.append(Experience(
                                company=exp.get('company', ''),
                                title=exp.get('title', ''),
                                start=exp.get('start', ''),
                                end=exp.get('end', ''),
                                location=exp.get('location', ''),
                                highlights=exp.get('highlights', [])
                            ))
                    
                    return ResumeStruct(
                        name=data.get('name', 'Unknown'),
                        title=data.get('title', 'Professional'),
                        email=data.get('email', ''),
                        phone=data.get('phone', ''),
                        location=data.get('location', ''),
                        education=education_list,
                        experience=experience_list,
                        skills=data.get('skills', {})
                    )
                    
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse LLM response as JSON: {e}")
                    logger.debug(f"Response was: {response}")
                    
        except Exception as e:
            logger.error(f"LLM extraction failed: {e}")
        
        # Fallback to empty structure
        return ResumeStruct(
            name="Unknown",
            title="Professional",
            email="",
            phone="",
            location="",
            education=[],
            experience=[],
            skills={}
        )


def extract_with_llm(text: str) -> ResumeStruct:
    """
    Convenience function to extract resume data using LLM.
    
    Args:
        text: Resume text
        
    Returns:
        ResumeStruct with extracted data
    """
    extractor = LLMResumeExtractor()
    return extractor.extract_from_text(text)