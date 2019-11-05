from datetime import datetime as dt
import mysql.connector as mdb
from datetime import timedelta
import config
import redis
from dateutil.parser import parse

redis_client = redis.Redis(host='localhost', port=6379, db=0)

mysql_host = config.host
mysql_user = config.user
mysql_password = config.password
raw_tables_database = config.database_sa
mysql_database_sa = config.database_sa
mysql_database_cs = config.database_cs

raw_data_table = config.raw_data_table
current_time = dt.now().replace(microsecond=0)
current_time_without_microseconds = current_time.replace(minute=0, second=0)
machine_list = ['4-01', '4-02', '4-03', '4-05', '4-06', '4-07', '4-09']
disconnected_threshold = 300


def precalculations(machine):
    """
    precalculates values using sound senser data.
    :param machine:
    """
    operation_time = 0
    down_time = 0
    device_not_connected = 0

    conn = mdb.connect(host=mysql_host, user=mysql_user,
                       password=mysql_password,
                       auth_plugin='mysql_native_password',
                       database=mysql_database_sa)
    cursor = conn.cursor()

    query = "select * from precalculations where machine_id = '" + \
        machine + "' order by ts desc limit 1"
    cursor.execute(query)
    max_time = cursor.fetchall()
    if len(max_time) == 0:
        query = "select machine_id, ts, prediction from " + raw_data_table + \
            " where machine_id = '" + machine + "' order by ts "
        cursor.execute(query)
        raw_data = cursor.fetchall()
        if len(raw_data) > 0:
            # intiallize start and end time
            last_timestamp = raw_data[0][1].replace(
                minute=0, second=0, microsecond=0)
            chart_last_ts = redis_client.get('chart_last_ts_sa_' + machine)
            if chart_last_ts:
                last_timestamp = parse(chart_last_ts.decode('ascii'))
            start_time = raw_data[0][1].replace(
                minute=0, second=0, microsecond=0)
            time_to_insert = start_time
            end_time = start_time + timedelta(minutes=10)
            for instance in raw_data:
                if start_time < current_time:
                    if instance[1] <= end_time:
                        if (instance[1] - last_timestamp).total_seconds() < disconnected_threshold:
                            if instance[2] == 0:
                                down_time = down_time + \
                                    (instance[1] - start_time).total_seconds()
                            else:
                                operation_time = operation_time + \
                                    (instance[1] - start_time).total_seconds()
                        else:
                            device_not_connected = device_not_connected + \
                                (instance[1] - start_time).total_seconds()
                        start_time = instance[1]
                        last_timestamp = instance[1]
                    else:
                        if (instance[1] - last_timestamp).total_seconds() < disconnected_threshold:
                            if instance[2] == 0:
                                down_time = down_time + \
                                    (end_time - start_time).total_seconds()
                            else:
                                operation_time = operation_time + \
                                    (end_time - start_time).total_seconds()
                        else:
                            device_not_connected = device_not_connected + \
                                (end_time - start_time).total_seconds()
                        query = "insert into precalculations values('" + machine + "', '" + str(time_to_insert) + "', " + str(operation_time) + ", " + str(down_time) + ", " + str(device_not_connected) + ", '" + str(time_to_insert.date()) + "', " + str(time_to_insert.hour) + ", " + str(time_to_insert.month) + ", " + str(time_to_insert.year) + ", " + str(time_to_insert.day) + ")"
                        cursor.execute(query)
                        cursor.execute("commit")
                        redis_client.set('chart_last_ts_sa_' + machine, str(last_timestamp))
                        start_time = end_time
                        time_to_insert = start_time
                        end_time = start_time + timedelta(minutes=10)
                        operation_time = 0
                        down_time = 0
                        device_not_connected = 0
        else:
            pass
    else:
        last_timestamp = max_time[0][1].replace(
            second=0, microsecond=0) + timedelta(minutes=10)

        chart_last_ts = redis_client.get('chart_last_ts_sa_' + machine)
        if chart_last_ts:
            last_timestamp = parse(chart_last_ts.decode('ascii'))
        start_time = max_time[0][1].replace(
            second=0, microsecond=0) + timedelta(minutes=10)

        time_to_insert = start_time
        end_time = start_time + timedelta(minutes=10)
        # creating string of partation names
        # for machine_id '4-01' and timestamp '2019-06-04 12:54:00' partation name is 4_01sp4

        partition_list = ''

        partition_start_day = start_time.timetuple().tm_yday
        if partition_start_day == 366:
            partition_start_day = 0

        partition_end_day = current_time.timetuple().tm_yday
        if partition_end_day == 366:
            partition_end_day = 0

        partition_day_list = []
        if start_time.year == current_time.year and partition_start_day == partition_end_day:
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
            partition_list = partition_list + \
                machine.replace('-', '_') + "sp" + str(partition_day) + ", "

        partition_list = partition_list[0: len(partition_list) - 2]

        query = "select machine_id, ts, prediction from " + raw_data_table + " partition( " + partition_list +\
                " ) where machine_id = '" + machine + \
            "' and ts >= '" + str(start_time) + "' order by ts"
        cursor.execute(query)
        raw_data = cursor.fetchall()
        if len(raw_data) > 0:
            for instance in raw_data:
                if start_time < current_time:
                    if instance[1] <= end_time:
                        if (instance[1] - last_timestamp).total_seconds() < disconnected_threshold:
                            if instance[2] == 0:
                                down_time = down_time + \
                                    (instance[1] - start_time).total_seconds()
                            else:
                                operation_time = operation_time + \
                                    (instance[1] - start_time).total_seconds()
                        else:
                            device_not_connected = device_not_connected + \
                                (instance[1] - start_time).total_seconds()
                        start_time = instance[1]
                        last_timestamp = instance[1]
                    else:
                        if (instance[1] - last_timestamp).total_seconds() < disconnected_threshold:
                            if instance[2] == 0:
                                down_time = down_time + \
                                    (end_time - start_time).total_seconds()
                            else:
                                operation_time = operation_time + \
                                    (end_time - start_time).total_seconds()
                        else:
                            device_not_connected = device_not_connected + \
                                (end_time - start_time).total_seconds()
                        query = "insert into precalculations values('" + machine + "', '" + str(
                            time_to_insert) + "', " + str(operation_time) + ", " + str(down_time) + ", " + str(
                            device_not_connected) + ", '" + str(time_to_insert.date()) + "', " + str(
                            time_to_insert.hour) + ", " + str(time_to_insert.month) + ", " + str(
                            time_to_insert.year) + ", " + str(time_to_insert.day) + ")"
                        cursor.execute(query)
                        cursor.execute("commit")
                        redis_client.set('chart_last_ts_sa_' + machine, str(last_timestamp))
                        start_time = end_time
                        time_to_insert = start_time
                        end_time = start_time + timedelta(minutes=10)
                        operation_time = 0
                        down_time = 0
                        device_not_connected = 0
        else:
            pass
    cursor.close()
    conn.close()


