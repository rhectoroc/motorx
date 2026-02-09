#!/bin/sh

# Generate config.js with environment variables
echo "window.env = {" > /usr/share/nginx/html/config.js
echo "  VITE_WEBHOOK_URL: \"${VITE_WEBHOOK_URL}\"" >> /usr/share/nginx/html/config.js
echo "};" >> /usr/share/nginx/html/config.js

# Execute the CMD from Dockerfile
exec "$@"
