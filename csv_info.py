from datetime import datetime as dt
from dateutil.relativedelta import relativedelta
from datetime import datetime as dt
import mysql.connector as mdb
from datetime import timedelta
import config
import re

# reading config
mysql_host = config.host
mysql_user = config.user
mysql_password = config.password
raw_tables_database = config.database_sa
mysql_database_sa = config.database_sa
mysql_database_cs = config.database_cs

barcode_flag = 0

machine_list = ['4-01', '4-02', '4-03', '4-05', '4-06', '4-07', '4-09']


def csv_info_fun(database_name):
    """

    :param database_name:
    """
    csv_info = []
    branch_id = 4
    production_count_threshold = 1

    conn = mdb.connect(host=mysql_host, user=mysql_user, password=mysql_password, auth_plugin='mysql_native_password',
                       database=database_name)
    cursor = conn.cursor()

    for machine in machine_list:
        csv_info = []
        older_timestamp = dt.now()
        serial_no = 0
        query = "select * from csv_info where machine_id = '" + machine + "' order by end_time desc limit 1"
        cursor.execute(query)
        machine_id = machine
        max_time = cursor.fetchall()
        if len(max_time) == 0:
            query = "select min(start_time) from operation_info where machine_id = '" + machine + "' "
            cursor.execute(query)
            day_start = cursor.fetchall()[0][0]
            if day_start:
                if day_start.hour < 6:
                    day_end = day_start.replace(hour=6, minute=0, second=0, microsecond=0)
                    day_start = day_end - relativedelta(days=1)
                else:
                    day_start = day_start.replace(hour=6, minute=0, second=0, microsecond=0)
                    day_end = day_start + relativedelta(days=1)

                while day_start < dt.now():

                    partition_list = ''

                    partition_start_day = day_start.timetuple().tm_yday
                    if partition_start_day == 366:
                        partition_start_day = 0

                    partition_end_day = dt.now().timetuple().tm_yday
                    if partition_end_day == 366:
                        partition_end_day = 0

                    partition_day_list = []
                    if day_start.year == dt.now().year and partition_start_day == partition_end_day:
                        partition_day_list.append(partition_start_day)
                    elif partition_start_day < partition_end_day:
                        for partition_day in range(partition_start_day, partition_end_day + 1):
                            partition_day_list.append(partition_day)
                    else:
                        for partition_day in range(partition_start_day, 366):
                            partition_day_list.append(partition_day)
                        for partition_day in range(0, partition_end_day + 1):
                            partition_day_list.append(partition_day)

                    for partition_day in partition_day_list:
                        partition_list = partition_list + machine.replace('-', '_') + "sp" + str(partition_day) + ", "

                    partition_list = partition_list[0: len(partition_list) - 2]

                    serial_no = 0
                    query = "select * from operation_info where machine_id = '" + machine + "' and end_time > '" + str(
                        day_start) + "' and start_time < '" + str(day_end) + "' and start_time > '" + str(
                        day_start) + "' order by start_time"
                    cursor.execute(query)
                    raw_data = cursor.fetchall()
                    if len(raw_data) == 0:
                        pass
                    else:
                        counter = 0
                        i = 0
                        for instance in raw_data:
                            i += 1
                            counter = counter + 1
                            date_of_record = day_start.strftime("%Y-%m-%d")
                            query = "select min(start_time) from operation_info where machine_id = '" + machine + \
                                    "' and start_time >= '" + str(day_start) + "' and start_time < '" + str(day_end) + "' "
                            cursor.execute(query)
                            first_job_timestamp = cursor.fetchall()[0][0]
                            query = "select max(end_time) from operation_info where machine_id = '" + machine + \
                                    "' and start_time >= '" + str(day_start) + "' and start_time < '" + str(day_end) + "' "
                            cursor.execute(query)
                            last_job_timestamp = cursor.fetchall()[0][0]
                            if last_job_timestamp:
                                pass
                            else:
                                last_job_timestamp = day_end - relativedelta(seconds=1)
                            operation_start_time = instance[1]

                            if instance[1] < day_start:
                                instance_day_end_time = instance[1].replace(hour=6, minute=0, second=0, microsecond=0)
                                instance_day_start_time = instance_day_end_time - relativedelta(days=1)
                                operation_start_time = day_start.replace(hour=6, minute=0, second=0, microsecond=0)
                                first_job_timestamp = day_start.replace(hour=6, minute=0, second=0, microsecond=0)
                            else:
                                instance_day_start_time = instance[1].replace(hour=6, minute=0, second=0, microsecond=0)
                                instance_day_end_time = instance_day_start_time + relativedelta(days=1)

                            serial_no = serial_no + 1
                            operation_end_time = instance[2]
                            if operation_end_time:
                                operation_time = instance[2] - instance[1]

                                partition_list_instance = ''

                                partition_start_day = instance[1].timetuple().tm_yday
                                if partition_start_day == 366:
                                    partition_start_day = 0

                                partition_end_day = instance[2].timetuple().tm_yday
                                if partition_end_day == 366:
                                    partition_end_day = 0

                                partition_day_list = []
                                if instance[1].year == instance[2].year and partition_start_day == partition_end_day:
                                    partition_day_list.append(partition_start_day)
                                elif partition_start_day < partition_end_day:
                                    for partition_day in range(partition_start_day, partition_end_day + 1):
                                        partition_day_list.append(partition_day)
                                else:
                                    for partition_day in range(partition_start_day, 366):
                                        partition_day_list.append(partition_day)
                                    for partition_day in range(0, partition_end_day + 1):
                                        partition_day_list.append(partition_day)

                                for partition_day in partition_day_list:
                                    partition_list_instance = partition_list_instance + machine.replace('-', '_') + "sp" \
                                                              + str(partition_day) + ", "

                                partition_list_instance = partition_list_instance[0: len(partition_list_instance) - 2]

                                query = "select count(*) from smooth_data partition( " + partition_list_instance + \
                                        " ) where prediction = 2 and ts >= '" + \
                                        str(instance[1]) + "' and ts < '" + str(instance[2]) + "' "
                                cursor.execute(query)
                                cut_time = timedelta(seconds=cursor.fetchall()[0][0])
                                feed_time = operation_time - cut_time
                                if counter < len(raw_data):
                                    downtime = raw_data[counter][1] - instance[2]
                                else:
                                    downtime = None
                                query = "select * from smooth_data partition( " + partition_list_instance + \
                                        ") where ts >= '" + str(instance[1]) + "' and ts < '" + str(instance[2]) + \
                                        "' order by ts"
                                cursor.execute(query)
                                production_count_raw_data = cursor.fetchall()

                                production_count = 0
                                off_flag = 0
                                on_flag = 0
                                machine_flag = 0

                                for production_count_instance in production_count_raw_data:
                                    if production_count_instance[2] == 1 or production_count_instance[2] == 0:
                                        off_flag += 1
                                        on_flag = 0
                                        if off_flag == production_count_threshold and machine_flag == 1:
                                            machine_flag = 0
                                    else:
                                        off_flag = 0
                                        on_flag += 1
                                        if on_flag == production_count_threshold and machine_flag == 0:
                                            machine_flag = 1
                                            # production count increase on state change to cut on
                                            production_count = production_count + 1

                                partition_list_barcode = ''

                                partition_start_day = day_start.timetuple().tm_yday
                                if partition_start_day == 366:
                                    partition_start_day = 0

                                partition_end_day = instance[2].timetuple().tm_yday
                                if partition_end_day == 366:
                                    partition_end_day = 0

                                partition_day_list = []
                                if day_start.year == instance[2].year and partition_start_day == partition_end_day:
                                    partition_day_list.append(partition_start_day)
                                elif partition_start_day < partition_end_day:
                                    for partition_day in range(partition_start_day, partition_end_day + 1):
                                        partition_day_list.append(partition_day)
                                else:
                                    for partition_day in range(partition_start_day, 366):
                                        partition_day_list.append(partition_day)
                                    for partition_day in range(0, partition_end_day + 1):
                                        partition_day_list.append(partition_day)

                                for partition_day in partition_day_list:
                                    partition_list_barcode = partition_list_barcode + machine.replace('-', '_') + "sp" \
                                                             + str(partition_day) + ", "

                                partition_list_barcode = partition_list_barcode[0: len(partition_list_barcode) - 2]

                                if counter < 2:
                                    query = "SELECT group_concat(barcode_id) \
                                        FROM (select * from smooth_data partition( " + partition_list_barcode + ") \
                                        WHERE flag = 1 AND ts> '" + str(day_start) + "' \
                                            AND ts<= '" + str(instance[2]) + "' limit 99) as e;"
                                else:
                                    query = "SELECT group_concat(barcode_id) \
                                        FROM (select * from smooth_data partition( " + partition_list_barcode + ") \
                                        WHERE flag = 1  and ts> '" + str(raw_data[counter - 2][2]) + "' \
                                            AND ts<= '" + str(instance[2]) + "' limit 99) as e;"
                                cursor.execute(query)
                                barcode_list = cursor.fetchall()
                                if barcode_list[0][0]:
                                    barcode_list = barcode_list[0][0]
                                    barcode_arr = barcode_list.split(',')
                                    barcode_list = ""
                                    for barcode_instance in barcode_arr:
                                        if len(barcode_instance) > 3:
                                            barcode_list = barcode_list + "," + barcode_instance
                                    barcode_list = barcode_list[1:]
                                    barcode_flag = 1
                                else:
                                    query = "SELECT group_concat(barcode_id) \
                                        FROM (select * from smooth_data partition( " + machine.replace('-', '_') + " ) \
                                        WHERE flag = 1 \
                                        AND ts <= '" + str(instance[1]) + "' \
                                            order by ts desc limit 1) as e;"
                                    cursor.execute(query)
                                    barcode_list = cursor.fetchall()
                                    barcode_flag = 0
                                    if barcode_list[0][0]:
                                        barcode_list = barcode_list[0][0]
                                        barcode_arr = barcode_list.split(',')
                                        barcode_list = ""
                                        for barcode_instance in barcode_arr:
                                            if len(barcode_instance) > 3:
                                                barcode_list = barcode_list + "," + barcode_instance
                                        barcode_list = barcode_list[1:]
                                        if re.search("(^,+$)", barcode_list):
                                            barcode_flag = 1
                                    else:
                                        barcode_list = None

                                if downtime:
                                    csv_info.append((branch_id, machine_id, date_of_record, first_job_timestamp,
                                                     last_job_timestamp, serial_no, operation_start_time,
                                                     operation_end_time, operation_time.total_seconds(),
                                                     cut_time.total_seconds(), feed_time.total_seconds(),
                                                     downtime.total_seconds(), production_count, barcode_list, barcode_flag))
                                else:
                                    csv_info.append((branch_id, machine_id, date_of_record, first_job_timestamp,
                                                     last_job_timestamp, serial_no, operation_start_time,
                                                     operation_end_time, operation_time.total_seconds(),
                                                     cut_time.total_seconds(), feed_time.total_seconds(), downtime,
                                                     production_count, barcode_list, barcode_flag))
                            else:
                                csv_info.append((branch_id, machine_id, date_of_record, first_job_timestamp,
                                                 last_job_timestamp, serial_no, operation_start_time, None, None, None,
                                                 None, None, None, None, False))
                    day_start = day_end
                    day_end = day_start + relativedelta(days=1)
        else:
            max_time = max_time[0][7]

            day_start = max_time
            if day_start:
                if day_start.hour < 6:
                    day_end = day_start.replace(hour=6, minute=0, second=0, microsecond=0)
                    day_start = day_end - relativedelta(days=1)
                else:
                    day_start = day_start.replace(hour=6, minute=0, second=0, microsecond=0)
                    day_end = day_start + relativedelta(days=1)

                while day_start < dt.now():
                    partition_list = ''

                    partition_start_day = day_start.timetuple().tm_yday
                    if partition_start_day == 366:
                        partition_start_day = 0

                    partition_end_day = dt.now().timetuple().tm_yday
                    if partition_end_day == 366:
                        partition_end_day = 0

                    partition_day_list = []
                    if day_start.year == dt.now().year and partition_start_day == partition_end_day:
                        partition_day_list.append(partition_start_day)
                    elif partition_start_day < partition_end_day:
                        for partition_day in range(partition_start_day, partition_end_day + 1):
                            partition_day_list.append(partition_day)
                    else:
                        for partition_day in range(partition_start_day, 366):
                            partition_day_list.append(partition_day)
                        for partition_day in range(0, partition_end_day + 1):
                            partition_day_list.append(partition_day)

                    for partition_day in partition_day_list:
                        partition_list = partition_list + machine.replace('-', '_') + "sp" + str(partition_day) + ", "

                    partition_list = partition_list[0: len(partition_list) - 2]

                    serial_no = 0

                    # 01112019 updating where clause to match where clause in select query
                    # fix for deleting record between days
                    query = "delete from csv_info where machine_id = '" + machine + "' and end_time > '" + str(day_start) +\
                            "' and start_time < '" + str(day_end) + "' and start_time > '" + str(
                        day_start) + "' order by start_time"
                    cursor.execute(query)
                    cursor.execute("commit")
                    query = "select * from operation_info where machine_id = '" + machine + "' and end_time > '" + str(
                        day_start) + "' and start_time < '" + str(day_end) + "' and start_time > '" + str(
                        day_start) + "' order by start_time"
                    cursor.execute(query)
                    raw_data = cursor.fetchall()
                    if len(raw_data) == 0:
                        pass
                    else:
                        counter = 0
                        for instance in raw_data:
                            counter = counter + 1
                            date_of_record = day_start.strftime("%Y-%m-%d")

                            query = "select min(start_time) from operation_info where machine_id = '" + machine + \
                                    "' and start_time >= '" + str(day_start) + "' and start_time < '" + str(day_end) + "' "
                            cursor.execute(query)
                            first_job_timestamp = cursor.fetchall()[0][0]
                            query = "select max(end_time) from operation_info where machine_id = '" + machine + \
                                    "' and start_time >= '" + str(day_start) + "' and start_time < '" + str(day_end) + "' "
                            cursor.execute(query)
                            last_job_timestamp = cursor.fetchall()[0][0]
                            if last_job_timestamp:
                                pass
                            else:
                                last_job_timestamp = day_end - relativedelta(seconds=1)
                            operation_start_time = instance[1]

                            if instance[1] < day_start:
                                instance_day_end_time = instance[1].replace(hour=6, minute=0, second=0, microsecond=0)
                                instance_day_start_time = instance_day_end_time - relativedelta(days=1)
                                operation_start_time = day_start.replace(hour=6, minute=0, second=0, microsecond=0)
                                first_job_timestamp = day_start.replace(hour=6, minute=0, second=0, microsecond=0)
                            else:
                                instance_day_start_time = instance[1].replace(hour=6, minute=0, second=0, microsecond=0)
                                instance_day_end_time = instance_day_start_time + relativedelta(days=1)

                            serial_no = serial_no + 1

                            operation_end_time = instance[2]
                            if operation_end_time:
                                operation_time = instance[2] - instance[1]

                                partition_list_instance = ''

                                partition_start_day = instance[1].timetuple().tm_yday
                                if partition_start_day == 366:
                                    partition_start_day = 0

                                partition_end_day = instance[2].timetuple().tm_yday
                                if partition_end_day == 366:
                                    partition_end_day = 0

                                partition_day_list = []
                                if instance[1].year == instance[2].year and partition_start_day == partition_end_day:
                                    partition_day_list.append(partition_start_day)
                                elif partition_start_day < partition_end_day:
                                    for partition_day in range(partition_start_day, partition_end_day + 1):
                                        partition_day_list.append(partition_day)
                                else:
                                    for partition_day in range(partition_start_day, 366):
                                        partition_day_list.append(partition_day)
                                    for partition_day in range(0, partition_end_day + 1):
                                        partition_day_list.append(partition_day)

                                for partition_day in partition_day_list:
                                    partition_list_instance = partition_list_instance + machine.replace('-', '_') + "sp" \
                                                              + str(partition_day) + ", "

                                partition_list_instance = partition_list_instance[0: len(partition_list_instance) - 2]

                                query = "select count(*) from smooth_data partition( " + partition_list_instance + \
                                        ") where prediction = 2 and ts >= '" + str(instance[1]) + "' and ts < '" \
                                        + str(instance[2]) + "' "
                                cursor.execute(query)
                                cut_time = timedelta(seconds=cursor.fetchall()[0][0])
                                feed_time = operation_time - cut_time
                                if counter < len(raw_data):
                                    downtime = raw_data[counter][1] - instance[2]
                                else:
                                    downtime = None
                                query = "select * from smooth_data partition( " + partition_list_instance + \
                                        " ) where ts >= '" + str(instance[1]) + "' and ts < '" + str(instance[2]) + \
                                        "' order by ts"
                                cursor.execute(query)
                                production_count_raw_data = cursor.fetchall()

                                production_count = 0
                                off_flag = 0
                                on_flag = 0
                                machine_flag = 0

                                for production_count_instance in production_count_raw_data:
                                    if production_count_instance[2] == 1 or production_count_instance[2] == 0:
                                        off_flag += 1
                                        on_flag = 0
                                        if off_flag == production_count_threshold and machine_flag == 1:
                                            machine_flag = 0
                                    else:
                                        off_flag = 0
                                        on_flag += 1
                                        if on_flag == production_count_threshold and machine_flag == 0:
                                            machine_flag = 1
                                            # production count increase on state change to cut on
                                            production_count = production_count + 1

                                partition_list_barcode = ''

                                partition_start_day = day_start.timetuple().tm_yday
                                if partition_start_day == 366:
                                    partition_start_day = 0

                                partition_end_day = instance[2].timetuple().tm_yday
                                if partition_end_day == 366:
                                    partition_end_day = 0

                                partition_day_list = []
                                if day_start.year == instance[2].year and partition_start_day == partition_end_day:
                                    partition_day_list.append(partition_start_day)
                                elif partition_start_day < partition_end_day:
                                    for partition_day in range(partition_start_day, partition_end_day + 1):
                                        partition_day_list.append(partition_day)
                                else:
                                    for partition_day in range(partition_start_day, 366):
                                        partition_day_list.append(partition_day)
                                    for partition_day in range(0, partition_end_day + 1):
                                        partition_day_list.append(partition_day)

                                for partition_day in partition_day_list:
                                    partition_list_barcode = partition_list_barcode + machine.replace('-', '_') + "sp" \
                                                             + str(partition_day) + ", "

                                partition_list_barcode = partition_list_barcode[0: len(partition_list_barcode) - 2]

                                if counter < 2:
                                    query = "SELECT group_concat(barcode_id) \
                                        FROM (select * from smooth_data partition( " + partition_list_barcode + ") \
                                        WHERE flag = 1 AND ts> '" + str(day_start) + "' \
                                            AND ts<= '" + str(instance[2]) + "' limit 99) as e;"
                                else:
                                    query = "SELECT group_concat(barcode_id) \
                                        FROM (select * from smooth_data partition( " + partition_list_barcode + ") \
                                        WHERE flag = 1 AND ts> '" + str(raw_data[counter - 2][2]) + "' \
                                            AND ts<= '" + str(instance[2]) + "' limit 99) as e;"
                                cursor.execute(query)
                                barcode_list = cursor.fetchall()
                                if barcode_list[0][0] and not re.search("(^,+$)", barcode_list[0][0]):
                                    barcode_list = barcode_list[0][0]
                                    barcode_arr = barcode_list.split(',')
                                    barcode_list = ""
                                    for barcode_instance in barcode_arr:
                                        if len(barcode_instance) > 3:
                                            barcode_list = barcode_list + "," + barcode_instance
                                    barcode_list = barcode_list[1:]
                                    barcode_flag = 1
                                else:
                                    query = "SELECT group_concat(barcode_id) \
                                        FROM (select * from smooth_data partition( " + machine.replace('-', '_') + " )\
                                        WHERE flag = 1 and barcode_id != '' \
                                        AND ts <= '" + str(instance[1]) + "' \
                                            order by ts desc limit 1) as e;"
                                    cursor.execute(query)
                                    barcode_list = cursor.fetchall()
                                    if barcode_list[0][0]:
                                        barcode_list = barcode_list[0][0]
                                        barcode_arr = barcode_list.split(',')
                                        barcode_list = ""
                                        for barcode_instance in barcode_arr:
                                            if len(barcode_instance) > 3:
                                                barcode_list = barcode_list + "," + barcode_instance
                                        barcode_list = barcode_list[1:]
                                    else:
                                        barcode_list = None
                                    barcode_flag = 0

                                if downtime:
                                    csv_info.append((branch_id, machine_id, date_of_record, first_job_timestamp,
                                                     last_job_timestamp, serial_no, operation_start_time,
                                                     operation_end_time, operation_time.total_seconds(),
                                                     cut_time.total_seconds(), feed_time.total_seconds(),
                                                     downtime.total_seconds(), production_count, barcode_list, barcode_flag))
                                else:
                                    csv_info.append((branch_id, machine_id, date_of_record, first_job_timestamp,
                                                     last_job_timestamp, serial_no, operation_start_time,
                                                     operation_end_time, operation_time.total_seconds(),
                                                     cut_time.total_seconds(), feed_time.total_seconds(), downtime,
                                                     production_count, barcode_list, barcode_flag))
                            else:
                                csv_info.append((branch_id, machine_id, date_of_record, first_job_timestamp,
                                                 last_job_timestamp, serial_no, operation_start_time, None, None, None,
                                                 None, None, None, None, False))
                    day_start = day_end
                    day_end = day_start + relativedelta(days=1)
        if len(csv_info) > 0:
            query = "insert into csv_info(branch_id, machine_id, date_of_record, first_job_time, last_job_timestamp, " \
                    "serial_no, start_time, end_time, operation_time, cut_time, feed_time, down_time, cut_count, barcode" \
                    ", flag) values(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
            cursor.executemany(query, csv_info)
            cursor.execute("commit")
            print("completed")
    cursor.close()
    conn.close()


