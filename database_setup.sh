#!/bin/bash

user=root
password=root
databasesa=hmmasterdb
databasecs=hmmasterdbcs

echo "drop csv_info tables from hmmasterdb and hmmasterdbcs database"
mysql -u"$user" -p"$password" -e "drop table $databasesa.csv_info;"
mysql -u"$user" -p"$password" -e "drop table $databasecs.csv_info;"

echo "successfully droped tables. "
echo "creating csv_info tables in hmmasterdb and hmmasterdbcs database"

mysql -u"$user" -p"$password" -e "create table $databasesa.csv_info (branch_id varchar(60), machine_id varchar(60), date_of_record date, first_job_time datetime, last_job_timestamp datetime, serial_no int, start_time datetime, end_time datetime, operation_time MEDIUMINT, cut_time MEDIUMINT, feed_time MEDIUMINT, down_time MEDIUMINT, cut_count SMALLINT, barcode text, flag tinyint(1))
partition by List COLUMNS(machine_id)
 SUBPARTITION BY HASH(MONTH(start_time))
 SUBPARTITIONS 12(
    PARTITION 4_01 VALUES IN ('4-01'),
    partition 4_02 VALUES IN ('4-02'),
    partition 4_03 VALUES IN ('4-03'),
    partition 4_05 VALUES IN ('4-05'),
    partition 4_06 VALUES IN ('4-06'),
    partition 4_07 VALUES IN ('4-07'),
    partition 4_09 VALUES IN ('4-09')
);"
mysql -u"$user" -p"$password" -e "create table $databasecs.csv_info (branch_id varchar(60), machine_id varchar(60), date_of_record date, first_job_time datetime, last_job_timestamp datetime, serial_no int, start_time datetime, end_time datetime, operation_time MEDIUMINT, cut_time MEDIUMINT, feed_time MEDIUMINT, down_time MEDIUMINT, cut_count SMALLINT, barcode text, flag tinyint(1))
partition by List COLUMNS(machine_id)
 SUBPARTITION BY HASH(MONTH(start_time))
 SUBPARTITIONS 12(
    PARTITION 4_01 VALUES IN ('4-01'),
    partition 4_02 VALUES IN ('4-02'),
    partition 4_03 VALUES IN ('4-03'),
    partition 4_05 VALUES IN ('4-05'),
    partition 4_06 VALUES IN ('4-06'),
    partition 4_07 VALUES IN ('4-07'),
    partition 4_09 VALUES IN ('4-09')
);"

echo "successfully created tables."