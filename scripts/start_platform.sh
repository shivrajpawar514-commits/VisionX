#!/usr/bin/env bash
# VisionX Platform Launcher (FastAPI Backend + React Frontend)
set -e

echo "=================================================="
echo "      VISIONX REAL-TIME VIDEO ANALYTICS PLATFORM  "
echo "=================================================="

# Function to clean up background processes on exit
cleanup() {
    echo ""
    echo "Stopping VisionX platform services..."
    kill $(jobs -p) 2>/dev/null || true
}
trap cleanup EXIT

# 1. Seed database if empty
python3 scripts/seed_database.py

# 2. Start FastAPI Backend Server
echo "Starting VisionX Backend API on http://localhost:8000..."
uvicorn src.api.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait briefly for backend to initialize
sleep 2

# 3. Start React Frontend Dev Server
echo "Starting VisionX Dashboard on http://localhost:5173..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "VisionX is up and running!"
echo "• Frontend Console: http://localhost:5173"
echo "• Backend Swagger:  http://localhost:8000/docs"
echo "• Prometheus Metrics: http://localhost:8000/metrics"
echo ""
echo "Press Ctrl+C to stop all services."

# Wait on background processes
wait
