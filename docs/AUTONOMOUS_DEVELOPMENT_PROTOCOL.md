# Autonomous development protocol for Codex

## Loop

Codex must operate in this loop until release gates pass:

1. Inspect current failing gates.
2. Spawn relevant subagents.
3. Implement smallest coherent production change.
4. Run unit/API/data tests.
5. Run Playwright tests.
6. Update documentation and evidence.
7. Request Codex review.
8. Fix P0/P1 issues.
9. Repeat.

## Do not stop when

- one API endpoint changes format;
- a dataset is Excel/PDF instead of JSON;
- QS lacks a simple country API;
- a source blocks direct download but offers official public export;
- a chart fails on mobile;
- screenshots differ;
- a component formula is undocumented.

## Stop only when

- all gates pass;
- every limitation is documented;
- no fake values remain;
- release evidence is complete.
