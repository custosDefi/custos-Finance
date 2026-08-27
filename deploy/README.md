# Google Cloud deployment

The deployment uses two public Cloud Run services:

- `custos-api`: FastAPI API and WebSocket market stream
- `custos-web`: Vite-built static frontend served by Nginx

The script uses the current gcloud project and defaults to `asia-east2`:

```bash
gcloud config set project project-002102bc-53ba-48fd-9a8
./deploy/cloudrun.sh
```

Optional overrides:

```bash
CLOUD_RUN_REGION=asia-east1 \
CLOUD_RUN_API_SERVICE=custos-api \
CLOUD_RUN_WEB_SERVICE=custos-web \
./deploy/cloudrun.sh
```

The image build intentionally excludes local `.env` files and SQLite databases. Cloud Run's writable filesystem is ephemeral, so the demo database is initialized under `/tmp`; use Cloud SQL or another persistent store before treating this as production data.

The current Google Cloud project must have an open Billing account before Cloud Run, Cloud Build, or Artifact Registry can be enabled.
