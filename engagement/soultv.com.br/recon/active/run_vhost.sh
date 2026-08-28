#!/bin/bash
cd /home/ubuntu/engagement/soultv.com.br/recon/active
bash vhost_all_ips.sh > vhost_all_ips.log 2>&1
echo "VHOST DONE" >> vhost_all_ips.log
