#!/bin/bash

#student application 
#export ="???@??.com, ???@??.com"
#export ="???@??.com, ???@??.com"
#export ="???@??.com, ???@??.com"

#approved agencies 
#export ="???@??.com, ???@??.com"
#export ="???@??.com, ???@??.com"
#export ="???@??.com, ???@??.com"

echo "RUNNING...." &&

docker run --restart always \
-h `hostname` \
-e "NODE_ENV=$NODE_ENV" \
-e "DB_HOST=$SLANE_API_DB_HOST" -e "DB_USER=$SLANE_API_DB_USER" -e "DB_PASSWORD=$SLANE_API_DB_PASSWORD" -e "DB_NAME=$SLANE_API_DB_NAME" \
-e "EMAIL_USER=$SLANE_API_EMAIL_USER" -e "EMAIL_PASSWORD=$SLANE_API_EMAIL_PASSWORD" \
-e "CSV_REPORT_EMAILER_STUDENT_APP_TO=$CSV_REPORT_EMAILER_STUDENT_APP_TO" -e "CSV_REPORT_EMAILER_STUDENT_APP_CC=$CSV_REPORT_EMAILER_STUDENT_APP_CC" -e "CSV_REPORT_EMAILER_STUDENT_APP_BCC=$CSV_REPORT_EMAILER_STUDENT_APP_BCC" \
-e "CSV_REPORT_EMAILER_APPROVED_AGENCY_TO=$CSV_REPORT_EMAILER_APPROVED_AGENCY_TO" -e "CSV_REPORT_EMAILER_APPROVED_AGENCY_CC=$CSV_REPORT_EMAILER_APPROVED_AGENCY_CC" -e "CSV_REPORT_EMAILER_APPROVED_AGENCY_BCC=$CSV_REPORT_EMAILER_APPROVED_AGENCY_BCC" \
-p 41965:3000 -d --name application_csv_emailer student_application_csv_emailer &&

echo "DONE you can test it by running ' curl -i localhost:41965/api/healthcheck '" && 
sh ./dockerize/log.sh