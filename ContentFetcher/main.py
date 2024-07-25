from Commons.db import *
from Commons.config import *
import sys
import time
import ContentFetcher.model as cf_db
import ContentFetcher.fetcher as fetcher


def pool_urls(config):
  """
    Loop over URLS every T time and see which ones need to be done
  """

  print("Pooling urls...")

  try:
    while True:
      db = connect_db(config['databases']['datavoids_explorer'])

      # get next url
      url = cf_db.get_next_url(db)
      if url:
        # fetch content for url
        print("Fetching content for url:", url)
        content = fetcher.fetch_content(url, config)
        cf_db.update_url_content(url, content, db)
      else:
        # no more urls to fetch, update URLs pool
        print("No more urls to fetch, updating URLs pool")
        cf_db.update_urls_content_db(db)
      db.close()

      # sleep
      time.sleep(config["content_fetcher"]["interval"] / 1000)
  except KeyboardInterrupt:
    fetcher.cleanup(config)
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
  cf_db.init_db(config)
  start(config)
