"""
PDF to Markdown converter for resume parsing.
Handles PDF extraction and conversion to markdown format for processing.
"""

import logging
import re
from pathlib import Path
from typing import Optional, List
import tempfile
import subprocess

logger = logging.getLogger(__name__)

try:
    import pymupdf  # PyMuPDF
    HAS_PYMUPDF = True
except ImportError:
    HAS_PYMUPDF = False
    logger.warning("PyMuPDF not installed. PDF parsing will be limited.")

try:
    import pdfplumber
    HAS_PDFPLUMBER = True
except ImportError:
    HAS_PDFPLUMBER = False
    logger.warning("pdfplumber not installed. PDF parsing will be limited.")


class PDFToMarkdownConverter:
    """Converts PDF resumes to markdown format for parsing."""
    
    def __init__(self):
        self.section_headers = [
            "CONTACT", "EDUCATION", "EXPERIENCE", "SKILLS", "PROJECTS",
            "SUMMARY", "OBJECTIVE", "CERTIFICATIONS", "AWARDS", "PUBLICATIONS"
        ]
        
    def convert_pdf_to_markdown(self, pdf_path: Path) -> str:
        """
        Convert a PDF file to markdown format.
        
        Args:
            pdf_path: Path to PDF file
            
        Returns:
            Markdown formatted text
        """
        if not pdf_path.exists():
            raise FileNotFoundError(f"PDF file not found: {pdf_path}")
            
        # Try PyMuPDF first (better formatting)
        if HAS_PYMUPDF:
            try:
                return self._convert_with_pymupdf(pdf_path)
            except Exception as e:
                logger.warning(f"PyMuPDF conversion failed: {e}")
                
        # Fallback to pdfplumber
        if HAS_PDFPLUMBER:
            try:
                return self._convert_with_pdfplumber(pdf_path)
            except Exception as e:
                logger.warning(f"pdfplumber conversion failed: {e}")
                
        # Last resort: use system pdftotext if available
        try:
            return self._convert_with_pdftotext(pdf_path)
        except Exception as e:
            logger.error(f"All PDF conversion methods failed: {e}")
            raise RuntimeError("Unable to convert PDF. Please install pymupdf or pdfplumber.")
    
    def _convert_with_pymupdf(self, pdf_path: Path) -> str:
        """Convert PDF using PyMuPDF library."""
        import pymupdf
        
        doc = pymupdf.open(str(pdf_path))
        markdown_lines = []
        
        for page_num, page in enumerate(doc):
            text = page.get_text()
            
            # Process text into markdown
            lines = text.split('\n')
            processed_lines = self._process_lines_to_markdown(lines)
            markdown_lines.extend(processed_lines)
            
            if page_num < len(doc) - 1:
                markdown_lines.append("\n---\n")  # Page separator
                
        doc.close()
        return '\n'.join(markdown_lines)
    
    def _convert_with_pdfplumber(self, pdf_path: Path) -> str:
        """Convert PDF using pdfplumber library."""
        import pdfplumber
        
        markdown_lines = []
        
        with pdfplumber.open(str(pdf_path)) as pdf:
            for page_num, page in enumerate(pdf.pages):
                text = page.extract_text()
                
                if text:
                    lines = text.split('\n')
                    processed_lines = self._process_lines_to_markdown(lines)
                    markdown_lines.extend(processed_lines)
                    
                    if page_num < len(pdf.pages) - 1:
                        markdown_lines.append("\n---\n")
                        
        return '\n'.join(markdown_lines)
    
    def _convert_with_pdftotext(self, pdf_path: Path) -> str:
        """Convert PDF using system pdftotext command."""
        try:
            result = subprocess.run(
                ['pdftotext', '-layout', str(pdf_path), '-'],
                capture_output=True,
                text=True,
                check=True
            )
            
            lines = result.stdout.split('\n')
            processed_lines = self._process_lines_to_markdown(lines)
            return '\n'.join(processed_lines)
            
        except (subprocess.CalledProcessError, FileNotFoundError) as e:
            raise RuntimeError(f"pdftotext command failed: {e}")
    
    def _process_lines_to_markdown(self, lines: List[str]) -> List[str]:
        """
        Process raw text lines into markdown format.
        
        Args:
            lines: List of text lines from PDF
            
        Returns:
            List of markdown formatted lines
        """
        markdown_lines = []
        current_section = None
        name_found = False
        in_experience = False
        
        for i, line in enumerate(lines):
            line = line.strip()
            
            if not line:
                continue
            
            # Clean up common PDF artifacts
            line = line.replace('ï¼​', '-').replace('Â ', ' ')
                
            # Check if this looks like a name (first non-empty line, all caps)
            if not name_found and i < 5 and line.isupper() and len(line.split()) <= 4:
                markdown_lines.append(f"# {line.title()}")
                name_found = True
                continue
                
            # Check for common section headers
            line_lower = line.lower()
            if any(header in line_lower for header in ['career focus', 'objective', 'summary']):
                markdown_lines.append(f"\n## Summary")
                current_section = "SUMMARY"
                continue
            elif 'professional experience' in line_lower or 'work experience' in line_lower:
                markdown_lines.append(f"\n## Experience")
                current_section = "EXPERIENCE"
                in_experience = True
                continue
            elif 'education' in line_lower and len(line.split()) <= 3:
                markdown_lines.append(f"\n## Education")
                current_section = "EDUCATION"
                in_experience = False
                continue
            elif any(skill in line_lower for skill in ['skills', 'technical skills', 'core competencies']):
                markdown_lines.append(f"\n## Skills")
                current_section = "SKILLS"
                in_experience = False
                continue
                
            # Process experience entries (look for date patterns)
            if in_experience and any(month in line for month in ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']):
                # This might be a job title line
                markdown_lines.append(f"\n- **{line}**")
                continue
            
            # Check if line contains "Company Name" or similar
            if 'Company Name' in line:
                markdown_lines.append(f"  Company: {line.replace('Company Name', '').strip()}")
                continue
                
            # Process based on current section
            if current_section:
                if current_section == "SUMMARY":
                    markdown_lines.append(line)
                elif current_section == "EXPERIENCE":
                    if line.startswith('•') or line.startswith('-'):
                        markdown_lines.append(f"  {line}")
                    else:
                        markdown_lines.append(f"  - {line}")
                elif current_section == "EDUCATION":
                    markdown_lines.append(f"- {line}")
                elif current_section == "SKILLS":
                    # Try to categorize skills
                    if ':' in line:
                        markdown_lines.append(f"- {line}")
                    else:
                        markdown_lines.append(f"- Technical: {line}")
                else:
                    markdown_lines.append(line)
            else:
                # Content before any section - might be title
                if 'technician' in line_lower or 'engineer' in line_lower or 'developer' in line_lower:
                    markdown_lines.append(f"Title: {line}")
                else:
                    markdown_lines.append(line)
                
        return markdown_lines
    
    def _is_likely_name(self, line: str) -> bool:
        """Check if a line is likely a person's name."""
        # Simple heuristic: 2-4 words, each starting with capital
        words = line.split()
        if 2 <= len(words) <= 4:
            return all(word[0].isupper() for word in words if word)
        return False
    
    def _is_likely_title(self, line: str) -> bool:
        """Check if a line is likely a job title."""
        title_keywords = [
            "Engineer", "Developer", "Manager", "Analyst", "Designer",
            "Scientist", "Architect", "Consultant", "Specialist", "Lead"
        ]
        return any(keyword in line for keyword in title_keywords)
    
    def _is_section_header(self, line: str) -> bool:
        """Check if a line is a section header."""
        line_upper = line.upper()
        return any(header in line_upper for header in self.section_headers)
    
    def _format_contact_line(self, line: str) -> str:
        """Format contact information line."""
        # Try to identify type of contact info
        if '@' in line:
            return f"Email: {line}"
        elif any(char.isdigit() for char in line) and len(line) > 7:
            return f"Phone: {line}"
        elif any(word in line.lower() for word in ['street', 'ave', 'road', 'city', 'state']):
            return f"Location: {line}"
        return line
    
    def _format_education_line(self, line: str) -> str:
        """Format education line."""
        if not line.startswith('-'):
            return f"- {line}"
        return line
    
    def _format_experience_line(self, line: str) -> str:
        """Format experience line."""
        # Check if it's a bullet point
        if line.startswith('•') or line.startswith('-'):
            return f"  {line}"
        # Otherwise, it might be a company/title line
        return f"- {line}"
    
    def _format_skills_line(self, line: str) -> str:
        """Format skills line."""
        # Try to identify skill categories
        if ':' in line:
            return f"- {line}"
        return f"  - {line}"


def pdf_to_markdown(pdf_path: Path) -> str:
    """
    Convenience function to convert PDF to markdown.
    
    Args:
        pdf_path: Path to PDF file
        
    Returns:
        Markdown formatted text
    """
    converter = PDFToMarkdownConverter()
    return converter.convert_pdf_to_markdown(pdf_path)