#!/bin/bash
IP=160.202.130.243
> ports_video02.txt
while read p; do
  [ -z "$p" ] && continue
  if timeout 7 nc -z $IP $p 2>/dev/null; then echo "OPEN $p" >> ports_video02.txt; fi
done < portlist.txt
echo "SCAN_DONE video02" >> scan_status.txt
