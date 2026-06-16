FROM node:18-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    g++ \
    libcairo2-dev \
    libgif-dev \
    libjpeg-dev \
    libpango1.0-dev \
    librsvg2-dev \
    make \
    pkg-config \
    python3 \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "scripts/start-with-lavalink-wait.js"]
