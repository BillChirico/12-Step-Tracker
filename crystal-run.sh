#!/bin/bash

# crystal-run.sh - Safely kill existing instances and launch the project in web mode

echo "🔍 Checking for running instances..."

# Find and kill processes running expo start for this project
# We check for both 'expo start' and 'node' processes in this directory
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Kill expo processes
if pgrep -f "expo start" > /dev/null; then
    echo "⚠️  Found running expo instances. Killing..."
    pkill -f "expo start"
    sleep 2
fi

# Kill any metro bundler processes
if pgrep -f "metro" > /dev/null; then
    echo "⚠️  Found running metro bundler. Killing..."
    pkill -f "metro"
    sleep 1
fi

# Additional cleanup - kill any node processes running on typical Expo ports
if lsof -ti:8081 > /dev/null 2>&1; then
    echo "⚠️  Found process on port 8081. Killing..."
    kill -9 $(lsof -ti:8081) 2>/dev/null
fi

if lsof -ti:19000 > /dev/null 2>&1; then
    echo "⚠️  Found process on port 19000. Killing..."
    kill -9 $(lsof -ti:19000) 2>/dev/null
fi

if lsof -ti:19001 > /dev/null 2>&1; then
    echo "⚠️  Found process on port 19001. Killing..."
    kill -9 $(lsof -ti:19001) 2>/dev/null
fi

if lsof -ti:19002 > /dev/null 2>&1; then
    echo "⚠️  Found process on port 19002. Killing..."
    kill -9 $(lsof -ti:19002) 2>/dev/null
fi

echo "✅ Cleanup complete!"
echo ""
echo "🚀 Launching project..."
echo ""

# Launch the project and capture output
cd "$PROJECT_DIR"

# Start the dev server in the background and capture its output
EXPO_NO_TELEMETRY=1 pnpm dev 2>&1 | while IFS= read -r line; do
    echo "$line"

    # Check if the line contains a web URL and open it
    if echo "$line" | grep -q "http://localhost:[0-9]*"; then
        URL=$(echo "$line" | grep -o "http://localhost:[0-9]*" | head -1)
        echo ""
        echo "🌐 Opening $URL in browser..."
        open "$URL"
    fi
done
