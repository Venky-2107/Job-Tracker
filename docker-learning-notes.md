# Docker — Learning Notes (Job Tracker Containerization)

## 1. What Docker Is & Why It Exists

- Solves the **"works on my machine"** problem — packages your app + its exact environment (language version, dependencies, OS libraries) into a single portable unit.
- Without Docker: you rely on READMEs and hope the target machine matches ("install Python 3.11, install these 15 packages...").
- With Docker: you ship a self-contained box that runs identically anywhere Docker is installed (your machine, a teammate's, Railway, AWS).
- Analogy: like standardized shipping containers — any crane/ship/truck can move them without caring what's inside.

## 2. Core Concepts

| Term                           | Meaning                                                                                                                  |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| **Image**                      | The blueprint/snapshot — read-only. Contains OS + runtime + dependencies + code.                                         |
| **Container**                  | A running instance of an image. Like a class (image) vs an object (container). One image → many containers.              |
| **Dockerfile**                 | Plain text recipe — sequential instructions telling Docker how to build an image. No loops/logic, just a checklist.      |
| **Registry (e.g. Docker Hub)** | Remote storage for images — conceptually identical to GitHub, but for images. `docker pull`/`push` ≈ `git clone`/`push`. |

**Build vs Run:**

- `docker build` → reads Dockerfile → creates an **image** (executes `FROM`, `WORKDIR`, `COPY`, `RUN`)
- `docker run` → starts a **container** from an image (executes `CMD`)

**Important distinction:**

- Environment variables (`.env`, `-e`, `--env-file`) are injected **at runtime** (`docker run`) — no rebuild needed if changed.
- Code/dependency changes (`requirements.txt`, `.py`/`.tsx` files) are baked into the **image at build time** — require a rebuild (`docker build`) to take effect.

## 3. Does Docker Need "Coding"?

No traditional programming. Three things instead:

1. **Dockerfile** — sequential instructions (not logic-based)
2. **CLI commands** — `docker build`, `docker run`, etc. (like `npm install`)
3. **YAML (docker-compose.yml)** — declarative config, describes _what_ you want, not _how_

## 4. Anatomy of a Dockerfile — The 4 Questions

1. What base image do I start from? → `FROM python:3.11-slim`
2. Where does my code go inside the container? → `WORKDIR /app`
3. How do I install dependencies? → `COPY requirements.txt .` then `RUN pip install -r requirements.txt`
4. How do I start the app? → `CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`

**Why `COPY requirements.txt` before `COPY . .`?**
Docker caches layers. If only your source code changes (not `requirements.txt`), Docker reuses the cached "pip install" layer instead of reinstalling everything — much faster rebuilds.

**Why `--host 0.0.0.0` and not `127.0.0.1`?**
`0.0.0.0` = listen on all network interfaces → reachable from outside the container via port mapping. `127.0.0.1` would only accept connections from inside the container itself.

### Backend Dockerfile (FastAPI, Python) — single-stage

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Dockerfile (Plain React + Vite) — multi-stage build

Plain React (unlike Next.js) produces **static files** after build — no long-running Node server needed in production. Uses a multi-stage build: Node to build, then nginx (tiny) to serve.

```dockerfile
# Stage 1: Build the React app
FROM node:20-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
```

Note: Vite's build output folder is `dist/` (Create React App would be `build/` — always check your `package.json` build script).

## 5. Base Image Variants (Python example)

| Tag                  | Size   | Notes                                                                                  |
| -------------------- | ------ | -------------------------------------------------------------------------------------- |
| `python:3.11`        | ~1GB   | Full OS, heavier                                                                       |
| `python:3.11-slim`   | ~150MB | Stripped down — good default choice                                                    |
| `python:3.11-alpine` | ~50MB  | Smallest, but can have compatibility issues with compiled C extensions (e.g. psycopg2) |

## 6. Key Commands Reference

```bash
# Verify install
docker --version
docker run hello-world

# Build an image from a Dockerfile in the current folder
docker build -t <image-name> .

# List images
docker images

# Run a container with port mapping
docker run -p <host-port>:<container-port> <image-name>

# Run a container with env vars
docker run -p 8000:8000 -e DATABASE_URL="postgresql://..." <image-name>
docker run -p 8000:8000 --env-file .env <image-name>

# List running containers
docker ps

# List ALL containers (including stopped)
docker ps -a

# Stop / remove a container
docker stop <container_id_or_name>
docker rm <container_id_or_name>

# Remove all stopped containers
docker container prune
```

## 7. Environment Variables — `.env` Files

- **Right way** to handle secrets (`DATABASE_URL`, `SECRET_KEY`, etc.) — never hardcode into Dockerfile, never commit to git.
- Format inside `.env` file: `KEY=value` — **no quotes needed**, even with special characters like `:`, `@`, `/`.
- Add `.env` to `.gitignore`.
- Same variable names work across environments (local `.env` → Railway dashboard vars → AWS Secrets Manager/ECS task defs later) — only the injection method changes, code (`os.getenv(...)`) stays the same.

**Debugging lesson learned:** A `jose.exceptions.JWSError: Algorithm not supported` error was actually caused by a missing `SECRET_KEY` (no `.env` file present), NOT a missing crypto backend package as first suspected. Lesson: **library error messages aren't always literal about root cause — verify with isolated tests before assuming.**

## 8. Docker Networking Basics

- Port mapping format: `-p HOST_PORT:CONTAINER_PORT`
- **Browser-to-container** works via `localhost` + port mapping because both containers expose ports to the same Windows host, and the browser also runs on that host.
- **Container-to-container** communication is different — one container's `localhost` refers to itself, not another container. This requires shared Docker networking (which `docker-compose` sets up automatically for you).
- In your Job Tracker's case: the React app's API calls originate from the **browser**, not from inside the frontend container — so container-to-container networking wasn't actually needed for your app to work.

## 9. Docker Compose

Orchestrates multiple containers with one file + one command instead of manually running several `docker run` commands.

**`docker-compose.yml`** (place at repo root, since it needs to reference both backend and frontend folders):

```yaml
services:
  backend:
    build: ./python_fastapi
    ports:
      - "8000:8000"
    env_file:
      - ./python_fastapi/.env

  frontend:
    build: ./your-frontend-folder
    ports:
      - "5173:80"
```

**Commands:**

```bash
# Build and start all services
docker compose up --build

# Start without rebuilding (if no code changes)
docker compose up

# Stop and remove all services cleanly
docker compose down

# View logs from all services, live
docker compose logs -f
```

**YAML formatting note:** Indentation is strict — use spaces only (never tabs), consistent nesting (commonly 2 spaces per level).

**Works the same whether frontend/backend are:**

- Two folders in one repo (your actual setup), or
- Two separate repos cloned as sibling folders — `docker-compose.yml` only cares about relative file paths on disk, not git history.

## 10. Docker vs a "Server"

- Docker itself is **not** a server — it's a platform for building/running isolated environments.
- A **container** can run a real server inside it (e.g., uvicorn for FastAPI, nginx for static React files) — Docker just isolates and routes traffic to it via port mapping.

## 11. Local Docker vs "Real" Deployment (bridge to AWS)

- Everything run locally (`docker run`, `docker compose up`) only lives on your machine — inaccessible to anyone else, and stops working if your machine is off.
- The parallel to git/GitHub:

| Git / GitHub                          | Docker / AWS                                           |
| ------------------------------------- | ------------------------------------------------------ |
| `git push`                            | `docker push`                                          |
| GitHub hosts your code                | ECR (Elastic Container Registry) hosts your image      |
| Someone clones + runs code themselves | AWS pulls your image and runs it continuously          |
| Passive storage                       | AWS actively executes your container as a live service |

- Rough real-world deployment flow: **build image → push to ECR → ECS (or similar) runs it continuously with a public URL.**
- This part of the journey continues in a separate AWS-focused learning track.

## 12. What Wasn't Covered (Intentionally Deferred)

These are valid Docker topics but weren't needed for this project and are best learned when a real situation calls for them:

- `docker push` / image tagging for registries (naturally comes up during AWS/ECR learning)
- Container health checks, restart policies, resource limits (matters more at scale)
- Docker volumes (persisting data in containers — not needed since Postgres is hosted externally on Railway)
- Custom Docker networks beyond what Compose sets up automatically

---

_Reference notes compiled from a hands-on Docker learning session — containerizing a FastAPI + React (Vite) Job Tracker app, from zero Docker knowledge to a working multi-container local setup with Docker Compose._
