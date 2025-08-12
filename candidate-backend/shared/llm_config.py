"""
Centralized LLM Configuration for TalentAI
Allows easy switching between different models for bug generation and grading
"""

import os
from enum import Enum
from typing import Optional, Dict, Any
from langchain_anthropic import ChatAnthropic
from langchain_ollama import OllamaLLM

class ModelProvider(Enum):
    """Available LLM providers"""
    ANTHROPIC = "anthropic"
    OLLAMA = "ollama"
    OPENAI = "openai"  # Future support
    GROQ = "groq"  # Groq Cloud API

class ModelType(Enum):
    """Available models for each provider"""
    # Anthropic models
    CLAUDE_3_5_SONNET = "claude-3-5-sonnet-20241022"
    CLAUDE_3_5_HAIKU = "claude-3-5-haiku-20241022"
    CLAUDE_3_OPUS = "claude-3-opus-20240229"
    
    # Ollama models
    QWEN3_4B = "qwen3:4b"
    QWEN3_8B = "qwen3:8b"
    GEMMA3_1B = "gemma3:1b"
    GEMMA2_2B = "gemma2:2b"
    LLAMA3_2 = "llama3.2"
    MISTRAL = "mistral"
    
    # OpenAI models (for future)
    GPT_4_TURBO = "gpt-4-turbo-preview"
    GPT_4 = "gpt-4"
    GPT_3_5_TURBO = "gpt-3.5-turbo"
    
    # Groq models
    GROQ_LLAMA3_70B = "llama3-70b-8192"
    GROQ_LLAMA3_8B = "llama3-8b-8192"
    GROQ_MIXTRAL = "mixtral-8x7b-32768"
    GROQ_GEMMA_7B = "gemma-7b-it"
    GROQ_GEMMA2_9B = "gemma2-9b-it"
    GROQ_GPT_OSS_20B = "openai/gpt-oss-20b"  # OpenAI GPT OSS 20B model

