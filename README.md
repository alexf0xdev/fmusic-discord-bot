# FMusic Discord Bot

Discord music bot using [Necord](https://github.com/necordjs/necord), [lavalink-client](https://github.com/Tomato6966/lavalink-client) and build with [Nest.js](https://github.com/nestjs/nest).

Supported services:

- YouTube
- Spotify
- SoundCloud
- Yandex Music
- VKontakte

## Setup

### Install Docker

If you haven't installed Docker yet, install it by running as root:

```
curl -sSL https://get.docker.com | sh
exit
```

And log in again.

### Copy docker compose file

Just download `docker-compose.yml` file from repository

### Fill environment variable

Fill environment variable in the `docker-compose.yml` file

```Dockerfile
environment:
  BOT_TOKEN: '<discord bot token>'
  LAVALINK_HOST: '<lavalink host>'
  LAVALINK_PORT: '<lavalink port>'
  LAVALINK_PASSWORD: '<lavalink password>'
  SENTRY_DSN: '<sentry dsn>'
```

### Run project

To run project use this command:

```
docker-compose up -d
```

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/alexf0xdev/fmusic-discord-bot/blob/main/LICENSE) file for details.
