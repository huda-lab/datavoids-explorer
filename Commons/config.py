from typing import Dict
import json

def load_config(path=None) -> Dict:
  '''
    Load the configuration file from the given path
  '''
  if path is None:
    path = 'config.json'
  config = None
  with open(path) as config_file:
    config = json.load(config_file)
  return config