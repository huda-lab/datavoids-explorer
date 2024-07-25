import psycopg2


def connect_db(db_config):
  '''
  Connect to the database using the config variables:
  '''
  return psycopg2.connect(
    dbname=db_config['name'],
    user=db_config['user'],
    password=db_config['password'],
    host=db_config['host'],
    port=db_config['port']
  )