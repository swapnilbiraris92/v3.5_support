-- creatin DATABASE hmmasterdb
create database IF NOT EXISTS hmmasterdb;

-- switching to database
use hmmasterdb;

-- query table for raw_data_rts
create table raw_data_rts (machine_id varchar(60), ts datetime(6), prediction TINYINT, barcode_id varchar(60), flag TINYINT)
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

-- query table for raw_data
create table raw_data (machine_id varchar(60), ts datetime(6), prediction TINYINT, barcode_id varchar(60), flag TINYINT, day_of_year_of_ts SMALLINT)
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

-- query table for smooth_data_rts
create table smooth_data_rts (machine_id varchar(60), ts datetime(6), prediction TINYINT, barcode_id varchar(60), flag TINYINT)
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
create table smooth_data (machine_id varchar(60), ts datetime(6), prediction TINYINT, barcode_id varchar(60), flag TINYINT, day_of_year_of_ts SMALLINT)
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

-- creating login tabel for credentials
CREATE TABLE login (username varchar(60),  password varchar(60));
insert into login values ('admin', 'admin@hm');

-- create table for realtime status page default thresholds
create table realTimeThresholds (machine01 int, machine02 int, machine03 int, machine05 int, machine06 int, machine07 int, machine09 int);

-- inserting default threshold for real time status page
insert into realTimeThresholds values (0, 0, 0, 0, 0, 0, 0);

-- create table for start time and end time values
create table web_app_parameters(variable varchar(60), value varchar(60));

-- create table for hourly baased precalculated values
create table precalculations (machine_id varchar(60), ts datetime(6), operation_time float, down_time float, device_not_connected_time float, date_ts date, hour_ts tinyint(2), month_ts tinyint(2), year_ts smallint(4), day_ts tinyint(2))
partition by List COLUMNS(machine_id)(
    PARTITION 4_01 VALUES IN ('4-01'),
    partition 4_02 VALUES IN ('4-02'),
    partition 4_03 VALUES IN ('4-03'),
    partition 4_05 VALUES IN ('4-05'),
    partition 4_06 VALUES IN ('4-06'),
    partition 4_07 VALUES IN ('4-07'),
    partition 4_09 VALUES IN ('4-09')
);

-- default values for time_setting
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

-- create table for hw_satatus
create table hw_stats ( machine_id varchar(60), ts datetime, MEM_BUFFERS bigint, CPU_IO_WAIT_TIME int, MEM_FREE bigint, CORE_TEMP tinyint, MEM_PCT float, MEM_CACHED bigint, CPU_FREQ int, SWAP_PCT float, CPU_PCT float, DISK_IO_BUSY_TIME bigint, NUM_PROCS int );

-- create table for machine_name to machine_id mapping
CREATE TABLE `machine_names` (
  `machine_id` varchar(60) COLLATE utf8mb4_unicode_520_ci NOT NULL,
  `machine_name` varchar(60) COLLATE utf8mb4_unicode_520_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

-- inserting default values for machine_id to machine-names
INSERT INTO machine_names (machine_id, machine_name) VALUES
('4-01', '4-01'),
('4-02', '4-02'),
('4-03', '4-03'),
('4-05', '4-05'),
('4-06', '4-06'),
('4-07', '4-07'),
('4-09', '4-09'),
('4-C1', '4-C1');

-- query table for operation info
create table operation_info (machine_id varchar(60), start_time datetime, end_time datetime)
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
create table device_disconnected_info (machine_id varchar(60), start_time datetime, end_time datetime)
partition by List COLUMNS(machine_id)(
    PARTITION 4_01 VALUES IN ('4-01'),
    partition 4_02 VALUES IN ('4-02'),
    partition 4_03 VALUES IN ('4-03'),
    partition 4_05 VALUES IN ('4-05'),
    partition 4_06 VALUES IN ('4-06'),
    partition 4_07 VALUES IN ('4-07'),
    partition 4_09 VALUES IN ('4-09')
);

-- query table for precalculated values for csv 
create table csv_info (branch_id varchar(60), machine_id varchar(60), date_of_record date, first_job_time datetime, last_job_timestamp datetime, serial_no int, start_time datetime, end_time datetime, operation_time MEDIUMINT, cut_time MEDIUMINT, feed_time MEDIUMINT, down_time MEDIUMINT, cut_count SMALLINT, barcode text)
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
create table max_smooth_data (machine_id varchar(60), ts datetime(6), prediction TINYINT);

-- inserting initial max values for smooth_data table in max_smo_data
insert into max_smooth_data(machine_id, ts) values('4-01', '2019-01-01 00:00:00');
insert into max_smooth_data(machine_id, ts) values('4-02', '2019-01-01 00:00:00');
insert into max_smooth_data(machine_id, ts) values('4-03', '2019-01-01 00:00:00');
insert into max_smooth_data(machine_id, ts) values('4-05', '2019-01-01 00:00:00');
insert into max_smooth_data(machine_id, ts) values('4-06', '2019-01-01 00:00:00');
insert into max_smooth_data(machine_id, ts) values('4-07', '2019-01-01 00:00:00');
insert into max_smooth_data(machine_id, ts) values('4-09', '2019-01-01 00:00:00');

-- creating index on smooth_data
create index flag_index on smooth_data (flag);

-- creating table for precalculated operatin_time down_time for crane per minute
create table precalculations_crane (ts datetime, operation_time TINYINT, down_time TINYINT, INDEX datetime_precalculations_crane (ts), data_index bigint(20));

-- following query execute only one to precalculate values for crane old data
insert into precalculations_crane
SELECT 
   FROM_UNIXTIME(round(`time@timestamp`,6)-9*3600, '%Y-%m-%d %H:%i') dt,
   sum(data_format_0) operation_time,
   count(data_format_0) - sum(data_format_0) down_time,
   max(data_index) max_id
FROM cranestatus_ubuntu.`cMT-8F59_log000_data`
GROUP BY FROM_UNIXTIME(round(`time@timestamp`,6)-9*3600, '%Y-%m-%d %H:%i');

-- Setting event to precalculate crane values for every minute
CREATE EVENT crane_event
    ON SCHEDULE EVERY 1 minute
    DO
		insert into precalculations_crane
		SELECT 
		FROM_UNIXTIME(round(`time@timestamp`,6)-9*3600, '%Y-%m-%d %H:%i') dt,
		sum(data_format_0) operation_time,
		count(data_format_0) - sum(data_format_0) down_time,
		max(data_index) max_id
		FROM cranestatus_ubuntu.`cMT-8F59_log000_data`
		WHERE data_index > (select data_index from precalculations_crane order by ts desc limit 1)
		GROUP BY FROM_UNIXTIME(round(`time@timestamp`,6)-9*3600, '%Y-%m-%d %H:%i');



