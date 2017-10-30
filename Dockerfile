############################################
##ADD THE FOLLOWING ON SERVER ENV####
############################################      

####################
# CSV EMAILER
###################

#student application 
#export CSV_REPORT_EMAILER_STUDENT_APP_TO="???@??.com, ???@??.com"
#export CSV_REPORT_EMAILER_STUDENT_APP_CC="???@??.com, ???@??.com"
#export CSV_REPORT_EMAILER_STUDENT_APP_BCC="???@??.com, ???@??.com"

#approved agencies 
#export CSV_REPORT_EMAILER_APPROVED_AGENCY_TO="???@??.com, ???@??.com"
#export CSV_REPORT_EMAILER_APPROVED_AGENCY_CC="???@??.com, ???@??.com"
#export CSV_REPORT_EMAILER_APPROVED_AGENCY_BCC="???@??.com, ???@??.com"


FROM node:6.11.2

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

# SET ENVIRONMENT VARIABLES
# TRYING TO FIGURE OUT HOW TO USE THIS

EXPOSE 3000

CMD [ "npm", "start" ]

