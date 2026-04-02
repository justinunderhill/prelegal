from __future__ import annotations

from app.agreements.mutual_nda import MUTUAL_NDA_CHAT_CONFIG, ChatConfig

_registry: dict[str, ChatConfig] = {
    "mutual-nda": MUTUAL_NDA_CHAT_CONFIG,
}


def get_chat_config(slug: str) -> ChatConfig | None:
    return _registry.get(slug)