class LLMConfig:
    """
    Centralized configuration for LLM models
    Usage:
        config = LLMConfig()
        
        # Get bug generation LLM
        bug_llm = config.get_bug_generation_llm()
        
        # Get grading LLM
        grading_llm = config.get_grading_llm()
        
        # Change models at runtime
        config.set_bug_generation_model(ModelProvider.OLLAMA, ModelType.QWEN3_8B)
        config.set_grading_model(ModelProvider.ANTHROPIC, ModelType.CLAUDE_3_5_HAIKU)
    """
    
    def __init__(self):
        # ==========================================
        # MAIN CONFIGURATION - CHANGE MODELS HERE
        # ==========================================
        
        # Bug Generation Model Configuration
        self.bug_generation_config = {
            "provider": ModelProvider.GROQ,  # Using Groq for fast inference
            "model": ModelType.GROQ_GPT_OSS_20B,  # OpenAI GPT OSS 20B for bug generation
            "temperature": 0.7,  # 0.0-1.0, higher = more creative
            "max_tokens": 2000,
            "timeout": 30
        }
        
        # Grading Model Configuration  
        self.grading_config = {
            "provider": ModelProvider.GROQ,  # Using Groq for fast inference
            "model": ModelType.GROQ_GPT_OSS_20B,  # OpenAI GPT OSS 20B for accurate grading
            "temperature": 0.0,  # Keep at 0.0 for consistent grading
            "max_tokens": 1000,
            "timeout": 15
        }
        
        # ==========================================
        # QUICK PRESETS - Uncomment one to use
        # ==========================================
        
        # self._use_fast_local_preset()  # Fast Ollama models
        # self._use_high_quality_preset()  # Best Claude models
        # self._use_balanced_preset()  # Claude for bugs, Ollama for grading
        # self._use_ultra_fast_preset()  # Smallest/fastest models
        
        # API keys from environment
        self.anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.groq_api_key = os.getenv("GROQ_API_KEY")  # Optional - will use if available
    
    def _use_fast_local_preset(self):
        """Fast local models for development"""
        self.bug_generation_config = {
            "provider": ModelProvider.OLLAMA,
            "model": ModelType.QWEN3_4B,
            "temperature": 0.7,
            "max_tokens": 1000,
            "timeout": 20
        }
        self.grading_config = {
            "provider": ModelProvider.OLLAMA,
            "model": ModelType.GEMMA3_1B,
            "temperature": 0.0,
            "max_tokens": 500,
            "timeout": 10
        }
    
    def _use_high_quality_preset(self):
        """Best quality with Claude"""
        self.bug_generation_config = {
            "provider": ModelProvider.ANTHROPIC,
            "model": ModelType.CLAUDE_3_5_SONNET,
            "temperature": 0.7,
            "max_tokens": 2000,
            "timeout": 30
        }
        self.grading_config = {
            "provider": ModelProvider.ANTHROPIC,
            "model": ModelType.CLAUDE_3_5_SONNET,
            "temperature": 0.0,
            "max_tokens": 1000,
            "timeout": 15
        }
    
    def _use_balanced_preset(self):
        """Claude for generation, Ollama for grading"""
        self.bug_generation_config = {
            "provider": ModelProvider.ANTHROPIC,
            "model": ModelType.CLAUDE_3_5_SONNET,
            "temperature": 0.7,
            "max_tokens": 2000,
            "timeout": 30
        }
        self.grading_config = {
            "provider": ModelProvider.OLLAMA,
            "model": ModelType.QWEN3_4B,
            "temperature": 0.0,
            "max_tokens": 1000,
            "timeout": 20
        }
    
    def _use_ultra_fast_preset(self):
        """Smallest/fastest models for testing"""
        self.bug_generation_config = {
            "provider": ModelProvider.OLLAMA,
            "model": ModelType.GEMMA3_1B,
            "temperature": 0.7,
            "max_tokens": 500,
            "timeout": 10
        }
        self.grading_config = {
            "provider": ModelProvider.OLLAMA,
            "model": ModelType.GEMMA3_1B,
            "temperature": 0.0,
            "max_tokens": 500,
            "timeout": 10
        }
    
    def _use_groq_preset(self):
        """Use Groq's fast cloud API"""
        self.bug_generation_config = {
            "provider": ModelProvider.GROQ,
            "model": ModelType.GROQ_LLAMA3_8B,
            "temperature": 0.7,
            "max_tokens": 2000,
            "timeout": 15
        }
        self.grading_config = {
            "provider": ModelProvider.GROQ,
            "model": ModelType.GROQ_GEMMA2_9B,
            "temperature": 0.0,
            "max_tokens": 1000,
            "timeout": 10
        }
        
    def set_bug_generation_model(self, provider: ModelProvider, model: ModelType, **kwargs):
        """
        Set the model for bug generation
        
        Args:
            provider: ModelProvider enum (ANTHROPIC, OLLAMA, etc.)
            model: ModelType enum (CLAUDE_3_5_SONNET, QWEN3_4B, etc.)
            **kwargs: Additional parameters (temperature, max_tokens, etc.)
        """
        self.bug_generation_config["provider"] = provider
        self.bug_generation_config["model"] = model
        self.bug_generation_config.update(kwargs)
        
    def set_grading_model(self, provider: ModelProvider, model: ModelType, **kwargs):
        """
        Set the model for grading
        
        Args:
            provider: ModelProvider enum
            model: ModelType enum
            **kwargs: Additional parameters
        """
        self.grading_config["provider"] = provider
        self.grading_config["model"] = model
        self.grading_config.update(kwargs)
        
    def get_bug_generation_llm(self):
        """Get the configured LLM for bug generation"""
        return self._create_llm(self.bug_generation_config)
        
    def get_grading_llm(self):
        """Get the configured LLM for grading"""
        return self._create_llm(self.grading_config)
        
    def _create_llm(self, config: Dict[str, Any]):
        """Create an LLM instance based on configuration"""
        provider = config["provider"]
        model = config["model"]
        
        if provider == ModelProvider.ANTHROPIC:
            if not self.anthropic_api_key:
                raise ValueError("ANTHROPIC_API_KEY not found in environment variables")
                
            return ChatAnthropic(
                model=model.value,
                temperature=config.get("temperature", 0.0),
                anthropic_api_key=self.anthropic_api_key,
                max_tokens=config.get("max_tokens", 1000),
                timeout=config.get("timeout", 30)
            )
            
        elif provider == ModelProvider.OLLAMA:
            return OllamaLLM(
                model=model.value,
                temperature=config.get("temperature", 0.0),
                timeout=config.get("timeout", 30)
            )
            
        elif provider == ModelProvider.OPENAI:
            if not self.openai_api_key:
                raise ValueError("OPENAI_API_KEY not found in environment variables")
                
            # Future implementation
            from langchain_openai import ChatOpenAI
            return ChatOpenAI(
                model=model.value,
                temperature=config.get("temperature", 0.0),
                openai_api_key=self.openai_api_key,
                max_tokens=config.get("max_tokens", 1000),
                timeout=config.get("timeout", 30)
            )
            
        elif provider == ModelProvider.GROQ:
            if not self.groq_api_key:
                raise ValueError("GROQ_API_KEY not found in environment variables. Get one at https://console.groq.com/keys")
                
            try:
                from langchain_groq import ChatGroq
            except ImportError:
                raise ImportError("Please install langchain-groq: pip install langchain-groq")
                
            return ChatGroq(
                model=model.value,
                temperature=config.get("temperature", 0.0),
                groq_api_key=self.groq_api_key,
                max_tokens=config.get("max_tokens", 1000),
                request_timeout=config.get("timeout", 30)
            )
            
        else:
            raise ValueError(f"Unsupported provider: {provider}")
    
    def get_current_config(self) -> Dict[str, Dict]:
        """Get current configuration for both bug generation and grading"""
        return {
            "bug_generation": {
                "provider": self.bug_generation_config["provider"].value,
                "model": self.bug_generation_config["model"].value,
                "temperature": self.bug_generation_config["temperature"],
                "max_tokens": self.bug_generation_config["max_tokens"],
                "timeout": self.bug_generation_config["timeout"]
            },
            "grading": {
                "provider": self.grading_config["provider"].value,
                "model": self.grading_config["model"].value,
                "temperature": self.grading_config["temperature"],
                "max_tokens": self.grading_config["max_tokens"],
                "timeout": self.grading_config["timeout"]
            }
        }

