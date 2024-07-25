from Commons.db import connect_db
from datetime import datetime

def init_db(config):
  """
  Initializes the urls content database
  """
  db = connect_db(config['databases']['datavoids_explorer'])
  cursor = db.cursor()
  cursor.execute("""
    CREATE TABLE IF NOT EXISTS urls_contents (
      url varchar primary key,
      fetch_date timestamp,
      content text
    );
  """)
  cursor.close()
  db.commit()
  db.close()

def update_urls_content_db(db):
  """
  Update the urls_content table with new urls from google_search_crawler_results 
  that are not present 
  """
  cursor = db.cursor()
  cursor.execute("""
    INSERT INTO urls_contents (url)
    SELECT distinct url
    FROM google_search_crawler_results
    WHERE url != 'NO RESULTS' AND url NOT IN (SELECT url FROM urls_contents)
  """)
  db.commit()
  cursor.close()

def get_next_url(db):
  """
  Gets the next empty URL to process
  """
  cursor = db.cursor()
  cursor.execute("""
    SELECT url
    FROM urls_contents
    WHERE content IS NULL AND url != 'NO RESULTS'
    LIMIT 1
  """)
  url = cursor.fetchone()
  cursor.close()
  return url[0] if url else None

def update_url_content(url, content, db):
  """
  Updates the content of a URL
  """
  cursor = db.cursor()
  cursor.execute("""
    UPDATE urls_contents
    SET content = %s, fetch_date = CURRENT_TIMESTAMP
    WHERE url = %s
  """, (content, url))
  cursor.close()
  db.commit()
