import json
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _mock_openai_response(assistant_message: str, extracted_fields: dict):
    """Create a mock OpenAI completion response."""
    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = json.dumps(
        {
            "assistant_message": assistant_message,
            "extracted_fields": extracted_fields,
        }
    )
    return mock_response


class TestChatEndpoint:
    def test_unknown_slug_returns_404(self):
        response = client.post(
            "/api/chat",
            json={
                "slug": "nonexistent",
                "history": [],
                "user_message": "Hello",
            },
        )
        assert response.status_code == 404

    @patch("app.services.chat_service._get_client")
    def test_valid_request_returns_response(self, mock_openai_cls):
        mock_client = MagicMock()
        mock_openai_cls.return_value = mock_client
        mock_client.chat.completions.create.return_value = _mock_openai_response(
            "What is the purpose of this NDA?",
            {
                "purpose": None,
                "effectiveDate": None,
                "mndaTermType": None,
                "mndaTermYears": None,
                "confidentialityType": None,
                "confidentialityYears": None,
                "governingLaw": None,
                "jurisdiction": None,
                "modifications": None,
                "party1_name": None,
                "party1_title": None,
                "party1_company": None,
                "party1_address": None,
                "party2_name": None,
                "party2_title": None,
                "party2_company": None,
                "party2_address": None,
            },
        )

        response = client.post(
            "/api/chat",
            json={
                "slug": "mutual-nda",
                "history": [],
                "user_message": "Hello, I'd like to create a Mutual NDA.",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "assistant_message" in data
        assert data["assistant_message"] == "What is the purpose of this NDA?"
        assert data["extracted_fields"] == {}

    @patch("app.services.chat_service._get_client")
    def test_extracted_fields_returned(self, mock_openai_cls):
        mock_client = MagicMock()
        mock_openai_cls.return_value = mock_client
        mock_client.chat.completions.create.return_value = _mock_openai_response(
            "Got it! When should this NDA take effect?",
            {
                "purpose": "Exploring a joint venture partnership",
                "effectiveDate": None,
                "mndaTermType": None,
                "mndaTermYears": None,
                "confidentialityType": None,
                "confidentialityYears": None,
                "governingLaw": None,
                "jurisdiction": None,
                "modifications": None,
                "party1_name": None,
                "party1_title": None,
                "party1_company": None,
                "party1_address": None,
                "party2_name": None,
                "party2_title": None,
                "party2_company": None,
                "party2_address": None,
            },
        )

        response = client.post(
            "/api/chat",
            json={
                "slug": "mutual-nda",
                "history": [
                    {"role": "assistant", "content": "What is the purpose?"},
                ],
                "user_message": "We want to explore a joint venture partnership.",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["extracted_fields"] == {
            "purpose": "Exploring a joint venture partnership"
        }

    def test_malformed_request_returns_422(self):
        response = client.post("/api/chat", json={"bad": "data"})
        assert response.status_code == 422

    @patch("app.services.chat_service._get_client")
    def test_uses_structured_outputs(self, mock_openai_cls):
        mock_client = MagicMock()
        mock_openai_cls.return_value = mock_client
        mock_client.chat.completions.create.return_value = _mock_openai_response(
            "Hello!", {k: None for k in [
                "purpose", "effectiveDate", "mndaTermType", "mndaTermYears",
                "confidentialityType", "confidentialityYears", "governingLaw",
                "jurisdiction", "modifications", "party1_name", "party1_title",
                "party1_company", "party1_address", "party2_name", "party2_title",
                "party2_company", "party2_address",
            ]}
        )

        client.post(
            "/api/chat",
            json={
                "slug": "mutual-nda",
                "history": [],
                "user_message": "Hi",
            },
        )

        call_kwargs = mock_client.chat.completions.create.call_args
        assert call_kwargs.kwargs["model"] == "gpt-5.3-codex"
        assert call_kwargs.kwargs["response_format"]["type"] == "json_schema"
        assert call_kwargs.kwargs["response_format"]["json_schema"]["strict"] is True
