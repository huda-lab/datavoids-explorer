import trafilatura
import time
from requests_html import HTMLSession
from selenium.webdriver.chrome.options import Options
from selenium import webdriver
from webdriver_manager.firefox import GeckoDriverManager
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
import platform

selenium_instance = None


def cleanup(config):
  """
  Cleanup
  """
  global selenium_instance
  if selenium_instance is not None:
    selenium_instance.quit()
    selenium_instance = None


def get_selenium_instance(config):
  """
  Get a selenium instance
  """
  global selenium_instance
  if selenium_instance is not None:
    return selenium_instance

  chrome_options = Options()
  chrome_options.add_argument("--disable-extensions")
  chrome_options.add_argument("--disable-gpu")
  if platform.system() == "Linux":
    chrome_options.add_argument("--no-sandbox")
  if config["content_fetcher"]["headless"]:
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument("--headless=new")  # for Chrome >= 109
    chrome_options.add_argument('--headless')
  chrome_options.add_experimental_option("prefs", {
     "profile.default_content_settings.popups": 0,
      "download.default_directory": "/dev/null",
      "download.prompt_for_download": False,
      "download.directory_upgrade": True,
      "safebrowsing.enabled": True,
      "download_restrictions": 3,
    }
  )
  selenium_instance = webdriver.Chrome(
      service=Service(ChromeDriverManager().install()),
      options=chrome_options)
  selenium_instance.execute_cdp_cmd("Page.setDownloadBehavior", {"behavior": "deny"})
  selenium_instance.set_page_load_timeout(config["content_fetcher"]["timeout"])

  return selenium_instance


def get_firefox_instance(config):
  """
  Get a firefox instance
  """
  firefox_options = webdriver.FirefoxOptions()
  if config["content_fetcher"]["headless"]:
    firefox_options.add_argument('--headless')
  browser = webdriver.Firefox(
      executable_path=GeckoDriverManager().install(),
      options=firefox_options,
      service_log_path='/dev/null')
  return browser


def get_content_using_selenium(url, config):
  content = None
  browser = None
  try:
    browser = get_selenium_instance(config)
    browser.get(url)
    html_source = browser.page_source
    if html_source is None:
      print("Failed to get content for url:", url)
      return None
    content = trafilatura.extract(html_source)
  except Exception as e:
    print("Failed to get content for url:", url, "cause of", e)
  return content


def get_content_using_http_sessions(url, config):
  content = None
  try:
    html_session = HTMLSession()
    response = html_session.get(url, timeout=config["content_fetcher"]["timeout"])
    content = trafilatura.extract(response.text)
  except Exception as e:
    print("Failed to get content for url:", url, "cause of", e)
  return content


def fetch_content(url, config):
  retries = 3
  content = None

  for ext in config["content_fetcher"]["ignore_extensions"]:
    if url.endswith(ext):
      return 'Error'

  while True:
    if config["content_fetcher"]["always_use_selenium"]:
      print("Fetching with selenium for url:", url)
      content = get_content_using_selenium(url, config)
    else:
      print("Fetching with http sessions for url:", url)
      content = get_content_using_http_sessions(url, config)

    if content is not None:
      break
    else:
      print("Failed to get content for url:", url)

      # If there was an exception (e.g. a network error), retry the request
      retries -= 1

      # if we have reached the maximum number of retries, let's try with another method
      if retries <= 0:
        # if we were not using selenium before, let's try with it
        if not config["content_fetcher"]["always_use_selenium"]:
          content = get_content_using_selenium(url, config)
        else:
          # if we were using selenium before, let's try without it
          content = get_content_using_http_sessions(url, config)
        if content is None:
          print("Failed to get content for url:", url)
          content = 'Error'
        break

      print("Retrying...")
      time.sleep(1)

  return content
