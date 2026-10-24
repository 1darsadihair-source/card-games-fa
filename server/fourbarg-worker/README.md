# FourBarg online server foundation

This Cloudflare Worker is the beginning of the online four-player room server.

## Included
- `GET /` and `GET /health`: health/status response.
- `POST /api/rooms`: creates a six-character room code.
- `GET /room/:CODE` with WebSocket upgrade: joins a waiting room (up to four connected seats).
- Durable Object `FourBargRoom` owns room state and broadcasts lobby changes.

## Not yet implemented
- FourBarg dealing, turns, scoring, team rules, reconnect identity, abuse/rate limits, or durable player accounts.
- The current endpoint intentionally rejects game actions until server-authoritative rules are implemented.
- Public room codes are not authentication. Do not use this as a production game until identity, reconnect, rate limiting, and rule validation are added.

## Deploy
From this directory with Wrangler installed:
```sh
npx wrangler deploy
```
The first deployment creates the Durable Object class using the v1 SQLite migration. For dashboard deployment, connect this directory/repository to the Worker build configuration and ensure the Wrangler configuration is used.
