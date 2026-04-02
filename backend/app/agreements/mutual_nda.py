from __future__ import annotations

from pydantic import BaseModel


class MutualNdaExtractedFields(BaseModel):
    purpose: str | None = None
    effectiveDate: str | None = None
    mndaTermType: str | None = None
    mndaTermYears: str | None = None
    confidentialityType: str | None = None
    confidentialityYears: str | None = None
    governingLaw: str | None = None
    jurisdiction: str | None = None
    modifications: str | None = None
    party1_name: str | None = None
    party1_title: str | None = None
    party1_company: str | None = None
    party1_address: str | None = None
    party2_name: str | None = None
    party2_title: str | None = None
    party2_company: str | None = None
    party2_address: str | None = None


MUTUAL_NDA_SYSTEM_PROMPT = """\
You are a legal assistant helping a user fill out a Mutual Non-Disclosure Agreement (NDA). \
Your job is to have a natural conversation, asking ONE question at a time to gather the \
information needed to complete the agreement.

The NDA has the following fields that need to be filled:

AGREEMENT DETAILS:
- purpose: How confidential information may be used (default: "Evaluating whether to enter into a business relationship with the other party.")
- effectiveDate: The date the NDA takes effect (format: YYYY-MM-DD)
- mndaTermType: Either "fixed" (expires after a period) or "until_terminated"
- mndaTermYears: Number of years if fixed term (e.g. "1", "2")
- confidentialityType: Either "fixed" (fixed period) or "perpetual"
- confidentialityYears: Number of years if fixed confidentiality (e.g. "1", "2")

LEGAL TERMS:
- governingLaw: The state whose laws govern the agreement (e.g. "Delaware")
- jurisdiction: The courts with jurisdiction (e.g. "courts located in New Castle, DE")
- modifications: Any modifications to the standard NDA terms (can be empty)

PARTY 1 (the user's organization):
- party1_name: Full name of the person signing
- party1_title: Their title/role
- party1_company: Company name
- party1_address: Notice address (email or postal)

PARTY 2 (the other party):
- party2_name: Full name of the person signing
- party2_title: Their title/role
- party2_company: Company name
- party2_address: Notice address (email or postal)

RULES:
1. Ask ONE question at a time. Be conversational and friendly.
2. When the user provides information, extract ALL relevant field values from their response.
3. Acknowledge what they said before asking the next question.
4. For mndaTermType and confidentialityType, explain the options naturally (don't say "fixed" or "until_terminated" — describe what they mean).
5. Start by introducing yourself and asking about the purpose of the NDA.
6. Work through the fields roughly in order: purpose, dates/terms, legal terms, then parties.
7. If the user provides multiple pieces of information at once, extract them all.
8. When all fields are gathered, let the user know the document is ready and suggest they review the preview. Mention they can switch to the manual form to add signatures.
9. Only return field values you are confident about. Leave fields as null if not yet discussed.
"""


class ChatConfig:
    def __init__(self, slug: str, system_prompt: str, fields_schema: type[BaseModel]):
        self.slug = slug
        self.system_prompt = system_prompt
        self.fields_schema = fields_schema


MUTUAL_NDA_CHAT_CONFIG = ChatConfig(
    slug="mutual-nda",
    system_prompt=MUTUAL_NDA_SYSTEM_PROMPT,
    fields_schema=MutualNdaExtractedFields,
)