def csv_info_fun_cs(database_name):
    """

    :param database_name:
    """
    csv_info = []
    branch_id = 4
    production_count_threshold = 1

    conn = mdb.connect(host=mysql_host, user=mysql_user, password=mysql_password, auth_plugin='mysql_native_password',
                       database=database_name)
    cursor = conn.cursor()

    for machine in machine_list:
        csv_info = []
        older_timestamp = dt.now()
        serial_no = 0
        query = "select * from csv_info where machine_id = '" + machine + "' order by end_time desc limit 1"
        cursor.execute(query)
        machine_id = machine
        max_time = cursor.fetchall()
        if len(max_time) == 0:
            query = "select min(start_time) from operation_info where machine_id = '" + machine + "' "
            cursor.execute(query)
            day_start = cursor.fetchall()[0][0]
            if day_start:
                if day_start.hour < 6:
                    day_end = day_start.replace(hour=6, minute=0, second=0, microsecond=0)
                    day_start = day_end - relativedelta(days=1)
                else:
                    day_start = day_start.replace(hour=6, minute=0, second=0, microsecond=0)
                    day_end = day_start + relativedelta(days=1)

                while day_start < dt.now():

                    partition_list = ''

                    partition_start_day = day_start.timetuple().tm_yday
                    if partition_start_day == 366:
                        partition_start_day = 0

                    partition_end_day = dt.now().timetuple().tm_yday
                    if partition_end_day == 366:
                        partition_end_day = 0

                    partition_day_list = []
                    if day_start.year == dt.now().year and partition_start_day == partition_end_day:
                        partition_day_list.append(partition_start_day)
                    elif partition_start_day < partition_end_day:
                        for partition_day in range(partition_start_day, partition_end_day + 1):
                            partition_day_list.append(partition_day)
                    else:
                        for partition_day in range(partition_start_day, 366):
                            partition_day_list.append(partition_day)
                        for partition_day in range(0, partition_end_day + 1):
                            partition_day_list.append(partition_day)

                    for partition_day in partition_day_list:
                        partition_list = partition_list + machine.replace('-', '_') + "sp" + str(partition_day) + ", "

                    partition_list = partition_list[0: len(partition_list) - 2]

                    serial_no = 0
                    query = "select * from operation_info where machine_id = '" + machine + "' and end_time > '" + str(
                        day_start) + "' and start_time < '" + str(day_end) + "' and start_time > '" + str(
                        day_start) + "' order by start_time"
                    cursor.execute(query)
                    raw_data = cursor.fetchall()
                    if len(raw_data) == 0:
                        pass
                    else:
                        counter = 0
                        i = 0
                        for instance in raw_data:
                            i += 1
                            counter = counter + 1
                            date_of_record = day_start.strftime("%Y-%m-%d")
                            query = "select min(start_time) from operation_info where machine_id = '" + machine + \
                                    "' and start_time >= '" + str(day_start) + "' and start_time < '" + str(day_end) + "' "
                            cursor.execute(query)
                            first_job_timestamp = cursor.fetchall()[0][0]
                            query = "select max(end_time) from operation_info where machine_id = '" + machine + \
                                    "' and start_time >= '" + str(day_start) + "' and start_time < '" + str(day_end) + "' "
                            cursor.execute(query)
                            last_job_timestamp = cursor.fetchall()[0][0]
                            if last_job_timestamp:
                                pass
                            else:
                                last_job_timestamp = day_end - relativedelta(seconds=1)
                            operation_start_time = instance[1]

                            if instance[1] < day_start:
                                instance_day_end_time = instance[1].replace(hour=6, minute=0, second=0, microsecond=0)
                                instance_day_start_time = instance_day_end_time - relativedelta(days=1)
                                operation_start_time = day_start.replace(hour=6, minute=0, second=0, microsecond=0)
                                first_job_timestamp = day_start.replace(hour=6, minute=0, second=0, microsecond=0)
                            else:
                                instance_day_start_time = instance[1].replace(hour=6, minute=0, second=0, microsecond=0)
                                instance_day_end_time = instance_day_start_time + relativedelta(days=1)

                            serial_no = serial_no + 1
                            operation_end_time = instance[2]
                            if operation_end_time:
                                operation_time = instance[2] - instance[1]

                                partition_list_instance = ''

                                partition_start_day = instance[1].timetuple().tm_yday
                                if partition_start_day == 366:
                                    partition_start_day = 0

                                partition_end_day = instance[2].timetuple().tm_yday
                                if partition_end_day == 366:
                                    partition_end_day = 0

                                partition_day_list = []
                                if instance[1].year == instance[2].year and partition_start_day == partition_end_day:
                                    partition_day_list.append(partition_start_day)
                                elif partition_start_day < partition_end_day:
                                    for partition_day in range(partition_start_day, partition_end_day + 1):
                                        partition_day_list.append(partition_day)
                                else:
                                    for partition_day in range(partition_start_day, 366):
                                        partition_day_list.append(partition_day)
                                    for partition_day in range(0, partition_end_day + 1):
                                        partition_day_list.append(partition_day)

                                for partition_day in partition_day_list:
                                    partition_list_instance = partition_list_instance + machine.replace('-', '_') + "sp" \
                                                              + str(partition_day) + ", "

                                partition_list_instance = partition_list_instance[0: len(partition_list_instance) - 2]

                                query = "select count(*) from smooth_data partition( " + partition_list_instance + \
                                        " ) where prediction = 2 and ts >= '" + \
                                        str(instance[1]) + "' and ts < '" + str(instance[2]) + "' "
                                cursor.execute(query)
                                cut_time = timedelta(seconds=cursor.fetchall()[0][0])
                                feed_time = operation_time - cut_time
                                if counter < len(raw_data):
                                    downtime = raw_data[counter][1] - instance[2]
                                else:
                                    downtime = None
                                query = "select * from smooth_data partition( " + partition_list_instance + \
                                        ") where ts >= '" + str(instance[1]) + "' and ts < '" + str(instance[2]) + \
                                        "' order by ts"
                                cursor.execute(query)
                                production_count_raw_data = cursor.fetchall()

                                production_count = 0
                                off_flag = 0
                                on_flag = 0
                                machine_flag = 0

                                for production_count_instance in production_count_raw_data:
                                    if production_count_instance[2] == 1 or production_count_instance[2] == 0:
                                        off_flag += 1
                                        on_flag = 0
                                        if off_flag == production_count_threshold and machine_flag == 1:
                                            machine_flag = 0
                                    else:
                                        off_flag = 0
                                        on_flag += 1
                                        if on_flag == production_count_threshold and machine_flag == 0:
                                            machine_flag = 1
                                            # production count increase on state change to cut on
                                            production_count = production_count + 1

                                partition_list_barcode = ''

                                partition_start_day = day_start.timetuple().tm_yday
                                if partition_start_day == 366:
                                    partition_start_day = 0

                                partition_end_day = instance[2].timetuple().tm_yday
                                if partition_end_day == 366:
                                    partition_end_day = 0

                                partition_day_list = []
                                if day_start.year == instance[2].year and partition_start_day == partition_end_day:
                                    partition_day_list.append(partition_start_day)
                                elif partition_start_day < partition_end_day:
                                    for partition_day in range(partition_start_day, partition_end_day + 1):
                                        partition_day_list.append(partition_day)
                                else:
                                    for partition_day in range(partition_start_day, 366):
                                        partition_day_list.append(partition_day)
                                    for partition_day in range(0, partition_end_day + 1):
                                        partition_day_list.append(partition_day)

                                for partition_day in partition_day_list:
                                    partition_list_barcode = partition_list_barcode + machine.replace('-', '_') + "sp" \
                                                             + str(partition_day) + ", "

                                partition_list_barcode = partition_list_barcode[0: len(partition_list_barcode) - 2]

                                if counter < 2:
                                    query = "SELECT group_concat(barcode_id) \
                                        FROM (select * from smooth_data partition( " + partition_list_barcode + ") \
                                        WHERE flag = 1 AND ts> '" + str(day_start) + "' \
                                            AND ts<= '" + str(instance[2]) + "' limit 99) as e;"
                                else:
                                    query = "SELECT group_concat(barcode_id) \
                                        FROM (select * from smooth_data partition( " + partition_list_barcode + ") \
                                        WHERE flag = 1  and ts> '" + str(raw_data[counter - 2][2]) + "' \
                                            AND ts<= '" + str(instance[2]) + "' limit 99) as e;"
                                cursor.execute(query)
                                barcode_list = cursor.fetchall()
                                if barcode_list[0][0]:
                                    barcode_list = barcode_list[0][0]
                                    barcode_arr = barcode_list.split(',')
                                    barcode_list = ""
                                    for barcode_instance in barcode_arr:
                                        if len(barcode_instance) > 3:
                                            barcode_list = barcode_list + "," + barcode_instance
                                    barcode_list = barcode_list[1:]
                                    barcode_flag = 1
                                else:
                                    query = "SELECT group_concat(barcode_id) \
                                        FROM (select * from smooth_data partition( " + machine.replace('-', '_') + " ) \
                                        WHERE flag = 1 \
                                        AND ts <= '" + str(instance[1]) + "' \
                                            order by ts desc limit 1) as e;"
                                    cursor.execute(query)
                                    barcode_list = cursor.fetchall()
                                    barcode_flag = 0
                                    if barcode_list[0][0]:
                                        barcode_list = barcode_list[0][0]
                                        barcode_arr = barcode_list.split(',')
                                        barcode_list = ""
                                        for barcode_instance in barcode_arr:
                                            if len(barcode_instance) > 3:
                                                barcode_list = barcode_list + "," + barcode_instance
                                        barcode_list = barcode_list[1:]
                                        if re.search("(^,+$)", barcode_list):
                                            barcode_flag = 1
                                    else:
                                        barcode_list = None

                                if downtime:
                                    csv_info.append((branch_id, machine_id, date_of_record, first_job_timestamp,
                                                     last_job_timestamp, serial_no, operation_start_time,
                                                     operation_end_time, operation_time.total_seconds(),
                                                     cut_time.total_seconds(), feed_time.total_seconds(),
                                                     downtime.total_seconds(), production_count, barcode_list, barcode_flag))
                                else:
                                    csv_info.append((branch_id, machine_id, date_of_record, first_job_timestamp,
                                                     last_job_timestamp, serial_no, operation_start_time,
                                                     operation_end_time, operation_time.total_seconds(),
                                                     cut_time.total_seconds(), feed_time.total_seconds(), downtime,
                                                     production_count, barcode_list, barcode_flag))
                            else:
                                csv_info.append((branch_id, machine_id, date_of_record, first_job_timestamp,
                                                 last_job_timestamp, serial_no, operation_start_time, None, None, None,
                                                 None, None, None, None, False))
                    day_start = day_end
                    day_end = day_start + relativedelta(days=1)
        else:
            max_time = max_time[0][7]

            day_start = max_time
            if day_start:
                if day_start.hour < 6:
                    day_end = day_start.replace(hour=6, minute=0, second=0, microsecond=0)
                    day_start = day_end - relativedelta(days=1)
                else:
                    day_start = day_start.replace(hour=6, minute=0, second=0, microsecond=0)
                    day_end = day_start + relativedelta(days=1)

                while day_start < dt.now():
                    partition_list = ''

                    partition_start_day = day_start.timetuple().tm_yday
                    if partition_start_day == 366:
                        partition_start_day = 0

                    partition_end_day = dt.now().timetuple().tm_yday
                    if partition_end_day == 366:
                        partition_end_day = 0

                    partition_day_list = []
                    if day_start.year == dt.now().year and partition_start_day == partition_end_day:
                        partition_day_list.append(partition_start_day)
                    elif partition_start_day < partition_end_day:
                        for partition_day in range(partition_start_day, partition_end_day + 1):
                            partition_day_list.append(partition_day)
                    else:
                        for partition_day in range(partition_start_day, 366):
                            partition_day_list.append(partition_day)
                        for partition_day in range(0, partition_end_day + 1):
                            partition_day_list.append(partition_day)

                    for partition_day in partition_day_list:
                        partition_list = partition_list + machine.replace('-', '_') + "sp" + str(partition_day) + ", "

                    partition_list = partition_list[0: len(partition_list) - 2]

                    serial_no = 0

                    # 01112019 updating where clause to match where clause in select query
                    # fix for deleting record between days
                    query = "delete from csv_info where machine_id = '" + machine + "' and end_time > '" + str(day_start) +\
                            "' and start_time < '" + str(day_end) + "' and start_time > '" + str(
                        day_start) + "' order by start_time"
                    cursor.execute(query)
                    cursor.execute("commit")
                    query = "select * from operation_info where machine_id = '" + machine + "' and end_time > '" + str(
                        day_start) + "' and start_time < '" + str(day_end) + "' and start_time > '" + str(
                        day_start) + "' order by start_time"
                    cursor.execute(query)
                    raw_data = cursor.fetchall()
                    if len(raw_data) == 0:
                        pass
                    else:
                        counter = 0
                        for instance in raw_data:
                            counter = counter + 1
                            date_of_record = day_start.strftime("%Y-%m-%d")

                            query = "select min(start_time) from operation_info where machine_id = '" + machine + \
                                    "' and start_time >= '" + str(day_start) + "' and start_time < '" + str(day_end) + "' "
                            cursor.execute(query)
                            first_job_timestamp = cursor.fetchall()[0][0]
                            query = "select max(end_time) from operation_info where machine_id = '" + machine + \
                                    "' and start_time >= '" + str(day_start) + "' and start_time < '" + str(day_end) + "' "
                            cursor.execute(query)
                            last_job_timestamp = cursor.fetchall()[0][0]
                            if last_job_timestamp:
                                pass
                            else:
                                last_job_timestamp = day_end - relativedelta(seconds=1)
                            operation_start_time = instance[1]

                            if instance[1] < day_start:
                                instance_day_end_time = instance[1].replace(hour=6, minute=0, second=0, microsecond=0)
                                instance_day_start_time = instance_day_end_time - relativedelta(days=1)
                                operation_start_time = day_start.replace(hour=6, minute=0, second=0, microsecond=0)
                                first_job_timestamp = day_start.replace(hour=6, minute=0, second=0, microsecond=0)
                            else:
                                instance_day_start_time = instance[1].replace(hour=6, minute=0, second=0, microsecond=0)
                                instance_day_end_time = instance_day_start_time + relativedelta(days=1)

                            serial_no = serial_no + 1

                            operation_end_time = instance[2]
                            if operation_end_time:
                                operation_time = instance[2] - instance[1]

                                partition_list_instance = ''

                                partition_start_day = instance[1].timetuple().tm_yday
                                if partition_start_day == 366:
                                    partition_start_day = 0

                                partition_end_day = instance[2].timetuple().tm_yday
                                if partition_end_day == 366:
                                    partition_end_day = 0

                                partition_day_list = []
                                if instance[1].year == instance[2].year and partition_start_day == partition_end_day:
                                    partition_day_list.append(partition_start_day)
                                elif partition_start_day < partition_end_day:
                                    for partition_day in range(partition_start_day, partition_end_day + 1):
                                        partition_day_list.append(partition_day)
                                else:
                                    for partition_day in range(partition_start_day, 366):
                                        partition_day_list.append(partition_day)
                                    for partition_day in range(0, partition_end_day + 1):
                                        partition_day_list.append(partition_day)

                                for partition_day in partition_day_list:
                                    partition_list_instance = partition_list_instance + machine.replace('-', '_') + "sp" \
                                                              + str(partition_day) + ", "

                                partition_list_instance = partition_list_instance[0: len(partition_list_instance) - 2]

                                query = "select count(*) from smooth_data partition( " + partition_list_instance + \
                                        ") where prediction = 2 and ts >= '" + str(instance[1]) + "' and ts < '" \
                                        + str(instance[2]) + "' "
                                cursor.execute(query)
                                cut_time = timedelta(seconds=cursor.fetchall()[0][0])
                                feed_time = operation_time - cut_time
                                if counter < len(raw_data):
                                    downtime = raw_data[counter][1] - instance[2]
                                else:
                                    downtime = None
                                query = "select * from smooth_data partition( " + partition_list_instance + \
                                        " ) where ts >= '" + str(instance[1]) + "' and ts < '" + str(instance[2]) + \
                                        "' order by ts"
                                cursor.execute(query)
                                production_count_raw_data = cursor.fetchall()

                                production_count = 0
                                off_flag = 0
                                on_flag = 0
                                machine_flag = 0

                                for production_count_instance in production_count_raw_data:
                                    if production_count_instance[2] == 1 or production_count_instance[2] == 0:
                                        off_flag += 1
                                        on_flag = 0
                                        if off_flag == production_count_threshold and machine_flag == 1:
                                            machine_flag = 0
                                    else:
                                        off_flag = 0
                                        on_flag += 1
                                        if on_flag == production_count_threshold and machine_flag == 0:
                                            machine_flag = 1
                                            # production count increase on state change to cut on
                                            production_count = production_count + 1

                                partition_list_barcode = ''

                                partition_start_day = day_start.timetuple().tm_yday
                                if partition_start_day == 366:
                                    partition_start_day = 0

                                partition_end_day = instance[2].timetuple().tm_yday
                                if partition_end_day == 366:
                                    partition_end_day = 0

                                partition_day_list = []
                                if day_start.year == instance[2].year and partition_start_day == partition_end_day:
                                    partition_day_list.append(partition_start_day)
                                elif partition_start_day < partition_end_day:
                                    for partition_day in range(partition_start_day, partition_end_day + 1):
                                        partition_day_list.append(partition_day)
                                else:
                                    for partition_day in range(partition_start_day, 366):
                                        partition_day_list.append(partition_day)
                                    for partition_day in range(0, partition_end_day + 1):
                                        partition_day_list.append(partition_day)

                                for partition_day in partition_day_list:
                                    partition_list_barcode = partition_list_barcode + machine.replace('-', '_') + "sp" \
                                                             + str(partition_day) + ", "

                                partition_list_barcode = partition_list_barcode[0: len(partition_list_barcode) - 2]

                                if counter < 2:
                                    query = "SELECT group_concat(barcode_id) \
                                        FROM (select * from smooth_data partition( " + partition_list_barcode + ") \
                                        WHERE flag = 1 AND ts> '" + str(day_start) + "' \
                                            AND ts<= '" + str(instance[2]) + "' limit 99) as e;"
                                else:
                                    query = "SELECT group_concat(barcode_id) \
                                        FROM (select * from smooth_data partition( " + partition_list_barcode + ") \
                                        WHERE flag = 1 AND ts> '" + str(raw_data[counter - 2][2]) + "' \
                                            AND ts<= '" + str(instance[2]) + "' limit 99) as e;"
                                cursor.execute(query)
                                barcode_list = cursor.fetchall()
                                if barcode_list[0][0] and not re.search("(^,+$)", barcode_list[0][0]):
                                    barcode_list = barcode_list[0][0]
                                    barcode_arr = barcode_list.split(',')
                                    barcode_list = ""
                                    for barcode_instance in barcode_arr:
                                        if len(barcode_instance) > 3:
                                            barcode_list = barcode_list + "," + barcode_instance
                                    barcode_list = barcode_list[1:]
                                    barcode_flag = 1
                                else:
                                    query = "SELECT group_concat(barcode_id) \
                                        FROM (select * from smooth_data partition( " + machine.replace('-', '_') + " )\
                                        WHERE flag = 1 and barcode_id != '' \
                                        AND ts <= '" + str(instance[1]) + "' \
                                            order by ts desc limit 1) as e;"
                                    cursor.execute(query)
                                    barcode_list = cursor.fetchall()
                                    if barcode_list[0][0]:
                                        barcode_list = barcode_list[0][0]
                                        barcode_arr = barcode_list.split(',')
                                        barcode_list = ""
                                        for barcode_instance in barcode_arr:
                                            if len(barcode_instance) > 3:
                                                barcode_list = barcode_list + "," + barcode_instance
                                        barcode_list = barcode_list[1:]
                                    else:
                                        barcode_list = None
                                    barcode_flag = 0

                                if downtime:
                                    csv_info.append((branch_id, machine_id, date_of_record, first_job_timestamp,
                                                     last_job_timestamp, serial_no, operation_start_time,
                                                     operation_end_time, operation_time.total_seconds(),
                                                     cut_time.total_seconds(), feed_time.total_seconds(),
                                                     downtime.total_seconds(), production_count, barcode_list, barcode_flag))
                                else:
                                    csv_info.append((branch_id, machine_id, date_of_record, first_job_timestamp,
                                                     last_job_timestamp, serial_no, operation_start_time,
                                                     operation_end_time, operation_time.total_seconds(),
                                                     cut_time.total_seconds(), feed_time.total_seconds(), downtime,
                                                     production_count, barcode_list, barcode_flag))
                            else:
                                csv_info.append((branch_id, machine_id, date_of_record, first_job_timestamp,
                                                 last_job_timestamp, serial_no, operation_start_time, None, None, None,
                                                 None, None, None, None, False))
                    day_start = day_end
                    day_end = day_start + relativedelta(days=1)
        if len(csv_info) > 0:
            query = "insert into csv_info(branch_id, machine_id, date_of_record, first_job_time, last_job_timestamp, " \
                    "serial_no, start_time, end_time, operation_time, cut_time, feed_time, down_time, cut_count, barcode" \
                    ", flag) values(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
            cursor.executemany(query, csv_info)
            cursor.execute("commit")
            print("completed")
    cursor.close()
    conn.close()


if __name__ == "__main__":
    csv_info_fun(mysql_database_sa)
    csv_info_fun_cs(mysql_database_cs)
