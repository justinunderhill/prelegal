from __future__ import annotations

from app.agreements.base import ChatConfig
from app.agreements.ai_addendum import AI_ADDENDUM_CHAT_CONFIG
from app.agreements.baa import BAA_CHAT_CONFIG
from app.agreements.csa import CSA_CHAT_CONFIG
from app.agreements.design_partner import DESIGN_PARTNER_CHAT_CONFIG
from app.agreements.dpa import DPA_CHAT_CONFIG
from app.agreements.intake import INTAKE_CHAT_CONFIG
from app.agreements.mutual_nda import MUTUAL_NDA_CHAT_CONFIG
from app.agreements.partnership import PARTNERSHIP_CHAT_CONFIG
from app.agreements.pilot import PILOT_CHAT_CONFIG
from app.agreements.psa import PSA_CHAT_CONFIG
from app.agreements.sla import SLA_CHAT_CONFIG
from app.agreements.software_license import SOFTWARE_LICENSE_CHAT_CONFIG

_registry: dict[str, ChatConfig] = {
    "intake": INTAKE_CHAT_CONFIG,
    "mutual-nda": MUTUAL_NDA_CHAT_CONFIG,
    "csa": CSA_CHAT_CONFIG,
    "dpa": DPA_CHAT_CONFIG,
    "psa": PSA_CHAT_CONFIG,
    "sla": SLA_CHAT_CONFIG,
    "design-partner": DESIGN_PARTNER_CHAT_CONFIG,
    "partnership": PARTNERSHIP_CHAT_CONFIG,
    "pilot": PILOT_CHAT_CONFIG,
    "baa": BAA_CHAT_CONFIG,
    "software-license": SOFTWARE_LICENSE_CHAT_CONFIG,
    "ai-addendum": AI_ADDENDUM_CHAT_CONFIG,
}


def get_chat_config(slug: str) -> ChatConfig | None:
    return _registry.get(slug)
