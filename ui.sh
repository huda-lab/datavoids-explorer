#!/bin/bash
cd DataVoidsExplorerUI
npm install

DATAVOID_EXPLORER_SERVER_URL=$(python3 << END
import json
with open('../config.json', 'r') as configf:
  config = json.load(configf)
  print(config['datavoids_explorer_ui']['tasks_manager_url'])
END
) npm start