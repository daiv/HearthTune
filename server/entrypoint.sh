#!/bin/sh
echo "Updating yt-dlp..."
yt-dlp -U
echo "Waiting for db ..."
echo "Starting application with: $@"
exec "$@"
