function inlineFormat(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, '<code style="background:#f4f6f9;padding:2px 5px;border-radius:3px;font-size:13px;font-family:monospace">$1</code>');
}

function renderMarkdown(text) {
  const lines = text.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) { codeLines.push(lines[i]); i++; }
      elements.push(<pre key={i} style={{ background: "#011744", color: "#e2e8f0", borderRadius: 6, padding: "14px 18px", overflowX: "auto", fontSize: 13, margin: "12px 0", lineHeight: 1.6 }}><code>{codeLines.join("\n")}</code></pre>);
      i++; continue;
    }

    if (line.startsWith("|")) {
      const tableLines = [];
      while (i < lines.length && lines[i].startsWith("|")) { tableLines.push(lines[i]); i++; }
      const rows = tableLines.filter(l => !l.match(/^\|[-| ]+\|$/));
      elements.push(
        <table key={i} style={{ width: "100%", borderCollapse: "collapse", margin: "12px 0", fontSize: 13 }}>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} style={{ background: ri === 0 ? "#f4f6f9" : "white" }}>
                {row.split("|").slice(1, -1).map((cell, ci) => (
                  <td key={ci} style={{ border: "1px solid #e2e8f0", padding: "7px 12px", fontWeight: ri === 0 ? 600 : 400 }}>{cell.trim()}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
      continue;
    }

    if (line.startsWith("### ")) { elements.push(<h3 key={i} style={{ fontSize: 15, fontWeight: 600, color: "#ff661f", margin: "20px 0 6px" }}>{line.slice(4)}</h3>); i++; continue; }
    if (line.startsWith("## ")) { elements.push(<h2 key={i} style={{ fontSize: 18, fontWeight: 700, color: "#011744", margin: "28px 0 10px", borderBottom: "2px solid #ff661f", paddingBottom: 6 }}>{line.slice(3)}</h2>); i++; continue; }
    if (line.startsWith("# ")) { elements.push(<h1 key={i} style={{ fontSize: 22, fontWeight: 700, color: "#011744", marginBottom: 20 }}>{line.slice(2)}</h1>); i++; continue; }
    if (line.startsWith("---")) { elements.push(<hr key={i} style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "24px 0" }} />); i++; continue; }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      const items = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) { items.push(lines[i].slice(2)); i++; }
      elements.push(<ul key={i} style={{ paddingLeft: 20, margin: "8px 0" }}>{items.map((it, ii) => <li key={ii} style={{ fontSize: 14, marginBottom: 4, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: inlineFormat(it) }} />)}</ul>);
      continue;
    }

    if (/^\d+\. /.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) { items.push(lines[i].replace(/^\d+\. /, "")); i++; }
      elements.push(<ol key={i} style={{ paddingLeft: 20, margin: "8px 0" }}>{items.map((it, ii) => <li key={ii} style={{ fontSize: 14, marginBottom: 4, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: inlineFormat(it) }} />)}</ol>);
      continue;
    }

    if (line.trim() === "") { elements.push(<div key={i} style={{ height: 6 }} />); i++; continue; }
    elements.push(<p key={i} style={{ fontSize: 14, lineHeight: 1.7, margin: "4px 0" }} dangerouslySetInnerHTML={{ __html: inlineFormat(line) }} />);
    i++;
  }
  return elements;
}

