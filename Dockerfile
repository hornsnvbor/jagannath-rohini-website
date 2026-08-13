# Multi-stage build — uses root structure.
# `docker compose up -d --build` gives you one container serving the website AND the API.
#
# Razorpay Key ID is public (safe to embed in the frontend). Pass it at build time:
#   docker compose build --build-arg VITE_RAZORPAY_KEY_ID=rzp_live_XXXXXXXX
# or set it in the `app.build.args` section of docker-compose.yml.

# ---- Stage 1: build the React frontend ----
FROM node:20-slim AS frontend
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_RAZORPAY_KEY_ID=
ENV VITE_RAZORPAY_KEY_ID=$VITE_RAZORPAY_KEY_ID
RUN npm run build

# ---- Stage 2: Python backend + serve built frontend ----
FROM python:3.11-slim AS backend
WORKDIR /app
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt
COPY backend ./backend
COPY --from=frontend /app/dist ./frontend/dist

WORKDIR /app/backend
EXPOSE 8000
# FRONTEND_DIST must point at ./frontend/dist (set via docker-compose).
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]