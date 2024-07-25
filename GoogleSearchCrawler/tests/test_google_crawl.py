import sys
from datetime import datetime
from Commons.config import *
import TasksManager.tasks.google_search_crawler as gct
import GoogleSearchCrawler.crawler as gsc_crawler

if __name__ == "__main__":
  if len(sys.argv) != 4:
    print("Usage: python main.py <config_path> <keyword> <date>")
    sys.exit(1)
  print("Config path:", sys.argv[1])
  config = load_config(sys.argv[1])
  keyword = sys.argv[2]
  gsc_config = config["google_search_crawler"]
  date_end = datetime.fromisoformat(sys.argv[3])
  results = gsc_crawler.google_search_api(gsc_config, keyword, date_end=date_end)
  print(results)
