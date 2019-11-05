import mysql.connector as mdb
import config

machine_list = config.machine_list
query_commit = config.query_commit

mysql_host = config.host
mysql_user = config.user
mysql_password = config.password
raw_tables_database = config.database_sa
mysql_database_sa = config.database_sa
mysql_database_cs = config.database_cs

machine_status = config.machine_status
machine_on_counter = config.machine_on_counter
machine_off_counter = config.machine_off_counter
machine_on_threshold = config.machine_on_threshold
machine_off_threshold = config.machine_off_threshold

machine_on_threshold_cs = config.machine_on_threshold_cs
machine_off_threshold_cs = config.machine_off_threshold_cs


def smoothing_smooth_data(machine,
                          machine_on_counter_smoothing_iterations, 
                          machine_off_counter_smoothing_iterations,
                          machine_on_threshold_smoothing_iterations, 
                          machine_off_threshold_smoothing_iterations,
                          machine_status_smoothing_iterations):
    """

    :param machine_status_smoothing_iterations:
    :param machine_on_threshold_smoothing_iterations:
    :param machine_off_counter_smoothing_iterations:
    :param machine_on_counter_smoothing_iterations:
    :param machine:
    :type machine_off_threshold_smoothing_iterations: object
    """
    conn = mdb.connect(host=mysql_host, user=mysql_user, 
                       password=mysql_password,
                       auth_plugin='mysql_native_password',
                       database=mysql_database_sa)
    cursor = conn.cursor()
    query_last_record_smooth_data = 'select * from max_smooth_data where machine_id = "' \
                                    + machine + '" order by ts limit 1 '
    cursor.execute(query_last_record_smooth_data)
    last_record_smooth_data = cursor.fetchall()
    # if no old data in smooth_data table
    if len(last_record_smooth_data) > 0:
        # setting last status of machine
        if last_record_smooth_data[0][2] == 0:
            machine_status_smoothing_iterations = 0
        else:
            machine_status_smoothing_iterations = 1
        query_min_ts_raw_data_rts = 'select min(ts) from ' + raw_tables_database + '.raw_data_rts'
        cursor.execute(query_min_ts_raw_data_rts)
        min_raw_data_rts = cursor.fetchall()[0][0]
        max_timestamp = last_record_smooth_data[0][1]
        if min_raw_data_rts and max_timestamp and min_raw_data_rts <= max_timestamp:
            table_name = raw_tables_database + '.raw_data_rts'
        else:
            table_name = raw_tables_database + '.raw_data'
        query_raw_data = 'select machine_id, ts, prediction, barcode_id, flag from ' + \
                         table_name + ' where machine_id = "' \
                         + machine + '" and ts >= " ' + str(max_timestamp) + ' " order by ts'
        cursor.execute(query_raw_data)
        raw_data = cursor.fetchall()
        query_delete = 'delete from smooth_data where ts >= "' + str(max_timestamp.replace(microsecond=0)) + \
                       '" and machine_id = "' + machine + '"'
        cursor.execute(query_delete)
        cursor.execute(query_commit)
        smoothing_iterations_smooth_data(
            raw_data,
            machine_off_counter_smoothing_iterations,
            machine_on_counter_smoothing_iterations,
            machine_on_threshold_smoothing_iterations,
            machine_off_threshold_smoothing_iterations,
            machine_status_smoothing_iterations, cursor, machine)

    # if smooth_data table contains old data
    else:
        query_raw_data = 'select machine_id, ts, prediction, barcode_id, flag  from ' + \
                         raw_tables_database + '.raw_data where machine_id = "' + machine + '" order by ts'
        cursor.execute(query_raw_data)
        raw_data = cursor.fetchall()
        smoothing_iterations_smooth_data(raw_data, machine_off_counter_smoothing_iterations,
                                         machine_on_counter_smoothing_iterations,
                                         machine_on_threshold_smoothing_iterations,
                                         machine_off_threshold_smoothing_iterations,
                                         machine_status_smoothing_iterations, cursor, machine)
    cursor.close()
    conn.close()


