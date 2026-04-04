from __future__ import annotations

import json
import os
from typing import Any

from openai import OpenAI
from pydantic import BaseModel

from app.agreements.registry import get_chat_config

MAX_HISTORY_MESSAGES = 50

_client: OpenAI | None = None


def _get_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(
            api_key=os.getenv("OPENAI_API_KEY"),
            base_url="https://api.openai.com/v1",
        )
    return _client


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    slug: str
    history: list[ChatMessage]
    user_message: str


class ChatResponse(BaseModel):
    assistant_message: str
    extracted_fields: dict[str, Any]


def _build_llm_response_schema(fields_schema: type[BaseModel]) -> dict:
    """Build the JSON schema for Structured Outputs wrapping the agreement's fields."""
    fields_props = {}
    for name, field_info in fields_schema.model_fields.items():
        fields_props[name] = {"type": ["string", "null"]}

    return {
        "type": "object",
        "properties": {
            "assistant_message": {"type": "string"},
            "extracted_fields": {
                "type": "object",
                "properties": fields_props,
                "required": list(fields_props.keys()),
                "additionalProperties": False,
            },
        },
        "required": ["assistant_message", "extracted_fields"],
        "additionalProperties": False,
    }


def process_turn(request: ChatRequest) -> ChatResponse:
    config = get_chat_config(request.slug)
    if config is None:
        raise ValueError(f"Unknown agreement type: {request.slug}")

    client = _get_client()

    messages: list[dict[str, str]] = [
        {"role": "system", "content": config.system_prompt},
    ]
    # Cap history to prevent exceeding context window
    history = request.history[-MAX_HISTORY_MESSAGES:]
    for msg in history:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": request.user_message})

    response_schema = _build_llm_response_schema(config.fields_schema)

    completion = client.chat.completions.create(
        model="gpt-4.1",
        messages=messages,
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "chat_turn_response",
                "schema": response_schema,
                "strict": True,
            },
        },
    )

    raw = completion.choices[0].message.content
    if not raw:
        raise ValueError("LLM returned an empty response")
    parsed = json.loads(raw)

    # Filter out null values from extracted fields
    extracted = {
        k: v for k, v in parsed.get("extracted_fields", {}).items() if v is not None
    }

    return ChatResponse(
        assistant_message=parsed["assistant_message"],
        extracted_fields=extracted,
    )
