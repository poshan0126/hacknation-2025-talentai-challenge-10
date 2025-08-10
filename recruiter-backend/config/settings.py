"""
Main configuration settings for the Recruiter Backend
"""
import os
from typing import Optional
from pydantic import BaseSettings, Field


class RecruiterSettings(BaseSettings):
    """Main application settings"""
    
    # API Configuration
    api_title: str = "Recruiter Backend API"
    api_description: str = "AI-powered recruitment and candidate matching system"
    api_version: str = "1.0.0"
    api_host: str = Field(default="0.0.0.0", env="RECRUITER_API_HOST")
    api_port: int = Field(default=8002, env="RECRUITER_API_PORT")
    api_debug: bool = Field(default=False, env="RECRUITER_API_DEBUG")
    
    # Database Configuration
    database_url: str = Field(
        default="postgresql://user:password@localhost:5432/recruiter_db",
        env="DATABASE_URL"
    )
    
    # Redis Configuration
    redis_url: str = Field(
        default="redis://localhost:6379/0",
        env="REDIS_URL"
    )
    
    # LLM Configuration
    llm_provider: str = Field(default="ollama", env="LLM_PROVIDER")
    ollama_base_url: str = Field(default="http://localhost:11434", env="OLLAMA_BASE_URL")
    ollama_model: str = Field(default="llama3.1-8b", env="OLLAMA_MODEL")
    lm_studio_url: str = Field(default="http://localhost:1234", env="LM_STUDIO_URL")
    groq_api_key: Optional[str] = Field(default=None, env="GROQ_API_KEY")
    groq_model: str = Field(default="llama3.1-8b", env="GROQ_MODEL")
    
    # Vector Database Configuration
    chroma_persist_directory: str = Field(
        default="./data/chroma_db",
        env="CHROMA_PERSIST_DIRECTORY"
    )
    
    # Embedding Model Configuration
    embedding_model: str = Field(
        default="all-mpnet-base-v2",
        env="EMBEDDING_MODEL"
    )
    
    # JWT Configuration
    jwt_secret_key: str = Field(
        default="your-secret-key-change-in-production",
        env="JWT_SECRET_KEY"
    )
    jwt_algorithm: str = Field(default="HS256", env="JWT_ALGORITHM")
    jwt_access_token_expire_minutes: int = Field(
        default=30,
        env="JWT_ACCESS_TOKEN_EXPIRE_MINUTES"
    )
    
    # File Upload Configuration
    max_file_size: int = Field(default=10 * 1024 * 1024, env="MAX_FILE_SIZE")  # 10MB
    allowed_file_types: list = Field(
        default=[".pdf", ".docx", ".txt"],
        env="ALLOWED_FILE_TYPES"
    )
    
    # Matching Engine Configuration
    semantic_weight: float = Field(default=0.7, env="SEMANTIC_WEIGHT")
    skills_weight: float = Field(default=0.2, env="SKILLS_WEIGHT")
    experience_weight: float = Field(default=0.1, env="EXPERIENCE_WEIGHT")
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = RecruiterSettings()
