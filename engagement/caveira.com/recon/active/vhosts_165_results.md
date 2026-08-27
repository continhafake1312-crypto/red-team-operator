# FFUF Report

  Command line : `ffuf -u http://165.227.4.115/ -H Host: FUZZ.caveira.com -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt -x socks5://127.0.0.1:9050 -fc 301 -fs 0 -t 8 -timeout 15 -ac -of all -o vhosts_165_results -od vhosts_165_raw`
  Time: 2026-08-27T04:25:44Z

  | FUZZ | URL | Redirectlocation | Position | Status Code | Content Length | Content Words | Content Lines | Content Type | Duration | ResultFile | ScraperData | Ffufhash
  | :- | :-- | :--------------- | :---- | :------- | :---------- | :------------- | :------------ | :--------- | :----------- | :------------ | :-------- |
  | teste | http://165.227.4.115/ |  | 333 | 200 | 32699 | 995 | 213 | text/html; charset=UTF-8 | 851.481447ms | 23e69e8df8d1c898e155d82b8d4fb81f |  | 819b614d
  