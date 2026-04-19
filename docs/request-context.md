## Request Context

Request context automatically injects request metadata into all logs
during the lifecycle of an HTTP request.

Injected fields:

- requestId
- actorType
- userId
- handler
- service
- repo
- duration

---

## Usage

### 1. Import logger

In any layer (handler / service / repository):

```ts
import { appLogger } from "@/infrastructure/logger";
```

---

### 2. Write logs normally

```ts
appLogger.info("call service");   // handler
appLogger.info("fetch repo");     // service
appLogger.info("query db");       // repository
```

No need to access requestContext manually.

---

### 3. Result

Logs automatically include request metadata:

```
INFO call service
requestId=req-1
handler=createProductHandler
```

---

## Important

❌ Do NOT call:

requestContext.get()

inside business logic.

Context injection is handled automatically by logger mixin.
