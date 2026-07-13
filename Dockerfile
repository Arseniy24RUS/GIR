FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

RUN groupadd --system giip && useradd --system --gid giip --create-home giip
WORKDIR /app
COPY requirements.lock requirements.txt ./
RUN python -m pip install --upgrade pip && pip install --no-cache-dir -r requirements.lock
COPY --chown=giip:giip . .
USER giip
RUN python -m giip.cli init
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD python -c "import json,urllib.request; d=json.load(urllib.request.urlopen('http://127.0.0.1:8000/api/health',timeout=3)); raise SystemExit(0 if d.get('status')=='ok' else 1)"
CMD ["python", "-m", "giip.cli", "runserver", "--host", "0.0.0.0", "--port", "8000"]
