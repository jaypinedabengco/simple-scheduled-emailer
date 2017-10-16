#!/bin/bash

echo "RUNNING...." &&

docker run --restart always \
-h `hostname` \
-e "NODE_ENV=$NODE_ENV" \
-e "DB_HOST=$SLANE_API_DB_HOST" -e "DB_USER=$SLANE_API_DB_USER" -e "DB_PASSWORD=$SLANE_API_DB_PASSWORD" -e "DB_NAME=$SLANE_API_DB_NAME" \
-e "EMAIL_USER=$SLANE_API_EMAIL_USER" -e "EMAIL_PASSWORD=$SLANE_API_EMAIL_PASSWORD" \
-e "CSV_REPORT_EMAILER_TO=$CSV_REPORT_EMAILER_TO" -e "CSV_REPORT_EMAILER_CC=$CSV_REPORT_EMAILER_CC" -e "CSV_REPORT_EMAILER_BCC=$CSV_REPORT_EMAILER_BCC" \
-p 41965:3000 -d --name application_csv_emailer student_application_csv_emailer &&

echo "DONE you can test it by running ' curl -i localhost:41965/api/healthcheck '" && 
sh ./dockerize/log.sh