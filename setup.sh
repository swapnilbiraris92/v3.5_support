#!/bin/bash

user=root
password=root
databasesa=hmmasterdb
databasecs=hmmasterdbcs

# crontab -r
# echo 'removed crontab...'
# node ./flush_redis_db.js
# echo 'taking backup of raw_data table'
# #mysqldump --quick -uroot -proot hmmasterdb raw_data | gzip > ~/raw_data_backup.gz
# echo 'backup complete...'
# echo 'taking backup of raw_data_rts table'
# #mysqldump --quick -uroot -proot hmmasterdb raw_data_rts | gzip > ~/raw_data_backup_rts.gz
# echo 'backup complete...'
# echo 'Dropping database hmmasterdb and hmmasterdbcs';
# mysql -u"$user" -p"$password" -e "DROP DATABASE if exists $databasesa; DROP DATABASE if exists $databasecs; CREATE DATABASE $databasesa; CREATE DATABASE $databasecs;"
# echo 'databases deleted...'
# echo 'database created...'
# echo 'loading raw_data table...'
# gunzip < ~/raw_data_backup.gz | mysql -uroot -proot hmmasterdb
# echo 'raw table successfully loaded...'
# echo 'removing raw_data_backup.gz file...'
# rm ~/raw_data_backup.gz
# echo 'raw_data_backup.gz removed...'
# echo 'loading raw_data_rts table...'
# gunzip < ~/raw_data_backup_rts.gz | mysql -uroot -proot hmmasterdb
# echo 'raw table_rts successfully loaded...'
# echo 'removing raw_data_backup_rts.gz file...'
# rm ~/raw_data_backup_rts.gz
# echo 'raw_data_backup_rts.gz removed...'
# echo 'Update vulues in column ts (local time zone timestamp to utc) in raw_data and raw_data_rts table'
# mysql -u"$user" -p"$password" -e "update $databasesa.raw_data set ts = CONVERT_TZ(ts,'+09:00','UTC');"
# mysql -u"$user" -p"$password" -e "update $databasesa.raw_data_rts set ts = CONVERT_TZ(ts,'+09:00','UTC');"
# echo 'updating values in column ts complet...'
# echo 'creating database structure'
# mysql -u"$user" -p"$password" -e "source ./database.sql"
# mysql -u"$user" -p"$password" -e "source ./databasecs.sql"

echo 'executing smoothing'
python3 /home/a2iot1/swapnil_work/KM/current_sensor/Web_app/WebAppWithCurrentSensor/smoothing.py
echo 'smoothing complete'
echo 'executing smoothing_rts'
python3 /home/a2iot1/swapnil_work/KM/current_sensor/Web_app/WebAppWithCurrentSensor/smoothing_rts.py
echo 'smoothing_rts complete'
echo 'executing precalculation'
python3 /home/a2iot1/swapnil_work/KM/current_sensor/Web_app/WebAppWithCurrentSensor/precalculation.py
echo 'precalculation complete'
echo 'executing operation_info'
python3 /home/a2iot1/swapnil_work/KM/current_sensor/Web_app/WebAppWithCurrentSensor/operation_info.py
echo 'operation_info complete'
echo 'executing csv_info'
python3 /home/a2iot1/swapnil_work/KM/current_sensor/Web_app/WebAppWithCurrentSensor/csv_info.py
echo 'csv_info complete'
echo 'executing periodical_delete_rts'
python3 /home/a2iot1/swapnil_work/KM/current_sensor/Web_app/WebAppWithCurrentSensor/periodical_delete_rts.py
echo 'periodical_delete_rts complete'
