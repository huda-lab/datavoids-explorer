from Commons.db import *
from Commons.config import *
import sys
import time
import TasksManager.tasks.google_search_crawler as gct
import GoogleSearchCrawler.model as gsc_db
from datetime import datetime, timedelta
from GoogleSearchCrawler.definitions import ScheduleFrequency
from TasksManager.definitions import TaskStatus
import GoogleSearchCrawler.crawler as gsc_crawler
from dateutil.relativedelta import relativedelta


def get_next_date(task: gct.GoogleCrawlerTask, after: datetime, config):
  """
    This function returns the next date for a task after a given date
  """
  if task.frequency is ScheduleFrequency.DAILY:
    return after + timedelta(days=1)
  elif task.frequency is ScheduleFrequency.HOURLY:
    return after + timedelta(hours=1)
  elif task.frequency is ScheduleFrequency.WEEKLY:
    return after + timedelta(weeks=1)
  elif task.frequency is ScheduleFrequency.MONTHLY:
    return after + relativedelta(months=1)
  else:
    raise ValueError("Invalid frequency for task ", task.id)


def verify_task(task: gct.GoogleCrawlerTask, db, config):
  """
    This function checks if the task has to be run:
      - If it's daily and there are still results to fetch for the task data range
      - If it's daily/hourly and the current time is past the last daily/hourly result
  """
  last_res_date = gsc_db.get_last_result_date(task.id, db)
  next_collection_date = None

  if last_res_date is None:
    print("No results for task ", task.id)
    next_collection_date = task.date_from
  else:
    next_collection_date = get_next_date(task, last_res_date, config)

    # The task is done
    if next_collection_date > task.date_to:
      print("Task ", task.id, " is done")
      task.status_google_search_crawler = TaskStatus.DONE
      task.update_task_status(db)
      return

  # The task needs to be run in the future
  if next_collection_date > datetime.now():
    print("Task ", task.id, " is not ready yet")
    return

  print("Running", task, "at", next_collection_date)
  results = gsc_crawler.get_google_search_results_using_api(task, next_collection_date, config)
  print(f"Saving {len(results)} results...")
  for res in results:
    res.save(db)


def pool_tasks(config):
  """
    Loop over tasks every T time and see which ones need to be done
  """
  try:
    while True:
      print("Pooling tasks...")
      db = connect_db(config['databases']['datavoids_explorer'])
      tasks = gct.get_active_tasks(db)
      for task in tasks:
        verify_task(task, db, config)
      db.close()

      # sleep
      time.sleep(config["google_search_crawler"]["interval"] / 1000)
  except KeyboardInterrupt:
    print("Exiting...")


def start(config):
  """
    Start the Google Search Crawler
  """
  print("Google Search Crawler started...")
  pool_tasks(config)


if __name__ == "__main__":
  if len(sys.argv) != 2:
    print("Usage: python main.py <config_path>")
    sys.exit(1)
  print("Config path:", sys.argv[1])
  config = load_config(sys.argv[1])
  gsc_db.init_db(config)
  start(config)
