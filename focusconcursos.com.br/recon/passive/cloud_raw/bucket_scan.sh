#!/bin/bash
# Fresh passive cloud bucket probe - S3 / Azure / GCP - via Tor (Privoxy->SOCKS5)
cd /home/ubuntu/red-team-operator/focusconcursos.com.br/recon/passive/cloud_raw || exit 9
PPT="http://127.0.0.1:8118"
UA="Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0"
OUT=bucket_scan.csv
echo "provider,bucket,endpoint,code,verdict" > $OUT

S3B='fc-static focus-library s3.grupofocus.com.br fc-backup fc-uploads fc-files fc-dev fc-prod fc-assets fc-backups focus-backup focus-backups fc-cdn fc-pdfs fc-migrate fc-frontend fc-database fc-redis fc-logs-backup fc-terraform fc-infra fc-grafana fc-ses fc-crm fc-billing fc-report fc-reports fc-data-lake fc-compliance fc-security focus-data focus-prod focus-dev focus-docs focus-pdf focus-books focus-cdn focus-lms fc-lms fc-api fc-assets-static focus-static focus-assets focus-media fc-media fc-logs fc-temp fc-test fc-demo fc-sandbox fc-staging fc-production fc-upload fc-file focus-files fc-private fc-old fc-new focus-concursos focusconcursos grupofocus focus-grupofocus focusbackup focusuploads focusprod focusdata focus focus-library-2 fc-blog focus-documents focus-edition focus-ebooks focus-pdfs grupofocus-static grupofocus-library grupofocus-backup grupofocus-prod focusconcursos-assets focusconcursos-static focusconcursos-prod'
for B in $S3B; do
    for RG in us-east-1 sa-east-1; do
        if [ "$RG" = "us-east-1" ]; then EP="https://${B}.s3.amazonaws.com/"; else EP="https://s3.${RG}.amazonaws.com/${B}/"; fi
        CODE=$(curl -s -o /dev/null -x $PPT -A "$UA" --max-time 25 -w "%{http_code}" "$EP")
        if [ "$CODE" = "404" ]; then V="NoSuchBucket"
        elif [ "$CODE" = "403" ]; then V="EXISTS-PRIVATE"
        elif [ "$CODE" = "200" ]; then V="EXISTS-PUBLIC-LISTABLE"
        elif [ "$CODE" = "400" ]; then V="BadReq"
        else V="code=$CODE"; fi
        echo "s3,${B},${RG},${CODE},${V}" >> $OUT
        sleep 0.3
    done
done
# Azure
for B in focus focusdata focusprod focusbackups focusuploads focusconcursos grupofocus; do
    X=$(curl -s -o /dev/null -x $PPT -A "$UA" --max-time 20 -w "%{http_code}" "https://${B}.blob.core.windows.net/?maxresults=10&restype=service&comp=properties")
    echo "azure,${B},core.windows.net,${X},- " >> $OUT
    sleep 0.4
done
# GCS
for B in focusconcursos grupofocus focus focus-library fc-static fc-backup focus-assets focus-prod; do
    X=$(curl -s -o /dev/null -x $PPT -A "$UA" --max-time 20 -w "%{http_code}" "https://storage.googleapis.com/${B}/?maxResults=10")
    echo "gcs,${B},storage.googleapis.com,${X},- " >> $OUT
    sleep 0.4
done
echo DONE
