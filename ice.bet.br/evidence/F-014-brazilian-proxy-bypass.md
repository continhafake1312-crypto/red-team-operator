# Brazilian Proxy Bypass - ice.bet.br
Proxy: 201.20.42.46:3127
Cloudflare geo-block bypassed: YES

## API Tenant Bypass Achievements
- X-Tenant-ID: ice header confirms
- /v1/games: 20 games with RTP values exposed
- /v1/countries: ALL countries with dial codes
- /v1/health: health status
- /v1/bets: 403 Forbidden (protected)
- /v1/users: 403 Forbidden (protected)

## Blog Admin Access Achievements
- /admin: Login page accessible (200)
- /admin/login: Admin login page (200)
- /admin/create-first-user: First user page (200)
- POST /api/users: 403 (first user already created)
- /api/users/me: 200 (no user logged in)
- /api/access: Full permission structure (3KB)

## Payload CMS Configuration Exposed
- Build ID: uat16f4ShlhyWykUKB6K6
- Routes: admin=/admin, api=/api, graphQL=/graphql
- Max login attempts: 5 (lock time 15 min)
- Token expiration: 8 hours
- S3 Storage: storage-s3-generate-signed-url
- Collections: users, posts, media, categories, authors, redirects, search
