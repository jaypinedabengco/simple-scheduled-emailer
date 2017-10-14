#!/bin/bash

echo "BUILDING...." &&
docker build -t student_application_csv_emailer . &&
echo "BUILT"