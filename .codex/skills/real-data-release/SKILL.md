# Real Data Release Skill

Use this skill when implementing or reviewing data ingestion.

Rules:

1. Always write raw snapshots before normalized values.
2. Every value needs provenance.
3. If an API fails, inspect docs and implement legal official-file import.
4. Never generate country scores.
5. Update `docs/RELEASE_EVIDENCE.md` after each connector.