def smoothing_smooth_data_cs(machine,
                          machine_on_counter_smoothing_iterations, machine_off_counter_smoothing_iterations,
                          machine_on_threshold_smoothing_iterations, machine_off_threshold_smoothing_iterations,
                          machine_status_smoothing_iterations):
    """

    :param machine_status_smoothing_iterations:
    :param machine_on_threshold_smoothing_iterations:
    :param machine_off_counter_smoothing_iterations:
    :param machine_on_counter_smoothing_iterations:
    :param machine:
    :type machine_off_threshold_smoothing_iterations: object
    """
    conn = mdb.connect(host=mysql_host, user=mysql_user, password=mysql_password, auth_plugin='mysql_native_password',
                       database=mysql_database_cs)
    cursor = conn.cursor()
    query_last_record_smooth_data = 'select * from max_smooth_data where machine_id = "' \
                                    + machine + '" order by ts limit 1 '
    cursor.execute(query_last_record_smooth_data)
    last_record_smooth_data = cursor.fetchall()
    # if smooth_data table contains old data
    if len(last_record_smooth_data) > 0:
        # setting last status of machine
        if last_record_smooth_data[0][2] == 0:
            machine_status_smoothing_iterations = 0
        else:
            machine_status_smoothing_iterations = 1
        query_min_ts_raw_data_rts = 'select min(ts) from ' + raw_tables_database + '.raw_data_rts'
        cursor.execute(query_min_ts_raw_data_rts)
        min_raw_data_rts = cursor.fetchall()[0][0]
        max_timestamp = last_record_smooth_data[0][1]
        if min_raw_data_rts and max_timestamp and min_raw_data_rts <= max_timestamp:
            table_name = raw_tables_database + '.raw_data_rts'
        else:
            table_name = raw_tables_database + '.raw_data'
        query_raw_data = 'select machine_id, ts, machine_status prediction, barcode_id, flag from ' + \
                         table_name + ' where machine_id = "' \
                         + machine + '" and ts >= " ' + str(max_timestamp) + '" and machine_status is not null ' \
                                                                             'order by ts'
        cursor.execute(query_raw_data)
        raw_data = cursor.fetchall()
        query_delete = 'delete from smooth_data where ts >= "' + str(max_timestamp.replace(microsecond=0)) + \
                       '" and machine_id = "' + machine + '"'
        cursor.execute(query_delete)
        cursor.execute(query_commit)
        smoothing_iterations_smooth_data(raw_data, machine_off_counter_smoothing_iterations,
                                         machine_on_counter_smoothing_iterations,
                                         machine_on_threshold_smoothing_iterations,
                                         machine_off_threshold_smoothing_iterations,
                                         machine_status_smoothing_iterations, cursor, machine)

    # if no old data in smooth_data table
    else:
        query_raw_data = 'select machine_id, ts, machine_status prediction, barcode_id, flag from ' + \
                         raw_tables_database + '.raw_data where machine_id = "' \
                         + machine + '"  and machine_status is not null order by ts'
        cursor.execute(query_raw_data)
        raw_data = cursor.fetchall()
        smoothing_iterations_smooth_data(raw_data, machine_off_counter_smoothing_iterations,
                                         machine_on_counter_smoothing_iterations,
                                         machine_on_threshold_smoothing_iterations,
                                         machine_off_threshold_smoothing_iterations,
                                         machine_status_smoothing_iterations, cursor, machine)
    cursor.close()
    conn.close()


