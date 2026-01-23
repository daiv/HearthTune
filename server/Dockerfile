FROM node:22-bookworm-slim

RUN apt-get update && apt-get install -y \
  ffmpeg \
  python3 \
  curl \
  && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
  && chmod a+rx /usr/local/bin/yt-dlp \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY server/package*.json ./server/

RUN cd server && npm install

COPY common ./common
COPY server ./server

WORKDIR /app/server

RUN chmod +x ./entrypoint.sh

EXPOSE 4000

ENTRYPOINT ["./entrypoint.sh"]

CMD ["npm", "run", "dev"]

