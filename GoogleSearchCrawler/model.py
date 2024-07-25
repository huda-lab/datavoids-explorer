from Commons.db import connect_db
from datetime import datetime


def init_db(config):
  """
  Initializes the tasks database
  """
  db = connect_db(config['databases']['datavoids_explorer'])
  cursor = db.cursor()
  cursor.execute("""
    CREATE TABLE IF NOT EXISTS google_search_crawler_results (
      task_id uuid,
      date timestamp,
      url varchar,
      position integer,
      snippet varchar,
      primary key (task_id, date, url, position)
    );
  """)
  cursor.close()
  db.commit()
  db.close()


def get_results(task_id, db):
  """
  Get the results for a task
  """
  cursor = db.cursor()
  cursor.execute("""
    SELECT
      date,
      url,
      position
    FROM google_search_crawler_results
    WHERE task_id = %s
  """, (task_id,))
  results_data = cursor.fetchall()
  results = [GoogleSearchCrawlerResult(
    task_id=task_id,
    date=result[0],
    url=result[1],
    position=result[2]
  ) for result in results_data]
  cursor.close()
  db.close()
  return results


def get_last_result_date(task_id, db) -> datetime:
  """
  Get the last result for a task
  """
  cursor = db.cursor()
  cursor.execute("""
    SELECT date
    FROM google_search_crawler_results
    WHERE task_id = %s
    ORDER BY date DESC
    LIMIT 1
  """, (task_id,))
  if cursor.rowcount == 0:
    return None
  result = cursor.fetchone()
  cursor.close()
  return result[0]


class GoogleSearchCrawlerResult:
  def __init__(self, task_id, date, url, snippet, position):
    self.task_id = task_id
    self.date = date
    self.url = url
    self.snippet = snippet
    self.position = position

  def save(self, db):
    cursor = db.cursor()
    cursor.execute("""
      INSERT INTO google_search_crawler_results (
        task_id,
        date,
        url,
        snippet,
        position
      )
      VALUES (%s, %s, %s, %s, %s)
    """, (
      self.task_id,
      self.date,
      self.url,
      self.snippet,
      self.position
    ))
    cursor.close()
    db.commit()