# Global instance for easy access
llm_config = LLMConfig()

# Print current configuration on startup
print("=" * 60)
print("LLM Configuration Loaded:")
print("-" * 60)
config = llm_config.get_current_config()
print(f"Bug Generation: {config['bug_generation']['provider']} - {config['bug_generation']['model']}")
print(f"Grading: {config['grading']['provider']} - {config['grading']['model']}")
print("=" * 60)
print("To change models, edit shared/llm_config.py __init__ method")
print("=" * 60)

# Quick configuration presets
class ConfigPresets:
    """Pre-configured settings for different scenarios"""
    
    @staticmethod
    def use_fast_local():
        """Use fast local models (Ollama) for development"""
        llm_config.set_bug_generation_model(
            ModelProvider.OLLAMA, 
            ModelType.QWEN3_4B,
            temperature=0.7
        )
        llm_config.set_grading_model(
            ModelProvider.OLLAMA,
            ModelType.GEMMA3_1B,
            temperature=0.0
        )
    
    @staticmethod
    def use_high_quality():
        """Use high-quality models (Claude) for production"""
        llm_config.set_bug_generation_model(
            ModelProvider.ANTHROPIC,
            ModelType.CLAUDE_3_5_SONNET,
            temperature=0.7
        )
        llm_config.set_grading_model(
            ModelProvider.ANTHROPIC,
            ModelType.CLAUDE_3_5_SONNET,
            temperature=0.0
        )
    
    @staticmethod
    def use_balanced():
        """Use Claude for generation, Ollama for grading"""
        llm_config.set_bug_generation_model(
            ModelProvider.ANTHROPIC,
            ModelType.CLAUDE_3_5_SONNET,
            temperature=0.7
        )
        llm_config.set_grading_model(
            ModelProvider.OLLAMA,
            ModelType.QWEN3_4B,
            temperature=0.0
        )
    
    @staticmethod
    def use_groq():
        """Use Groq's fast cloud API (requires GROQ_API_KEY)"""
        llm_config.set_bug_generation_model(
            ModelProvider.GROQ,
            ModelType.GROQ_LLAMA3_8B,
            temperature=0.7,
            max_tokens=2000
        )
        llm_config.set_grading_model(
            ModelProvider.GROQ,
            ModelType.GROQ_GEMMA2_9B,
            temperature=0.0,
            max_tokens=1000
        )

# Example usage in code:
"""
from shared.llm_config import llm_config, ConfigPresets, ModelProvider, ModelType

# Use a preset
ConfigPresets.use_high_quality()  # Claude models
ConfigPresets.use_fast_local()    # Ollama models
ConfigPresets.use_groq()          # Groq cloud API (needs GROQ_API_KEY)

# Or configure manually
llm_config.set_bug_generation_model(ModelProvider.GROQ, ModelType.GROQ_LLAMA3_70B)
llm_config.set_grading_model(ModelProvider.GROQ, ModelType.GROQ_MIXTRAL)

# Get LLMs for use
bug_llm = llm_config.get_bug_generation_llm()
grading_llm = llm_config.get_grading_llm()

# Check current configuration
print(llm_config.get_current_config())
"""