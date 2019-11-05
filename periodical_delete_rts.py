from datetime import datetime as dt
import mysql.connector as mdb
from datetime import timedelta
import config

mysql_host = config.host
mysql_user = config.user
mysql_password = config.password
raw_tables_database = config.database_sa    

conn = mdb.connect(
    user=mysql_user, password=mysql_password, host=mysql_host,
    database=raw_tables_database, auth_plugin='mysql_native_password')
cursor = conn.cursor()

current_time = dt.now().replace(hour=8, minute=39, second=0, microsecond=0)

delete_query = "delete from raw_data_rts where ts < '" + \
    str(current_time) + "'"
cursor.execute(delete_query)
cursor.execute('commit')
delete_query = "delete from smooth_data_rts where ts < '" + \
    str(current_time) + "'"
cursor.execute(delete_query)
cursor.execute('commit')
delete_query = "delete from hmmasterdbcs.smooth_data_rts where ts < '" + \
    str(current_time) + "'"
cursor.execute(delete_query)
cursor.execute('commit')
cursor.close()
conn.close()
