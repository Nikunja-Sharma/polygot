#!/bin/bash
cd /app

# Initial build if needed
if [ ! -f ./build/chaos-engine ]; then
    mkdir -p build && cd build && cmake -DCMAKE_BUILD_TYPE=Debug .. && cmake --build . --parallel && cd ..
fi

# Start the server
./build/chaos-engine &
PID=$!

echo "Chaos engine started (PID: $PID). Watching for changes..."

# Watch for changes and rebuild (use -n for non-interactive mode in Docker)
while true; do
    find . -maxdepth 1 \( -name "*.cpp" -o -name "*.h" -o -name "CMakeLists.txt" \) 2>/dev/null | entr -n -d sh -c "
        echo 'Change detected, rebuilding...'
        cd build && cmake --build . --parallel
        if [ \$? -eq 0 ]; then
            echo 'Build successful, restarting...'
            kill $PID 2>/dev/null
            cd .. && ./build/chaos-engine &
            echo \$! > /tmp/chaos.pid
        else
            echo 'Build failed!'
        fi
    "
    # Update PID if it changed
    if [ -f /tmp/chaos.pid ]; then
        PID=$(cat /tmp/chaos.pid)
    fi
done
