import json
from datetime import datetime
import pandas as pd
import os
from Commons.config import load_config
from Commons.db import connect_db
from ContentFetcher.model import init_db as init_content_fetcher_db
from ContentLabeler.model import init_db as init_content_labeler_db
from GoogleSearchCrawler.model import init_db as init_google_search_crawler_db
from TasksManager.tasks.google_search_crawler import init_db as init_task_manager_db


def delete_task_with_task_id(task_id, db):
  cursor = db.cursor()
  cursor.execute("""
    DELETE FROM tasks
    WHERE task_id = %s
  """, (task_id,))
  cursor.close()
  db.commit()


def create_task(task_id, keywords, date_from, date_to, frequency, disinformer_narrative,
                mitigator_narrative, neutral_narrative, db):
  cursor = db.cursor()
  cursor.execute("""
    INSERT INTO tasks (
        task_id,
        keywords,
        schedule_from,
        schedule_to,
        frequency,
        disinformer_narrative,
        mitigator_narrative,
        neutral_narrative,
        status_google_search_crawler,
        status_content_fetcher,
        status_labeler
      )
      VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
  """, (
      task_id,
      keywords,
      date_from.isoformat(),
      date_to.isoformat(),
      frequency,
      disinformer_narrative,
      mitigator_narrative,
      neutral_narrative,
      'done',
      'done',
      'done'
  ))
  cursor.close()
  db.commit()


def delete_google_search_crawler_result_with_id(task_id, db):
  cursor = db.cursor()
  cursor.execute("""
      DELETE FROM google_search_crawler_results
      WHERE task_id = %s
    """, (task_id,))
  cursor.close()
  db.commit()


def save_google_search_crawler_result(task_id, date, url, snippet, position, db):
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
    task_id,
    date,
    url,
    snippet,
    position
  ))
  cursor.close()
  db.commit()


def delete_urls_labels_with_id(task_id, db):
  cursor = db.cursor()
  cursor.execute("""
      DELETE FROM urls_labels
      WHERE task_id = %s
    """, (task_id,))
  cursor.close()
  db.commit()


def add_url_label(task_id, url, label, db):
  """
  Sets the label of a URL
  """
  cursor = db.cursor()
  cursor.execute("""
    INSERT INTO urls_labels(task_id, url, label)
    VALUES(%s, %s, %s);
  """, (task_id, url, label))
  db.commit()
  cursor.close()


def import_task(task_info, db, config):
  task_id = task_info['task_id']

  print("Creating task...")
  delete_task_with_task_id(task_id, db)
  create_task(
    task_id,
    task_info['keywords'],
    datetime.strptime(task_info['from'], "%Y-%m-%d %H:%M:%S"),
    datetime.strptime(task_info['to'], "%Y-%m-%d %H:%M:%S"),
    task_info['frequency'],
    task_info['disinformer_narrative'],
    task_info['mitigator_narrative'],
    task_info['neutral_narrative'],
    db
  )

  print("Loading data...")
  data = pd.read_csv('DataImporter/data/' + task_info['data_file'])

  print("Importing google search crawler results...")
  delete_google_search_crawler_result_with_id(task_id, db)
  for _, row in data.iterrows():
    save_google_search_crawler_result(
      task_id,
      datetime.strptime(row['timestamp'], "%Y-%m-%d %H:%M:%S"),
      row['link'],
      '',
      row['link_order'],
      db
    )

  print("Importing urls labels...")
  delete_urls_labels_with_id(task_id, db)
  for _, row in data.iterrows():
    label = row['label']
    if label == "Misinformation":
      label = "DISINFORMATION"
    elif label == "Counter-Misinformation":
      label = "MITIGATOR"
    elif label == "Not Applicable":
      label = "N/A"
    else:
      label = "ERROR"
    add_url_label(task_id, row['link'], label, db)

  db.close()


if __name__ == "__main__":
  if not os.path.exists(os.path.join(os.getcwd(), 'config.json')):
    os.chdir("../")
  print(os.getcwd())
  config = load_config('config.json')

  init_content_fetcher_db(config)
  init_content_labeler_db(config)
  init_google_search_crawler_db(config)

  db = connect_db(config['databases']['datavoids_explorer'])
  init_task_manager_db(db)

  with open("DataImporter/data/index.json", 'r') as f:
    index = json.load(f)

  for t in index:
    import_task(t, db, config)

  db.close()
