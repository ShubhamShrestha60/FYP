#!/bin/bash

# Start Python backend
cd /app/python
python server.py &

# Start Node backend
cd /app/server
node server.js &

# Start nginx
nginx -g 'daemon off;' 