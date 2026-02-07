import os
import re
import json
import requests
from typing import Dict, Any, List
from langchain_core.tools import tool
from groq import Groq


GROQ_API_KEY = os.getenv("GROQ_API_KEY")
_client = None


def _get_client() -> Groq:
    if not GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY n'est pas défini dans l'environnement.")

    global _client
    if _client is None:
        _client = Groq(api_key=GROQ_API_KEY)
    return _client



def _extract_tables_from_sql(sql: str) -> List[Dict[str, Any]]:
    """
    Parse simple MySQL dumps:
    - CREATE TABLE `name` ( ... )
    - column lines like: `col` type ...
    This is not a full SQL parser, but works well for phpMyAdmin dumps like yours.
    """
    tables = []

    # Match CREATE TABLE blocks
    pattern = re.compile(
    r"CREATE\s+TABLE\s+`?(?P<table>[A-Za-z0-9_]+)`?\s*\(\s*(?P<body>.*?)\)\s*(?:ENGINE=|;)",
    re.IGNORECASE | re.DOTALL
    )

    for m in pattern.finditer(sql):
        table_name = m.group("table")
        body = m.group("body")

        columns = []
        # Column lines usually start with backtick
        for line in body.splitlines():
            line = line.strip().rstrip(",")
            if not line.startswith("`"):
                continue

            # Example: `id` int NOT NULL
            col_match = re.match(r"`([^`]+)`\s+(.+)", line)
            if not col_match:
                continue

            col_name = col_match.group(1)
            col_def = col_match.group(2)

            # Extract type (first token / or token with parentheses)
            # Example: varchar(50) DEFAULT NULL  -> varchar(50)
            col_type = col_def.split()[0]

            columns.append({
                "name": col_name,
                "type": col_type,
                "raw": col_def
            })

        tables.append({
            "table": table_name,
            "columns": columns
        })

    return tables


def _build_api_response_schema() -> Dict[str, Any]:
    """
    JSON Schema for your Flask endpoint response.
    It handles:
    - success true with contenu string or null
    - optional message
    - error case with error string
    """
    return {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "title": "GET /api/bdd/file response",
        "type": "object",
        "oneOf": [
            {
                "title": "Success",
                "type": "object",
                "properties": {
                    "success": {"type": "boolean", "const": True},
                    "contenu": {"type": ["string", "null"]},
                    "message": {"type": "string"}
                },
                "required": ["success", "contenu"],
                "additionalProperties": True
            },
            {
                "title": "Error",
                "type": "object",
                "properties": {
                    "error": {"type": "string"}
                },
                "required": ["error"],
                "additionalProperties": True
            }
        ]
    }


@tool
def generate_return_schema_for_last_sql_dump(api_base_url: str) -> str:
    """
    Calls GET {api_base_url}/api/bdd/file and generates:
    1) JSON Schema of the endpoint response
    2) Detected DB schema (tables/columns) from the returned SQL dump in `contenu`

    Parameters:
      api_base_url: e.g. "http://localhost:5000"

    Returns:
      A JSON string with:
        - api_response_json_schema
        - extracted_db_schema
        - notes
    """
    url = api_base_url.rstrip("/") + "/api/bdd/file"
    print (f"[TOOL] Calling API endpoint: {url}")


    try:
        r = requests.get(url, timeout=15)
    except Exception as e:
        return json.dumps({"error": f"Request failed: {str(e)}"}, ensure_ascii=False)

    # Try to decode JSON
    try:
        payload = r.json()
    except Exception:
        return json.dumps(
            {"error": f"Endpoint did not return JSON (status={r.status_code})"},
            ensure_ascii=False
        )

    # Build return schemas
    api_schema = _build_api_response_schema()

    contenu = payload.get("contenu")

    # Si l'API renvoie { success, fichier: { contenu } }
    if contenu is None and isinstance(payload.get("fichier"), dict):
        contenu = payload["fichier"].get("contenu")
    extracted = None
    notes = []

    if isinstance(contenu, str) and contenu.strip():
        extracted = _extract_tables_from_sql(contenu)

        if not extracted:
            notes.append("No CREATE TABLE blocks detected in contenu.")
    else:
        notes.append("contenu is null/empty; DB schema extraction skipped.")

    result = {
        "api_response_json_schema": api_schema,
        "extracted_db_schema": extracted,
        "notes": notes
    }
    return json.dumps(result, ensure_ascii=False, indent=2)




@tool
def generate_sql_direct(db_schema: str, user_request: str) -> str:
    """
    Generate SQL query directly from a database schema and a natural language request.
    Returns ONLY the SQL string.
    """

    system_prompt = """
You are a SQL expert.
Return ONLY a valid SQL query.
Do NOT add any explanations, JSON, markdown, or extra text.
"""

    user_prompt = f"""
Database schema:
{db_schema}

User request:
{user_request}

Generate the SQL query that fulfills this request.
"""

    # Appel au LLM
    client = _get_client()
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        temperature=0,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
    )

    # Retour uniquement du texte brut SQL
    return response.choices[0].message.content.strip()


def extract_schema_from_sql_dump(sql_dump: str):
    extracted = _extract_tables_from_sql(sql_dump)
    return extracted
