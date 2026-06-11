from __future__ import annotations

import os

from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential
from dotenv import load_dotenv


load_dotenv("../.env")

endpoint = os.getenv("AZURE_AI_PROJECT_ENDPOINT")
agent_name = os.getenv("FOUNDRY_AGENT_NAME")

if not endpoint:
    raise RuntimeError("AZURE_AI_PROJECT_ENDPOINT is missing from .env")

if not agent_name:
    raise RuntimeError("FOUNDRY_AGENT_NAME is missing from .env")

project = AIProjectClient(
    endpoint=endpoint,
    credential=DefaultAzureCredential(),
)

openai = project.get_openai_client()

conversation = openai.conversations.create()

prompt = (
    'Use only the connected knowledge base. Search for the phrase '
    '"Employment or promotion decisions". Return the source document name, '
    "the exact matching evidence, and the recommended supervisor action. "
    'If you cannot retrieve that phrase from the knowledge base, say "RETRIEVAL FAILED".'
)

response = openai.responses.create(
    conversation=conversation.id,
    extra_body={
        "agent_reference": {
            "name": agent_name,
            "type": "agent_reference",
        }
    },
    input=prompt,
)

print("Foundry agent response:")
print(response.output_text)