def precalculations_cs(machine):
    """
    precalculates values using current senser data.
    :param machine:
    """
    operation_time = 0
    down_time = 0
    device_not_connected = 0

    conn = mdb.connect(host=mysql_host, user=mysql_user,
                       password=mysql_password,
                       auth_plugin='mysql_native_password',
                       database=mysql_database_cs)
    cursor = conn.cursor()

    query = "select * from precalculations where machine_id = '" + \
        machine + "' order by ts desc limit 1"
    cursor.execute(query)
    max_time = cursor.fetchall()
    if len(max_time) == 0:
        query = "select machine_id, ts, prediction from " + raw_data_table + \
            " where machine_id = '" + machine + "' order by ts "
        cursor.execute(query)
        raw_data = cursor.fetchall()
        if len(raw_data) > 0:
            last_timestamp = raw_data[0][1].replace(
                minute=0, second=0, microsecond=0)
            chart_last_ts = redis_client.get('chart_last_ts_cs_' + machine)
            if chart_last_ts:
                last_timestamp = parse(chart_last_ts.decode('ascii'))
            start_time = raw_data[0][1].replace(
                minute=0, second=0, microsecond=0)
            time_to_insert = start_time
            end_time = start_time + timedelta(minutes=10)

            for instance in raw_data:
                if start_time < current_time:
                    if instance[1] <= end_time:
                        if (instance[1] - last_timestamp).total_seconds() < disconnected_threshold:
                            if instance[2] == 0:
                                down_time = down_time + \
                                    (instance[1] - start_time).total_seconds()
                            else:
                                operation_time = operation_time + \
                                    (instance[1] - start_time).total_seconds()
                        else:
                            device_not_connected = device_not_connected + \
                                (instance[1] - start_time).total_seconds()
                        start_time = instance[1]
                        last_timestamp = instance[1]
                    else:
                        if (instance[1] - last_timestamp).total_seconds() < disconnected_threshold:
                            if instance[2] == 0:
                                down_time = down_time + \
                                    (end_time - start_time).total_seconds()
                            else:
                                operation_time = operation_time + \
                                    (end_time - start_time).total_seconds()
                        else:
                            device_not_connected = device_not_connected + \
                                (end_time - start_time).total_seconds()
                        query = "insert into precalculations values('" + machine + "', '" + str(
                            time_to_insert) + "', " + str(operation_time) + ", " + str(down_time) + ", " + str(
                            device_not_connected) + ", '" + str(time_to_insert.date()) + "', " + str(
                            time_to_insert.hour) + ", " + str(time_to_insert.month) + ", " + str(
                            time_to_insert.year) + ", " + str(time_to_insert.day) + ")"
                        cursor.execute(query)
                        cursor.execute("commit")
                        redis_client.set('chart_last_ts_cs_' + machine, str(last_timestamp))
                        start_time = end_time
                        time_to_insert = start_time
                        end_time = start_time + timedelta(minutes=10)
                        operation_time = 0
                        down_time = 0
                        device_not_connected = 0
        else:
            pass
    else:
        last_timestamp = max_time[0][1].replace(
            second=0, microsecond=0) + timedelta(minutes=10)

        chart_last_ts = redis_client.get('chart_last_ts_cs_' + machine)
        if chart_last_ts:
            last_timestamp = parse(chart_last_ts.decode('ascii'))
        start_time = max_time[0][1].replace(
            second=0, microsecond=0) + timedelta(minutes=10)
        time_to_insert = start_time
        end_time = start_time + timedelta(minutes=10)

        # creating string of partation names
        # for machine_id '4-01' and timestamp '2019-06-04 12:54:00' partation 
        # name is 4_01sp4

        partition_list = ''

        partition_start_day = start_time.timetuple().tm_yday
        if partition_start_day == 366:
            partition_start_day = 0

        partition_end_day = current_time.timetuple().tm_yday
        if partition_end_day == 366:
            partition_end_day = 0

        partition_day_list = []
        if start_time.year == current_time.year and partition_start_day == partition_end_day:
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
            partition_list = partition_list + \
                machine.replace('-', '_') + "sp" + str(partition_day) + ", "

        partition_list = partition_list[0: len(partition_list) - 2]

        query = "select machine_id, ts, prediction from " + raw_data_table + " partition( " + partition_list + \
                " ) where machine_id = '" + machine + \
            "' and ts >= '" + str(start_time) + "' order by ts"
        cursor.execute(query)
        raw_data = cursor.fetchall()
        if len(raw_data) > 0:
            for instance in raw_data:
                if start_time < current_time:
                    if instance[1] <= end_time:
                        if (instance[1] - last_timestamp).total_seconds() < disconnected_threshold:
                            if instance[2] == 0:
                                down_time = down_time + \
                                    (instance[1] - start_time).total_seconds()
                            else:
                                operation_time = operation_time + \
                                    (instance[1] - start_time).total_seconds()
                        else:
                            device_not_connected = device_not_connected + \
                                (instance[1] - start_time).total_seconds()
                        start_time = instance[1]
                        last_timestamp = instance[1]
                    else:
                        if (instance[1] - last_timestamp).total_seconds() < disconnected_threshold:
                            if instance[2] == 0:
                                down_time = down_time + \
                                    (end_time - start_time).total_seconds()
                            else:
                                operation_time = operation_time + \
                                    (end_time - start_time).total_seconds()
                        else:
                            device_not_connected = device_not_connected + \
                                (end_time - start_time).total_seconds()
                        query = "insert into precalculations values('" + machine + "', '" + str(
                            time_to_insert) + "', " + str(operation_time) + ", " + str(down_time) + ", " + str(
                            device_not_connected) + ", '" + str(time_to_insert.date()) + "', " + str(
                            time_to_insert.hour) + ", " + str(time_to_insert.month) + ", " + str(
                            time_to_insert.year) + ", " + str(time_to_insert.day) + ")"
                        cursor.execute(query)
                        cursor.execute("commit")
                        redis_client.set('chart_last_ts_cs_' + machine, str(last_timestamp))
                        start_time = end_time
                        time_to_insert = start_time
                        end_time = start_time + timedelta(minutes=10)
                        operation_time = 0
                        down_time = 0
                        device_not_connected = 0
        else:
            pass
    cursor.close()
    conn.close()


if __name__ == "__main__":
    for machine_id in machine_list:
        precalculations(machine_id)
        precalculations_cs(machine_id)
