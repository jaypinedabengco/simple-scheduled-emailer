#!/bin/bash

echo "RUNNING...." &&

docker run --restart always \
-h `hostname` \
-e "NODE_ENV=$NODE_ENV" \
-e "DB_HOST=$SLANE_API_DB_HOST" -e "DB_USER=$SLANE_API_DB_USER" -e "DB_PASSWORD=$SLANE_API_DB_PASSWORD" -e "DB_NAME=$SLANE_API_DB_NAME" \
-e "EMAIL_USER=$SLANE_API_EMAIL_USER" -e "EMAIL_PASSWORD=$SLANE_API_EMAIL_PASSWORD" \
-e "CSV_REPORT_EMAILER_STUDENT_APP_TO=$CSV_REPORT_EMAILER_STUDENT_APP_TO" -e "CSV_REPORT_EMAILER_STUDENT_APP_CC=$CSV_REPORT_EMAILER_STUDENT_APP_CC" -e "CSV_REPORT_EMAILER_STUDENT_APP_BCC=$CSV_REPORT_EMAILER_STUDENT_APP_BCC" \
-e "CSV_REPORT_EMAILER_STUDENT_FULL_DETAILS_TO=$CSV_REPORT_EMAILER_STUDENT_FULL_DETAILS_TO" -e "CSV_REPORT_EMAILER_STUDENT_FULL_DETAILS_CC=$CSV_REPORT_EMAILER_STUDENT_FULL_DETAILS_CC" -e "CSV_REPORT_EMAILER_STUDENT_FULL_DETAILS_BCC=$CSV_REPORT_EMAILER_STUDENT_FULL_DETAILS_BCC" \
-e "CSV_REPORT_EMAILER_APPROVED_AGENCY_TO=$CSV_REPORT_EMAILER_APPROVED_AGENCY_TO" -e "CSV_REPORT_EMAILER_APPROVED_AGENCY_CC=$CSV_REPORT_EMAILER_APPROVED_AGENCY_CC" -e "CSV_REPORT_EMAILER_APPROVED_AGENCY_BCC=$CSV_REPORT_EMAILER_APPROVED_AGENCY_BCC" \
-e "CSV_REPORT_EMAILER_ALL_AGENCY_TO=$CSV_REPORT_EMAILER_ALL_AGENCY_TO" -e "CSV_REPORT_EMAILER_ALL_AGENCY_CC=$CSV_REPORT_EMAILER_ALL_AGENCY_CC" -e "CSV_REPORT_EMAILER_ALL_AGENCY_BCC=$CSV_REPORT_EMAILER_ALL_AGENCY_BCC" \
-e "CSV_REPORT_EMAILER_PREFERRED_INTAKE_TO=$CSV_REPORT_EMAILER_PREFERRED_INTAKE_TO" -e "CSV_REPORT_EMAILER_PREFERRED_INTAKE_CC=$CSV_REPORT_EMAILER_PREFERRED_INTAKE_CC" -e "CSV_REPORT_EMAILER_PREFERRED_INTAKE_BCC=$CSV_REPORT_EMAILER_PREFERRED_INTAKE_BCC" \
-e "CSV_REPORT_EMAILER_WEEKLY_POTENTIAL_INVOICING_TO=$CSV_REPORT_EMAILER_WEEKLY_POTENTIAL_INVOICING_TO" -e "CSV_REPORT_EMAILER_WEEKLY_POTENTIAL_INVOICING_CC=$CSV_REPORT_EMAILER_WEEKLY_POTENTIAL_INVOICING_CC" -e "CSV_REPORT_EMAILER_WEEKLY_POTENTIAL_INVOICING_BCC=$CSV_REPORT_EMAILER_WEEKLY_POTENTIAL_INVOICING_BCC" \
-e "CSV_REPORT_EMAILER_STUDENT_WITH_STUDY_COMMENCED_APPLICATION_TO=$CSV_REPORT_EMAILER_STUDENT_WITH_STUDY_COMMENCED_APPLICATION_TO" -e "CSV_REPORT_EMAILER_STUDENT_WITH_STUDY_COMMENCED_APPLICATION_CC=$CSV_REPORT_EMAILER_STUDENT_WITH_STUDY_COMMENCED_APPLICATION_CC" -e "CSV_REPORT_EMAILER_STUDENT_WITH_STUDY_COMMENCED_APPLICATION_BCC=$CSV_REPORT_EMAILER_STUDENT_WITH_STUDY_COMMENCED_APPLICATION_BCC" \
-e "CSV_REPORT_EMAILER_INSTITUTION_TO=$CSV_REPORT_EMAILER_INSTITUTION_TO" -e "CSV_REPORT_EMAILER_INSTITUTION_CC=$CSV_REPORT_EMAILER_INSTITUTION_CC" -e "CSV_REPORT_EMAILER_INSTITUTION_BCC=$CSV_REPORT_EMAILER_INSTITUTION_BCC" \
-p 41965:3000 -d --name application_csv_emailer student_application_csv_emailer &&

echo "DONE you can test it by running ' curl -i localhost:41965/api/healthcheck '" && 
echo "or by direct trigger ' curl -i localhost:41965/api/trigger/[name] '" && 
sh ./dockerize/log.sh