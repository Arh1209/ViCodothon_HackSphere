# Use lightweight Python base image
FROM python:3.11-slim

WORKDIR /app

# Install Node.js for frontend build
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Copy backend requirements & install dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy frontend package.json & install dependencies
COPY frontend/package.json ./frontend/package.json
WORKDIR /app/frontend
RUN npm install

# Copy source files
WORKDIR /app
COPY . .

# Build frontend static assets
WORKDIR /app/frontend
RUN npm run build

# Expose port
WORKDIR /app
EXPOSE 8000

ENV PORT=8000
CMD ["python", "-m", "uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
