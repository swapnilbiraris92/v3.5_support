<<<<<<< HEAD
# adding columns (vice_sensor, saw_sensor, machine_status) to raw_data and raw_data_rts
-- alter table hmmasterdb.raw_data add vice_sensor TINYINT;
-- alter table hmmasterdb.raw_data add saw_sensor TINYINT;
-- alter table hmmasterdb.raw_data add machine_status TINYINT;
-- alter table hmmasterdb.raw_data_rts add vice_sensor TINYINT;
-- alter table hmmasterdb.raw_data_rts add saw_sensor TINYINT;
-- alter table hmmasterdb.raw_data_rts add machine_status TINYINT;
=======
-- adding columns (vice_sensor, saw_sensor, machine_status) to raw_data and raw_data_rts
alter table hmmasterdb.raw_data add vice_sensor TINYINT;
alter table hmmasterdb.raw_data add saw_sensor TINYINT;
alter table hmmasterdb.raw_data add machine_status TINYINT;
alter table hmmasterdb.raw_data_rts add vice_sensor TINYINT;
alter table hmmasterdb.raw_data_rts add saw_sensor TINYINT;
alter table hmmasterdb.raw_data_rts add machine_status TINYINT;
>>>>>>> a177f736009c332f03680de4629dff7aa247be0e

-- current Sensor
-- creating database hmmasterdbcs
create database if not exists hmmasterdbcs;

-- query table for smooth_data_rts
create table hmmasterdbcs.smooth_data_rts (machine_id varchar(60), ts datetime(6), prediction TINYINT, barcode_id varchar(60), flag TINYINT)
partition by List COLUMNS(machine_id)
 SUBPARTITION BY HASH(MONTH(ts))
 SUBPARTITIONS 12(
    PARTITION 4_01 VALUES IN ('4-01'),
    partition 4_02 VALUES IN ('4-02'),
    partition 4_03 VALUES IN ('4-03'),
    partition 4_05 VALUES IN ('4-05'),
    partition 4_06 VALUES IN ('4-06'),
    partition 4_07 VALUES IN ('4-07'),
    partition 4_09 VALUES IN ('4-09')
);

-- query table for smooth_data
create table hmmasterdbcs.smooth_data (machine_id varchar(60), ts datetime(6), prediction TINYINT, barcode_id varchar(60), flag TINYINT, day_of_year_of_ts SMALLINT)
partition by List COLUMNS(machine_id)
 SUBPARTITION BY HASH(day_of_year_of_ts)
 SUBPARTITIONS 366(
    PARTITION 4_01 VALUES IN ('4-01'),
    partition 4_02 VALUES IN ('4-02'),
    partition 4_03 VALUES IN ('4-03'),
    partition 4_05 VALUES IN ('4-05'),
    partition 4_06 VALUES IN ('4-06'),
    partition 4_07 VALUES IN ('4-07'),
    partition 4_09 VALUES IN ('4-09')
);


-- create table for hourly baased precalculated values
create table hmmasterdbcs.precalculations (machine_id varchar(60), ts datetime(6), operation_time float, down_time float, device_not_connected_time float, date_ts date, hour_ts tinyint(2), month_ts tinyint(2), year_ts smallint(4), day_ts tinyint(2))
partition by List COLUMNS(machine_id)(
    PARTITION 4_01 VALUES IN ('4-01'),
    partition 4_02 VALUES IN ('4-02'),
    partition 4_03 VALUES IN ('4-03'),
    partition 4_05 VALUES IN ('4-05'),
    partition 4_06 VALUES IN ('4-06'),
    partition 4_07 VALUES IN ('4-07'),
    partition 4_09 VALUES IN ('4-09')
);

-- query table for operation info
create table hmmasterdbcs.operation_info (machine_id varchar(60), start_time datetime, end_time datetime)
partition by List COLUMNS(machine_id)(
    PARTITION 4_01 VALUES IN ('4-01'),
    partition 4_02 VALUES IN ('4-02'),
    partition 4_03 VALUES IN ('4-03'),
    partition 4_05 VALUES IN ('4-05'),
    partition 4_06 VALUES IN ('4-06'),
    partition 4_07 VALUES IN ('4-07'),
    partition 4_09 VALUES IN ('4-09')
);

