"""Tests for the agreement registry and all agreement chat configs."""

from app.agreements.base import ChatConfig
from app.agreements.registry import _registry, get_chat_config


# All expected agreement slugs
EXPECTED_SLUGS = [
    "intake",
    "mutual-nda",
    "csa",
    "dpa",
    "psa",
    "sla",
    "design-partner",
    "partnership",
    "pilot",
    "baa",
    "software-license",
    "ai-addendum",
]


class TestAgreementRegistry:
    def test_all_expected_slugs_are_registered(self):
        for slug in EXPECTED_SLUGS:
            assert slug in _registry, f"Missing registry entry for '{slug}'"

    def test_no_unexpected_slugs(self):
        for slug in _registry:
            assert slug in EXPECTED_SLUGS, f"Unexpected registry entry: '{slug}'"

    def test_get_chat_config_returns_config_for_known_slugs(self):
        for slug in EXPECTED_SLUGS:
            config = get_chat_config(slug)
            assert config is not None
            assert isinstance(config, ChatConfig)
            assert config.slug == slug

    def test_get_chat_config_returns_none_for_unknown_slug(self):
        assert get_chat_config("nonexistent") is None
        assert get_chat_config("") is None


class TestAgreementChatConfigs:
    """Verify each agreement config has required properties."""

    def test_all_configs_have_system_prompts(self):
        for slug in EXPECTED_SLUGS:
            config = get_chat_config(slug)
            assert config.system_prompt, f"{slug} has empty system_prompt"
            assert len(config.system_prompt) > 50, f"{slug} system_prompt is too short"

    def test_all_configs_have_fields_schema(self):
        for slug in EXPECTED_SLUGS:
            config = get_chat_config(slug)
            assert config.fields_schema is not None, f"{slug} has no fields_schema"

    def test_fields_schemas_are_pydantic_models(self):
        from pydantic import BaseModel

        for slug in EXPECTED_SLUGS:
            config = get_chat_config(slug)
            assert issubclass(
                config.fields_schema, BaseModel
            ), f"{slug} fields_schema is not a Pydantic model"

    def test_fields_schemas_have_optional_fields(self):
        """All extracted fields should default to None (optional) since they're
        progressively filled during conversation."""
        for slug in EXPECTED_SLUGS:
            if slug == "intake":
                continue  # intake has different field semantics
            config = get_chat_config(slug)
            instance = config.fields_schema()
            for field_name, value in instance.model_dump().items():
                assert (
                    value is None
                ), f"{slug}.{field_name} should default to None but got {value!r}"

    def test_system_prompts_mention_one_question_at_a_time(self):
        """All agreement prompts should instruct the AI to ask one question at a time."""
        for slug in EXPECTED_SLUGS:
            if slug == "intake":
                continue  # intake has different conversation style
            config = get_chat_config(slug)
            prompt_lower = config.system_prompt.lower()
            assert (
                "one question" in prompt_lower or "one at a time" in prompt_lower
            ), f"{slug} system prompt should instruct asking one question at a time"

    def test_mutual_nda_has_expected_fields(self):
        config = get_chat_config("mutual-nda")
        fields = config.fields_schema.model_fields
        expected = [
            "purpose", "effective_date", "mnda_term_type", "mnda_term_years",
            "confidentiality_type", "confidentiality_years", "governing_law",
            "jurisdiction", "modifications",
            "party1_name", "party1_title", "party1_company", "party1_address",
            "party2_name", "party2_title", "party2_company", "party2_address",
        ]
        for field in expected:
            assert field in fields, f"Mutual NDA missing field: {field}"

    def test_csa_has_expected_fields(self):
        config = get_chat_config("csa")
        fields = config.fields_schema.model_fields
        expected = [
            "provider_name", "customer_name", "effective_date", "governing_law",
        ]
        for field in expected:
            assert field in fields, f"CSA missing field: {field}"

    def test_dpa_has_expected_fields(self):
        config = get_chat_config("dpa")
        fields = config.fields_schema.model_fields
        expected = [
            "controller_name", "processor_name", "effective_date",
        ]
        for field in expected:
            assert field in fields, f"DPA missing field: {field}"
