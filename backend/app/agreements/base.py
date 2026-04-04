from __future__ import annotations

from pydantic import BaseModel


class ChatConfig:
    def __init__(self, slug: str, system_prompt: str, fields_schema: type[BaseModel]):
        self.slug = slug
        self.system_prompt = system_prompt
        self.fields_schema = fields_schema
