from Commons.db import *
from Commons.config import *
import sys
import time
import ContentLabeler.model as cl_db
from ContentLabeler.labelers import get_labeler
from TasksManager.tasks.google_search_crawler import GoogleCrawlerTask
from ContentLabeler.label import ContentLabel

def pool_urls(config):
  """
    Loop over URLS every T time and see which ones need to be done
  """
  try:
    while True:
      print("Pooling urls...")
      db = connect_db(config["databases"]["datavoids_explorer"])
      next_unlabeled = cl_db.get_next_unlabeled(db)
      if next_unlabeled is None:
        time.sleep(config["content_labeler"]["interval"] / 1000)
        continue

      task_id, url, content = next_unlabeled
      print("Processing URL:", url, '(task:', task_id, ')')

      try:
        if content == 'Error':
          raise Exception("Error while fetching content for url:", url)

        # retrieving tasks details
        task = GoogleCrawlerTask.by_id(task_id, db)

        # crating labeler instance
        labeler = get_labeler(
          task.disinformer_narrative,
          task.mitigator_narrative,
          task.neutral_narrative,
          config
        )

        # labeling and saving the results
        label = labeler.label(content)
        label = ContentLabel.from_str(label)
      except Exception as e:
        print("Error while labeling:", e)
        label = ContentLabel.ERROR

      cl_db.set_label(task_id, url,label, db)

      db.close()

      time.sleep(config["content_labeler"]["interval"] / 1000)
  except KeyboardInterrupt:
    print("Exiting...")


def start(config):
  """
    Start the Google Search Crawler
  """
  print("Google Search Crawler started...")
  pool_urls(config)


if __name__ == "__main__":
  if len(sys.argv) != 2:
    print("Usage: python main.py <config_path>")
    sys.exit(1)
  print("Config path:", sys.argv[1])
  config = load_config(sys.argv[1])
  cl_db.init_db(config)
  start(config)
