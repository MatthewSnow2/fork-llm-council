"""Council mode definitions."""

from typing import Dict, Any, List

# Available council modes
MODES: Dict[str, Dict[str, Any]] = {
    "standard": {
        "id": "standard",
        "name": "Standard",
        "description": "Balanced deliberation for general questions",
        "icon": "⚖️",
        "flow": "council",  # standard 3-stage
        "temperature": 0.7,
        "chairman_model": "google/gemini-3-pro-preview",
        "deep_research_model": None,
    },
    "research": {
        "id": "research",
        "name": "Research",
        "description": "Deep research before council deliberation",
        "icon": "🔬",
        "flow": "research_first",  # deep research → 3-stage
        "temperature": 0.7,
        "chairman_model": "google/gemini-3-pro-preview",
        "deep_research_model": "openai/o3-deep-research",
    },
    "creative": {
        "id": "creative",
        "name": "Creative",
        "description": "High-creativity brainstorming with grounded synthesis",
        "icon": "🎨",
        "flow": "creative_chairman",  # 3-stage with high temp + deep research chairman
        "temperature": 1.0,
        "chairman_model": "openai/o3-deep-research",
        "deep_research_model": None,
    },
}

# Default mode
DEFAULT_MODE = "standard"


def get_mode(mode_id: str) -> Dict[str, Any]:
    """Get mode configuration by ID."""
    return MODES.get(mode_id, MODES[DEFAULT_MODE])


def list_modes() -> List[Dict[str, Any]]:
    """List all available modes."""
    return list(MODES.values())