const content = `# Activity Feed — Assignment

## About This Project

This is a full-stack activity feed system built as part of a technical assignment. The goal was to design and implement a production-ready, tenant-isolated activity feed with high write throughput, efficient pagination, and a clean React frontend.

### What was built

- **Backend**: Node.js + TypeScript REST API with Express, MongoDB, Redis, and BullMQ
- **Frontend**: React + Vite SPA with infinite scroll, real-time polling, and activity filtering
- **Queue-based writes**: POST /activities returns 202 immediately — BullMQ worker handles the DB write asynchronously
- **Cursor pagination**: No skip/offset — uses createdAt as cursor with a compound MongoDB index
- **Redis cache**: Feed results cached per tenant, invalidated on every new write
- **Tenant isolation**: Every query and cache key is scoped to tenantId

---

# Assignment Answers

## Task 1 — Activity Feed API

### Schema (MongoDB)

\`\`\`ts
Activity {
  _id, tenantId, actorId, actorName,
  type, entityId, metadata, createdAt
}
\`\`\`

### Compound Index

\`\`\`ts
ActivitySchema.index({ tenantId: 1, createdAt: -1 });
\`\`\`

Every feed query is scoped to a tenant and sorted newest-first. This index satisfies both in one seek — no collection scan, no in-memory sort.

### POST /activities — High Write Throughput

The HTTP handler does not write to MongoDB directly. It enqueues the job to BullMQ (backed by Redis) and returns \`202 Accepted\` immediately — under 1ms response time regardless of DB load.

\`\`\`ts
await enqueueActivity(payload);
res.status(202).json({ success: true, message: "Activity queued" });
\`\`\`

The worker picks up jobs asynchronously and writes to MongoDB with configurable concurrency via \`WORKER_CONCURRENCY\` env var.

### GET /activities/:tenantId — Cursor Pagination

No \`skip()\`, no offset. Uses \`createdAt\` as the cursor:

\`\`\`ts
if (cursor) query.createdAt = { $lt: new Date(cursor) };

Activity.find(query)
  .sort({ createdAt: -1 })
  .limit(limit + 1)
  .select("actorId actorName type entityId metadata createdAt")
  .lean();
\`\`\`

Fetches \`limit + 1\` docs — if the extra exists, \`hasMore: true\` and the last item's \`createdAt\` becomes \`nextCursor\`.

### Tenant Isolation

Every query and cache key is scoped to \`tenantId\`. No cross-tenant data access is possible.

### Redis Cache Layer

Feed results are cached in Redis with a configurable TTL. On every new write, the worker calls \`invalidateFeedCache(tenantId)\` to bust the cache so the next read is fresh.

---

## Task 2 — Performance Debugging

### Why skip() is slow

\`\`\`ts
// slow — never use this for pagination
Activity.find({ tenantId }).skip(page * 20).limit(20)
\`\`\`

MongoDB must scan and discard every document before the offset on every request. On page 500 with 20 items per page, it reads and throws away 10,000 documents. Performance degrades linearly as page number grows — even with an index.

### Cursor-based rewrite (what we use)

\`\`\`ts
const query = { tenantId };
if (cursor) query.createdAt = { $lt: new Date(cursor) };

Activity.find(query)
  .sort({ createdAt: -1 })
  .limit(21)
  .select("actorId actorName type entityId metadata createdAt")
  .lean();
\`\`\`

The index \`{ tenantId: 1, createdAt: -1 }\` lets MongoDB seek directly to the cursor position — O(log n) regardless of how deep in the feed you are.

### Metrics to monitor

- \`docsExamined\` vs \`docsReturned\` via \`explain("executionStats")\` — ratio should be close to 1:1
- Query plan must show \`IXSCAN\` not \`COLLSCAN\`
- P95/P99 query latency in MongoDB Atlas
- Redis cache hit rate — high hit rate means fewer DB queries under load

---

## Task 5 — Scaling to 50M Activities per Tenant

### Indexing

The current compound index \`{ tenantId: 1, createdAt: -1 }\` handles millions well. At 50M per tenant:

- Add a partial index for type filtering: \`{ tenantId: 1, type: 1, createdAt: -1 }\`
- Use TTL indexes for automatic data expiry — no cron job needed:

\`\`\`ts
ActivitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days
\`\`\`

- Always project only the fields the UI needs — never fetch full documents

### Sharding Strategy

Shard on \`{ tenantId: 1, createdAt: -1 }\` — keeps a tenant's data co-located on one shard and supports range queries efficiently. Avoid \`_id\` as shard key — it scatters writes and kills cursor pagination.

Use **zone-based sharding**:
- Small/medium tenants → shared shards
- Large/hot tenants → dedicated shard(s)

This prevents one 50M-doc tenant from degrading performance for smaller tenants.

### Hot Tenant Isolation

1. Dedicated MongoDB replica set for tenants above a write threshold
2. Separate BullMQ queue per hot tenant — prevents one tenant's backlog from blocking others
3. Redis keyspace isolation — prefix cache keys by tier (\`hot:feed:...\` vs \`feed:...\`) with different TTLs
4. Per-tenant rate limiting at the API layer using a Redis sliding window counter

### Data Retention

- **Hot tier**: last 90 days in MongoDB (TTL index handles expiry automatically)
- **Cold tier**: archive older data to S3 as JSONL, expose via a separate read API if needed
- **Aggregation snapshots**: nightly job collapses old events into summary documents to reduce storage without losing history

### Real-time Delivery: WebSocket vs SSE

| | WebSocket | SSE |
|---|---|---|
| Direction | Bidirectional | Server to client only |
| Complexity | Higher — needs WS server and reconnect logic | Lower — plain HTTP |
| Proxy / CDN support | Needs special config | Works out of the box |
| Scaling | Requires sticky sessions or Redis pub/sub | Stateless-friendly |
| Best for | Chat, collaborative editing | Activity feeds, notifications |

**SSE is the right choice here.** The feed is read-only from the client. SSE works over standard HTTP, plays nicely with load balancers, and needs no special infrastructure. At scale, back it with Redis Pub/Sub — when the worker writes a new activity, it publishes to a Redis channel. SSE handlers push the event to connected clients immediately.

---

## Task 6 — Code Review: useEffect Bug

### The buggy code

\`\`\`js
useEffect(() => {
  fetchActivities().then(setActivities);
}, [activities]);
\`\`\`

### The bug

\`activities\` is in the dependency array. Every time \`fetchActivities\` resolves and calls \`setActivities\`, the \`activities\` state updates — which triggers the effect again — which calls \`fetchActivities\` again — infinite loop.

### Production impact

- **Infinite API requests** — the server gets hammered from every mounted client
- **Memory leak** — each fetch schedules another, stacking closures
- **UI thrash** — the list re-renders on every cycle, visible flicker
- **429s / rate limiting** — backend starts rejecting requests, feed goes blank
- At scale, this can take down the API for all tenants if enough users are on the page

### The fix

\`\`\`js
// runs once on mount — no dependency on the result state
useEffect(() => {
  fetchActivities().then(setActivities);
}, []);
\`\`\`

If re-fetching on a specific change is needed, depend on that value — not on the result:

\`\`\`js
useEffect(() => {
  fetchActivities(filter).then(setActivities);
}, [filter]); // re-fetch when filter changes, not when activities changes
\`\`\`

### Prevention strategy

- Enable \`eslint-plugin-react-hooks\` with \`exhaustive-deps\` — catches this at write time
- Code review rule: if a state variable is both set inside an effect and listed as a dependency of the same effect, it is always a bug
- Pattern: effects that produce state should never depend on that same state

---

## Bonus — Event-Driven Architecture

### Implemented flow

\`\`\`
POST /activities
  → validateActivity middleware
  → enqueueActivity (BullMQ → Redis)
  → 202 Accepted immediately (< 1ms)

Worker (BullMQ)
  → Activity.create() in MongoDB
  → invalidateFeedCache() in Redis
\`\`\`

### Tools

- **BullMQ** — battle-tested queue on top of Redis. Supports retries, backoff, concurrency, job deduplication, and dead-letter queues out of the box
- **Redis** — serves as both the queue backend and the feed cache. One infrastructure dependency for two jobs
- **Worker concurrency** — configurable via \`WORKER_CONCURRENCY\` env var. Scale horizontally by running more worker processes

### Idempotency

Job ID is derived from \`tenantId + actorId + entityId + type + unix_second\`:

\`\`\`ts
const jobId = \`\${tenantId}_\${actorId}_\${entityId}_\${type}_\${Math.floor(Date.now() / 1000)}\`;
\`\`\`

BullMQ deduplicates by job ID — if the same action is submitted twice within the same second (double-click, network retry), only one job is enqueued and one record is written.

### Failure handling

- **Retries**: 3 attempts with exponential backoff (1s → 2s → 4s) — handles transient DB blips automatically
- **Dead-letter**: after 3 failures, BullMQ moves the job to the failed set. Last 200 failed jobs are kept for debugging
- **Worker crash**: Redis persists the queue. If the worker dies mid-job, BullMQ re-queues on restart — no data loss
- **Redis down**: the POST endpoint fails at \`enqueueActivity\` and returns 500. Client can retry. Mitigate with Redis Sentinel or Cluster for HA
`;

const AnswersPage = () => (
  <div className="page-wrapper">
    <div style={{ background: "white", borderRadius: 8, border: "1px solid #e2e8f0", padding: "32px 40px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", maxWidth: 860, margin: "0 auto" }}>
      {renderMarkdown(content)}
    </div>
  </div>
);

export default AnswersPage;
