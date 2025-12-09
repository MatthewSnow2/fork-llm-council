"""Deep research functionality using OpenRouter deep research models."""

from typing import Dict, Any, Optional
from .openrouter import query_model


# Default timeout for deep research (5 minutes - these models take longer)
DEEP_RESEARCH_TIMEOUT = 300.0


async def run_deep_research(
    query: str,
    model: str = "openai/o3-deep-research"
) -> Optional[Dict[str, Any]]:
    """
    Run deep research on a query using a deep research model.

    Deep research models have built-in web search capabilities and are
    optimized for comprehensive research tasks.

    Args:
        query: The research query
        model: OpenRouter model identifier for deep research

    Returns:
        Dict with 'content' (research results) and 'model', or None if failed
    """
    research_prompt = f"""Please conduct comprehensive research on the following topic.
Provide detailed, well-sourced information including:
- Key facts and current state of knowledge
- Multiple perspectives where applicable
- Recent developments or updates
- Relevant context and background

Research topic: {query}

Provide your research findings in a clear, structured format."""

    messages = [{"role": "user", "content": research_prompt}]

    response = await query_model(
        model=model,
        messages=messages,
        timeout=DEEP_RESEARCH_TIMEOUT
    )

    if response is None:
        return None

    return {
        "model": model,
        "content": response.get("content", ""),
        "reasoning_details": response.get("reasoning_details")
    }


def format_research_context(research_result: Dict[str, Any]) -> str:
    """
    Format deep research results as context for the council.

    Args:
        research_result: Result from run_deep_research()

    Returns:
        Formatted string to inject into council prompts
    """
    if not research_result or not research_result.get("content"):
        return ""

    return f"""=== DEEP RESEARCH CONTEXT ===
The following research was conducted before this council deliberation:

{research_result['content']}

=== END RESEARCH CONTEXT ===

Please consider this research context when formulating your response."""
