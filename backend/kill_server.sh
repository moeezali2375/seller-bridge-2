
NODE_PID=$(ps aux | grep 'node server.js' | grep -v grep | awk '{print $2}')
UVICORN_PID=$(ps aux | grep 'uvicorn main:app' | grep -v grep | awk '{print $2}')

if [ -z "$NODE_PID" ]; then
  echo "Node server is not running."
else
  kill -9 $NODE_PID
  echo "Node server (PID: $NODE_PID) has been terminated."
fi

if [ -z "$UVICORN_PID" ]; then
  echo "Uvicorn server is not running."
else
  kill -9 $UVICORN_PID
  echo "Uvicorn server (PID: $UVICORN_PID) has been terminated."
fi
