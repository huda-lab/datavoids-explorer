from Commons.db import connect_db
from ContentLabeler.label import ContentLabel


def init_db(config):
  """
  Initializes the urls content database (we use the same as created by content fetcher)
  """
  db = connect_db(config['databases']['datavoids_explorer'])
  cursor = db.cursor()
  cursor.execute("""
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_type WHERE typname = 'url_label'
        ) THEN
            CREATE TYPE url_label AS ENUM (
              'DISINFORMATION', 
              'MITIGATOR', 
              'NEUTRAL', 
              'N/A', 
              'ERROR'
            );
        END IF;
    END$$;
    CREATE TABLE IF NOT EXISTS urls_labels (
      task_id uuid,
      url varchar,
      label url_label,
      manual_label url_label
    );
  """)
  cursor.close()
  db.commit()
  db.close()


def get_next_unlabeled(db):
  """
  Gets the next unlabeled URL to process

  Returns:
    (task_id, url, content)

  """
  cursor = db.cursor()
  cursor.execute("""
    SELECT gsr.task_id, uc.url, content 
    FROM google_search_crawler_results gsr inner join urls_contents uc on gsr.url = uc.url
    WHERE NOT EXISTS (
      SELECT 1
      FROM urls_labels ul
      WHERE gsr.task_id = ul.task_id AND uc.url = ul.url
    ) AND content IS NOT NULL
    LIMIT 1;
  """)
  res = cursor.fetchone()
  
  if res is None:
    return None

  # in case there are multiple labelers, the entry is pre-entively entered in the
  # urls_labels with a NULL label
  cursor.execute("""
    INSERT INTO urls_labels (task_id, url, label, manual_label)
    VALUES (%s, %s, NULL, NULL)
  """, (res[0], res[1]))
  db.commit()
  cursor.close()
  return res

def get_all(task_id, db):
  """
  Gets all the labeled URLs for a task
  """
  cursor = db.cursor()
  cursor.execute("""
    SELECT url, label, manual_label
    FROM urls_labels
    WHERE task_id = %s
  """, (task_id,))
  res = cursor.fetchall()
  cursor.close()
  res = [{"url": r[0], "label": r[1], "manual_label": r[2]} for r in res]
  return res

def commit_manual_labeling(task_id, labels, db):
    cursor = db.cursor()
    try:
        for label in labels:
          manual_label_enum = ContentLabel.from_str(label["manual_label"])
          cursor.execute("""
              UPDATE urls_labels
              SET manual_label = %s
              WHERE task_id = %s AND url = %s
          """, (manual_label_enum.value, task_id, label["url"]))
        db.commit()
    except Exception as e:
        db.rollback()
        print("Error during commit_manual_labeling:", str(e))
    cursor.close()

def set_label(task_id, url, label: ContentLabel, db):
  """
  Sets the label of a URL
  """
  cursor = db.cursor()
  cursor.execute("""
    UPDATE urls_labels
    SET label = %s
    WHERE task_id = %s and url = %s
  """, (label.value, task_id, url))
  db.commit()
  cursor.close()
