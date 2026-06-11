from __future__ import annotations

import os

from azure.ai.projects import AIProjectClient
from azure.identity import DefaultAzureCredential
from dotenv import load_dotenv


load_dotenv("../.env")

endpoint = os.getenv("AZURE_AI_PROJECT_ENDPOINT")
deployment = os.getenv("AZURE_AI_MODEL_DEPLOYMENT")
knowledge_base = os.getenv("FOUNDRY_IQ_KNOWLEDGE_BASE")
agent_name = os.getenv("FOUNDRY_AGENT_NAME")

if not endpoint:
    raise RuntimeError("AZURE_AI_PROJECT_ENDPOINT is missing from .env")

client = AIProjectClient(
    endpoint=endpoint,
    credential=DefaultAzureCredential(),
)

print("Connected to Microsoft Foundry project client.")
print(f"Endpoint configured: {bool(endpoint)}")
print(f"Model deployment: {deployment}")
print(f"Knowledge base: {knowledge_base}")
print(f"Foundry agent: {agent_name}")