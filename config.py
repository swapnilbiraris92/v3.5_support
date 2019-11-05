# MySQL
host = '127.0.0.1'
user = 'root'
password = 'root'
database = 'hmmasterdb'
database_sa = 'hmmasterdb'
database_cs = 'hmmasterdbcs'

raw_data_table = 'smooth_data'
start_threshold = 1
end_threshold = 1

crane_table = 'cranestatus_ubuntu.`cMT-8F59_log000_data`'

# counters
machine_on_counter = 0
machine_off_counter = 0

# thresholds
machine_on_threshold = {'4-01': 5, '4-02': 5, '4-03': 5, '4-05': 5, '4-06': 5, '4-07': 5, '4-09': 5}
machine_off_threshold = {'4-01': 7, '4-02': 5, '4-03': 5, '4-05': 5, '4-06': 5, '4-07': 5, '4-09': 5}
machine_on_threshold_cs = {'4-01': 1, '4-02': 1, '4-03': 1, '4-05': 1, '4-06': 1, '4-07': 1, '4-09': 1}
machine_off_threshold_cs = {'4-01': 1, '4-02': 1, '4-03': 1, '4-05': 1, '4-06': 1, '4-07': 1, '4-09': 1}

machine_status = 0
machine_list = ['4-01', '4-02', '4-03', '4-05', '4-06', '4-07', '4-09']

query_commit = "commit"
