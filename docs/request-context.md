# Request Context

## Overview

This project uses **AsyncLocalStorage** to propagate request metadata across the entire request lifecycle.

Each incoming request automatically receives a context containing:

* requestId
* userId
* actorType
* handler
* service
* repo
* startTime

The context is available anywhere without passing parameters manually.

---

## How It Works

1. `requestContextPlugin` runs on `onRequest`
2. Metadata is stored in AsyncLocalStorage
3. Logger automatically reads the context
4. Logs are enriched without manual wiring

```
HTTP Request
   ↓
Fastify onRequest
   ↓
AsyncLocalStorage
   ↓
Controller → Service → Repository
   ↓
Logger auto-injects metadata
```

---

## Usage

### Access current request context

```ts
import { requestContext } from "@/utils/request-context";

const ctx = requestContext.get();
```

---

### Set handler name (Controller)

```ts
requestContext.set("handler", "createProductController");
```

---

### Set service name

```ts
requestContext.set("service", "createProductService");
```

---

### Set repository name

```ts
requestContext.set("repo", "productRepository");
```

---

## Important Rules

✅ Do:

* Set metadata at logical boundaries (controller/service/repo)
* Let logger read context automatically

❌ Don't:

* Pass requestId manually
* Store request objects globally
* Use context outside request lifecycle

---

## Why This Exists

Without request context:

```
controller → service → repo
```

metadata must be passed manually.

With request context:

```
context flows automatically
```

This enables structured logging, tracing, and observability.
