#!/bin/bash
# Combined API + Worker Startup Script for Render
# This runs both the NestJS API and Python worker in the same container

echo "🚀 Starting RepoLens Combined Service..."
echo "========================================"

# Start NestJS API in background
echo "📡 Starting API Gateway (Port 3001)..."
node apps/api/dist/main.js &
API_PID=$!
echo "✅ API started with PID: $API_PID"

# Wait for API to be ready
echo "⏳ Waiting for API to initialize..."
sleep 5

# Start Python Worker in background
echo "🔧 Starting Analysis Worker..."
cd apps/worker
python3 worker.py &
WORKER_PID=$!
cd ../..
echo "✅ Worker started with PID: $WORKER_PID"

echo "========================================"
echo "✨ All services running!"
echo "   API:    PID $API_PID (Port 3001)"
echo "   Worker: PID $WORKER_PID"
echo "========================================"

# Function to handle shutdown gracefully
cleanup() {
    echo ""
    echo "🛑 Shutdown signal received..."
    echo "   Stopping Worker (PID $WORKER_PID)..."
    kill -TERM $WORKER_PID 2>/dev/null
    echo "   Stopping API (PID $API_PID)..."
    kill -TERM $API_PID 2>/dev/null
    wait $WORKER_PID 2>/dev/null
    wait $API_PID 2>/dev/null
    echo "✅ Clean shutdown complete"
    exit 0
}

# Trap termination signals
trap cleanup SIGTERM SIGINT SIGQUIT

# Keep script running and monitor processes
while true; do
    # Check if API is still running
    if ! kill -0 $API_PID 2>/dev/null; then
        echo "❌ API crashed! Shutting down..."
        kill -TERM $WORKER_PID 2>/dev/null
        exit 1
    fi
    
    # Check if Worker is still running
    if ! kill -0 $WORKER_PID 2>/dev/null; then
        echo "⚠️  Worker crashed! Restarting..."
        cd apps/worker
        python3 worker.py &
        WORKER_PID=$!
        cd ../..
        echo "✅ Worker restarted with PID: $WORKER_PID"
    fi
    
    sleep 10
done

