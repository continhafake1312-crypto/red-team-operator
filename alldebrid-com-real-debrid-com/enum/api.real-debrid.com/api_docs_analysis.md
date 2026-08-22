# API Documentation Analysis - api.real-debrid.com
**Date:** 2026-08-22T20:34:00Z
**Source:** GET https://api.real-debrid.com/ (296KB HTML, jQuery-based)

## Key Observations
- Single HTML page documentation (~296KB)
- jQuery-based with client-side rendering
- Same docs served on all 11 api/app subdomains
- OAuth2 Device Code flow for authentication
- REST API version 1.0

## Authentication Flow
1. Client registers app on https://real-debrid.com/apitoken
2. Gets client_id and client_secret
3. Uses OAuth2 Device Code flow:
   - POST /oauth/v2/device/code
   - POST /oauth/v2/token
4. Access token used as query param: ?auth_token=<token>

## Potential Vulnerabilities to Test
- API endpoint enumeration (test all discovered endpoints)
- Mass assignment on POST/PUT endpoints
- IDOR on /downloads/delete/{id}, /torrents/delete/{id}, /torrents/info/{id}
- Rate limiting on /oauth/v2/device/code, /oauth/v2/token
- Broken authentication on /disable_access_token
- SSRF on /unrestrict/link, /unrestrict/check
- Path traversal on /torrents/addTorrent (file upload)
- File upload bypass on /settings/avatarFile
- Enumeration via /hosts/status, /traffic/details
- Parameter pollution on /unrestrict/link

## Test Commands
# Test OAuth2 endpoints
curl -sk "https://api.real-debrid.com/oauth/v2/device/code?client_id=test&scope=read"
curl -sk "https://api.real-debrid.com/oauth/v2/token"

# Test REST API endpoints
curl -sk "https://api.real-debrid.com/rest/1.0/hosts"
curl -sk "https://api.real-debrid.com/rest/1.0/hosts/domains"
curl -sk "https://api.real-debrid.com/rest/1.0/hosts/regex"
curl -sk "https://api.real-debrid.com/rest/1.0/user"
curl -sk "https://api.real-debrid.com/rest/1.0/traffic"
curl -sk "https://api.real-debrid.com/rest/1.0/settings"
curl -sk "https://api.real-debrid.com/rest/1.0/downloads"
curl -sk "https://api.real-debrid.com/rest/1.0/torrents"