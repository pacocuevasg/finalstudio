# Render worker: Node + Chromium + FFmpeg + Kokoro (dev voice).
# Build from the repo root: docker build -f worker/Dockerfile .
FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
      chromium ffmpeg python3 python3-pip ca-certificates \
    && pip3 install --break-system-packages kokoro-onnx soundfile \
    && rm -rf /var/lib/apt/lists/*
ENV MOTION_CHROME=/usr/bin/chromium
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages ./packages
COPY worker ./worker
COPY apps/web/package.json ./apps/web/package.json
RUN npm ci
CMD ["npm", "run", "worker"]
