from __future__ import annotations
from typing import TYPE_CHECKING
if TYPE_CHECKING:
  from TasksManager.tasks.google_search_crawler import GoogleCrawlerTask
  from typing import List

from datetime import datetime
from datetime import timedelta
import requests
from GoogleSearchCrawler.model import GoogleSearchCrawlerResult

def google_search_api(gsc_config, keywords, date_end=None):
  api_config = gsc_config["google_search_api"]
  num_results = gsc_config["num_results"]
  if date_end is None:
    formatted_query = keywords
  else:
    formatted_date_end = date_end.strftime("%Y-%m-%d")
    formatted_query = f"{keywords} before:{formatted_date_end}"
  params = {
      'q': formatted_query,
      'cx': api_config["cse_id"],
      'key': api_config["key"],
      'num': num_results,
      'fields': 'items(snippet, linke)' 
  }
  response = requests.get("https://www.googleapis.com/customsearch/v1", params=params)
  return response.json()


def get_google_search_results_using_api(
  task: GoogleCrawlerTask, date_end, config) -> List[GoogleSearchCrawlerResult]:
  gsc_config = config["google_search_crawler"]
  api_config = gsc_config["google_search_api"]
  num_results = gsc_config["num_results"]

  if date_end is None:
    formatted_query = task.keywords
  else:
    formatted_date_end = date_end.strftime("%Y-%m-%d")
    formatted_query = f"{task.keywords} before:{formatted_date_end}"
  params = {
      'q': formatted_query,
      'cx': api_config["cse_id"],
      'key': api_config["key"],
      'num': num_results,
      'fields': 'items(link, snippet)' 
  }

  results = []
  position = 0
  while num_results > 0:
    response = requests.get("https://www.googleapis.com/customsearch/v1", params=params)

    if response.status_code != 200:
      print("Error:", response.json().get("error", {}).get("message", "Unknown Error"))
      return results

    data = response.json()
    for res in data.get('items', []):
      results.append(GoogleSearchCrawlerResult(
        task.id,
        date_end,
        res['link'],
        res['snippet'],
        position)
      )
      position += 1

    if 'nextPage' not in data.get('queries', {}):
      break

    params['start'] = data['queries']['nextPage'][0]['startIndex']
    num_results -= 10
  
  if not results:
    results.append(GoogleSearchCrawlerResult(task.id, date_end, "NO RESULTS", 0))

  return results
