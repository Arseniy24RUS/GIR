#!/usr/bin/env bash
set -euo pipefail
python -m giip.cli init
python -m giip.cli runserver --host 127.0.0.1 --port 8000
