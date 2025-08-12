"""
Shared utilities and configurations for TalentAI backend
"""

from .llm_config import (
    llm_config,
    LLMConfig,
    ModelProvider,
    ModelType,
    ConfigPresets
)

__all__ = [
    'llm_config',
    'LLMConfig',
    'ModelProvider',
    'ModelType',
    'ConfigPresets'
]