-- query table for device_disconnected_info 
create table hmmasterdbcs.device_disconnected_info (machine_id varchar(60), start_time datetime, end_time datetime)
partition by List COLUMNS(machine_id)(
    PARTITION 4_01 VALUES IN ('4-01'),
    partition 4_02 VALUES IN ('4-02'),
    partition 4_03 VALUES IN ('4-03'),
    partition 4_05 VALUES IN ('4-05'),
    partition 4_06 VALUES IN ('4-06'),
    partition 4_07 VALUES IN ('4-07'),
    partition 4_09 VALUES IN ('4-09')
);

<<<<<<< HEAD
# query table for precalculated values for csv 
create table hmmasterdbcs.csv_info (branch_id varchar(60), machine_id varchar(60), date_of_record date, first_job_time datetime, last_job_timestamp datetime, serial_no int, start_time datetime, end_time datetime, operation_time MEDIUMINT, cut_time MEDIUMINT, feed_time MEDIUMINT, down_time MEDIUMINT, cut_count SMALLINT, barcode text, flag boolean)
=======
-- query table for precalculated values for csv 
create table hmmasterdbcs.csv_info (branch_id varchar(60), machine_id varchar(60), date_of_record date, first_job_time datetime, last_job_timestamp datetime, serial_no int, start_time datetime, end_time datetime, operation_time MEDIUMINT, cut_time MEDIUMINT, feed_time MEDIUMINT, down_time MEDIUMINT, cut_count SMALLINT, barcode text)
>>>>>>> a177f736009c332f03680de4629dff7aa247be0e
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
);

-- create table for max in smooth_data
create table hmmasterdbcs.max_smooth_data (machine_id varchar(60), ts datetime(6), prediction TINYINT);

<<<<<<< HEAD
# inserting initial max values for smooth_data table in max_smooth_data
=======
-- inserting initial max values for smooth_data table in max_smo_data
>>>>>>> a177f736009c332f03680de4629dff7aa247be0e
insert into hmmasterdbcs.max_smooth_data(machine_id, ts) values('4-02', '2019-01-01 00:00:00');
insert into hmmasterdbcs.max_smooth_data(machine_id, ts) values('4-01', '2019-01-01 00:00:00');
insert into hmmasterdbcs.max_smooth_data(machine_id, ts) values('4-03', '2019-01-01 00:00:00');
insert into hmmasterdbcs.max_smooth_data(machine_id, ts) values('4-05', '2019-01-01 00:00:00');
insert into hmmasterdbcs.max_smooth_data(machine_id, ts) values('4-09', '2019-01-01 00:00:00');
insert into hmmasterdbcs.max_smooth_data(machine_id, ts) values('4-07', '2019-01-01 00:00:00');
insert into hmmasterdbcs.max_smooth_data(machine_id, ts) values('4-06', '2019-01-01 00:00:00');

-- creating index on hmmasterdbcs.smooth_data
create index flag_index on hmmasterdbcs.smooth_data (flag);

TRUNCATE hmmasterdb.web_app_parameters;

-- default values for time_setting
use hmmasterdb;

INSERT INTO web_app_parameters (variable, value) VALUES
('start_hr_min', '06:00:00'),
('end_hr_min', '06:00:00'),
('start_hr_min_1', '06:00:00'),
('end_hr_min_1', '06:00:00'),
('status1', '1'),
('start_hr_min_2', '06:00:00'),
('end_hr_min_2', '06:00:00'),
('status2', '0'),
('start_hr_min_3', '06:00:00'),
('end_hr_min_3', '06:00:00'),
('status3', '0'),
('start_hr_min_4', '06:00:00'),
('end_hr_min_4', '06:00:00'),
('status4', '0'),
('start_hr_min_5', '06:00:00'),
('end_hr_min_5', '06:00:00'),
('status5', '0'),
('start_hr_min_6', '06:00:00'),
('end_hr_min_6', '06:00:00'),
('status6', '0');