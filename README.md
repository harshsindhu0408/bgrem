# BG Remover

Full-stack image background removal app. Upload a JPG/PNG → AI removes the background → replaces it with pure white (#FFFFFF).

**Tech Stack**: React + Vite (frontend) · Python FastAPI (backend) · rembg/IS-Net (AI model) · Pillow (compositing)

---

## Quick Start (Local Dev — no Docker)

### 1. Backend

```bash
cd backend

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies (downloads ~200MB of AI model on first run)
pip install -r requirements.txt

# Start server
uvicorn app.main:application --reload --port 8000
```

> The first startup downloads the IS-Net model (`~/.u2net/isnet-general-use.onnx`, ~176MB).
> Subsequent startups are instant.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

---

## Quick Start (Docker)

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- API docs: http://localhost:8000/docs

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/remove-bg` | Single image → PNG download |
| `POST` | `/api/remove-bg/bulk` | Up to 20 images → JSON with base64 |

### Test with curl

```bash
curl -X POST http://localhost:8000/api/remove-bg \
  -F "file=@your-image.jpg" \
  --output result.png
```

---

## Features

- **Drag-and-drop** multi-file upload
- **Bulk processing** — up to 20 images queued simultaneously
- **Before/After slider** — drag to compare original vs processed
- **Per-file status** — idle → processing → done/error
- **Download All** button for bulk results
- Processed output is always **RGB PNG with #FFFFFF background**

---

## Deployment

### Frontend → Vercel / Netlify
```bash
cd frontend && npm run build
# Deploy the `dist/` directory
```

Set environment variable: `VITE_API_URL=https://your-api-url.com`

### Backend → Railway / Render / DigitalOcean
```bash
# Push the backend/ directory with Dockerfile
# Set PORT=8000
```

---

## Performance

| Metric | Value |
|---|---|
| Processing time (CPU) | ~2-4s / image |
| Processing time (GPU) | ~0.3-0.8s / image |
| Max file size | 15 MB |
| Concurrent bulk workers | 4 threads |
| Model | IS-Net General Use (~176MB) |
