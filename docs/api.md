# VisionX REST & WebSocket API Specification

Base URL: `http://localhost:8000/api/v1`

## 1. Authentication Endpoints

### `POST /auth/login`
Authenticates a user and issues a JWT token.
- **Request Body**:
```json
{
  "username": "admin",
  "password": "password"
}
```
- **Response (200 OK)**:
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "role": "admin",
  "username": "admin"
}
```

---

## 2. Camera Management

### `GET /cameras`
Returns list of registered cameras and their live health metrics.

### `POST /cameras`
Registers a new camera or RTSP stream.

---

## 3. Events & Alerts

### `GET /events`
Query events with optional filters (`severity`, `camera_id`, `event_type`, `limit`).

### `POST /events/{id}/ack`
Acknowledge an active alert.

---

## 4. Analytics & AI Queries

### `POST /analytics/ask`
Natural language video query engine ("Ask Your Video What Happened").
- **Request Body**:
```json
{
  "query": "How many vehicles entered through the main gate today?",
  "camera_id": "cam-main-gate"
}
```
- **Response**:
```json
{
  "query": "How many vehicles entered through the main gate today?",
  "intent": "vehicle_traffic_count",
  "structured_query": {
    "table": "events",
    "filter": {"event_type": "line_crossing", "direction": "inbound"},
    "aggregation": "SUM(in_count)"
  },
  "result_count": 42,
  "answer": "A total of 42 vehicles entered through the Main Entrance Gate today...",
  "confidence": 0.98
}
```

### `GET /analytics/summarize`
Generates an executive digest of video activity over a designated time window.

### `GET /analytics/heatmap`
Returns 2D normalized occupancy matrix for spatial rendering.

---

## 5. WebSockets

- `ws://localhost:8000/ws/live/{camera_id}`: Streams live video frames, bounding boxes, persistent track trajectories, and FPS telemetry.
- `ws://localhost:8000/ws/events`: Streams real-time alerts as they are triggered.
- `ws://localhost:8000/ws/telemetry`: Streams system resource utilization (CPU, GPU, latency).