def smoothing_iterations_smooth_data(
        raw_data,
        machine_off_counter_smoothing_iterations,
        machine_on_counter_smoothing_iterations,
        machine_on_threshold_smoothing_iterations,
        machine_off_threshold_smoothing_iterations,
        machine_status_smoothing_iterations,
        cursor,
        machine):
    """

    :param machine:
    :param cursor:
    :param machine_off_counter_smoothing_iterations:
    :param machine_status_smoothing_iterations:
    :param machine_off_threshold_smoothing_iterations:
    :param machine_on_threshold_smoothing_iterations:
    :param machine_on_counter_smoothing_iterations:
    :type raw_data: object
    """
    data_to_insert = []
    record_index = 0
    while record_index < len(raw_data):
        if raw_data[record_index][2] == 0:
            machine_off_counter_smoothing_iterations += 1
            machine_on_counter_smoothing_iterations = 0
        else:
            machine_on_counter_smoothing_iterations += 1
            machine_off_counter_smoothing_iterations = 0

        if machine_status_smoothing_iterations == 0:
            if machine_on_counter_smoothing_iterations == machine_on_threshold_smoothing_iterations:
                machine_status_smoothing_iterations = 1
                record_index = record_index - (machine_on_threshold_smoothing_iterations - 1)
                data_to_insert = data_to_insert[:len(data_to_insert) - (machine_on_threshold_smoothing_iterations - 1)]
            else:
                data_to_insert.append(
                    (raw_data[record_index][0], raw_data[record_index][1], 0, raw_data[record_index][3],
                     raw_data[record_index][4], raw_data[record_index][1].timetuple().tm_yday))
                record_index += 1
        else:
            if machine_off_counter_smoothing_iterations == machine_off_threshold_smoothing_iterations:
                machine_status_smoothing_iterations = 0
                record_index = record_index - (machine_off_threshold_smoothing_iterations - 1)
                data_to_insert = data_to_insert[:len(data_to_insert) - (machine_off_threshold_smoothing_iterations - 1)]
            else:
                if raw_data[record_index][2] == 2:
                    predictions_to_insert = 2
                else:
                    predictions_to_insert = 1
                data_to_insert.append(
                    (raw_data[record_index][0], raw_data[record_index][1], predictions_to_insert,
                     raw_data[record_index][3], raw_data[record_index][4],
                     raw_data[record_index][1].timetuple().tm_yday))
                record_index += 1
        # if the data_to insert contains 1010 records then insert data into smooth_data table
        if len(data_to_insert) > 1010:
            # inserting smooth data into smooth_data table
            query_insert_smooth_data = 'insert into smooth_data ( machine_id, ts, prediction, barcode_id, ' \
                                       'flag, day_of_year_of_ts ) values (%s, %s, %s, %s, %s, %s) '
            cursor.executemany(query_insert_smooth_data, data_to_insert[:1001])
            cursor.execute(query_commit)
            # truncating max from max_smooth_data
            query_insert_smooth_data_delete = 'delete from max_smooth_data where machine_id = "' + machine + '"'
            cursor.execute(query_insert_smooth_data_delete)
            cursor.execute(query_commit)
            # inserting new max values for smooth_data table in max_smooth_data
            data_to_insert_max_duplicate = data_to_insert[996:1001]
            data_to_insert_max = []
            for instant in data_to_insert_max_duplicate:
                data_to_insert_max.append(instant[:3])
            query_insert_smooth_data_max = 'insert into max_smooth_data ( machine_id, ts, prediction ) ' \
                                           'values (%s, %s, %s) '
            cursor.executemany(query_insert_smooth_data_max, data_to_insert_max)
            cursor.execute(query_commit)
            data_to_insert = data_to_insert[1001:]

    query_insert_smooth_data = 'insert into smooth_data ( machine_id, ts, prediction, barcode_id, ' \
                               'flag, day_of_year_of_ts ) values (%s, %s, %s, %s, %s, %s) '
    cursor.executemany(query_insert_smooth_data, data_to_insert)
    cursor.execute(query_commit)
    if len(data_to_insert) > 4:
        # truncating max from max_smooth_data
        query_insert_smooth_data_delete = 'delete from max_smooth_data where machine_id = "' + machine + '"'
        cursor.execute(query_insert_smooth_data_delete)
        cursor.execute(query_commit)
        # inserting new max values for smooth_data table in max_smooth_data
        data_to_insert_max_duplicate = data_to_insert[len(data_to_insert) - 5:]
        data_to_insert_max = []
        for instant in data_to_insert_max_duplicate:
            data_to_insert_max.append(instant[:3])
        query_insert_smooth_data_max = 'insert into max_smooth_data ( machine_id, ts, prediction ) ' \
                                       'values (%s, %s, %s) '
        cursor.executemany(query_insert_smooth_data_max, data_to_insert_max)
        cursor.execute(query_commit)


if __name__ == "__main__":
    for machine_id in machine_list:
        smoothing_smooth_data(machine_id, machine_on_counter,
                              machine_off_counter,
                              machine_on_threshold[machine_id],
                              machine_off_threshold[machine_id],
                              machine_status)
        smoothing_smooth_data_cs(machine_id,
                                 machine_on_counter,
                                 machine_off_counter,
                                 machine_on_threshold_cs[machine_id],
                                 machine_off_threshold_cs[machine_id],
                                 machine_status)
