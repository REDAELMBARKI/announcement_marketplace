# Announcement App Docker Setup

## Quick Start

### 1. Setup Environment
Copy `.env.example` to `.env` and update with your Docker Hub username:
```bash
cp .env.example .env
```

### 2. Build Images (using docker-compose.yml)
```bash
docker-compose build
```

### 3. Push Images to Docker Hub
```bash
# First login
docker login

# Push both images
docker-compose push
```

### 4. Run Production (using docker-compose.prod.yml)
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## Docker Compose Files

### docker-compose.yml
- **Purpose**: Build and push images
- **Only contains**: `build` and `image` sections
- **No containers, networks, or volumes**

### docker-compose.prod.yml
- **Purpose**: Run the full application in production
- **Contains everything**: containers, networks, volumes, ports, environment
- **Pulls images from Docker Hub**

---

## Commands

### Build & Push
```bash
# Build images
docker-compose build

# Push images
docker-compose push
```

### Production
```bash
# Start
docker-compose -f docker-compose.prod.yml up -d

# Stop
docker-compose -f docker-compose.prod.yml down

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

---

## Ports
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
