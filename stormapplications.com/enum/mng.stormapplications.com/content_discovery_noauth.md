# FFUF Report

  Command line : `ffuf -u https://mng.stormapplications.com/FUZZ -w /usr/share/seclists/Discovery/Web-Content/common.txt -H User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 -mc all -fc 403 -t 5 -p 1 -sa -of md -o /home/ubuntu/stormapplications.com/enum/mng.stormapplications.com/content_discovery_noauth.md`
  Time: 2026-08-23T04:03:34Z

  | FUZZ | URL | Redirectlocation | Position | Status Code | Content Length | Content Words | Content Lines | Content Type | Duration | ResultFile | ScraperData | Ffufhash
  | :- | :-- | :--------------- | :---- | :------- | :---------- | :------------- | :------------ | :--------- | :----------- | :------------ | :-------- |
  | .well-known/http-opportunistic | https://mng.stormapplications.com/.well-known/http-opportunistic |  | 65 | 200 | 36 | 1 | 1 | application/json | 121.069234ms |  |  | 869a441
  