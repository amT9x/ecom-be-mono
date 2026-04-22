# Ecom Backend Monorepo

Backend service for an ecommerce system built with a **production-style developer workflow**.

---

## 🎯 Problem & Scope

This project simulates a production-style ecommerce backend.

Goals:

- Practice real backend service development instead of CRUD-only APIs
- Model business logic such as orders, inventory and consistency
- Explore production concerns:
  - caching strategy
  - service isolation
  - infrastructure reproducibility
  - local CI workflow

The system intentionally focuses on backend engineering rather than UI.

This repository provides:

- Application server (Node.js + TypeScript)
- Infrastructure managed by Docker
- PostgreSQL + Redis services
- SQL migration & seed system
- Makefile-based developer experience (DX)
- CI-like local workflow

---

## 🧱 Tech Stack

- Node.js (TypeScript)
- PostgreSQL 16
- Redis 7
- Docker Compose
- Makefile automation

---

## ✅ Requirements

Install the following tools:

```
node >= 24.14.1
docker >= 29.4.0
make (GNU Make)
```

Verify environment:

```
make doctor
```

Example output:

```
🩺 Environment Doctor
Docker CLI      ✅
Docker daemon   ✅
Node.js         ✅
ENV             local
ENV file        .env.local
```

---

## 🌱 Environment Setup

Environment variables are loaded automatically from:

```
.env.<ENV>
```

Default environment:

```
ENV=local
```

Create your local environment file:

```
cp .env.example .env.local
```

You may also run commands with a specific environment:

```
make bootstrap ENV=docker
```

---

## ⚡ Quick Start

Bootstrap everything:

```
make bootstrap
```

Start development server:

```
make dev
```

Server:

```
http://localhost:3001
```

---

## 🚀 What `make bootstrap` Does

Bootstrap prepares the entire system:

- Build Docker images
- Start PostgreSQL + Redis
- Create db user
- Create db
- Install db extensions
- Run migrations
- Seed development data

Run this **once after cloning**.

---

## 🧭 Development Workflow

### Start infrastructure

```
make up
```

### Stop infrastructure

```
make down
```

### Restart infrastructure

```
make infra-restart
```

### View logs

```
make infra-logs
```

### Run development server

```
make dev
```

---

## 🗄 Database Workflow

### Open PostgreSQL shell

```
make db-psql
```

### Run migrations

```
make db-migrate
```

### Seed development data

```
make db-seed-dev
```

### Reset table data

```
make reset-table-data
```

### Reset entire schema

```
make db-reset-schema
```

### Fresh dev data

```
make db-fresh-data
```

---

## 🧪 Testing

Run all tests:

```
make test
```

Unit tests:

```
make test-unit
```

Integration tests:

```
make test-int
```

Watch mode:

```
make test-watch
```

---

## 🧹 Code Quality

Lint:

```
make lint
```

Type checking:

```
make typecheck
```

Auto format:

```
make format
```

Auto fix:

```
make fix
```

Run full checks:

```
make check
```

---

## 🔁 CI Simulation (Local)

Run the same workflow as CI:

```
make ci
```

Includes:

- environment doctor
- install dependencies
- lint
- typecheck
- integration tests

---

## 🏗 Infrastructure

Services managed by Docker Compose:

```
PostgreSQL 16
Redis 7
```

Compose file:

```
docker/docker-compose.yml
```

Database container:

```
infra-wsl2-postgres-1
```

---

## 🔄 Typical Daily Flow

After cloning:

```
make bootstrap
make dev
```

Normal development day:

```
make up
make dev
```

Reset database data:

```
make reset-table-data
```

Before pushing:

```
make ci
```

---
