from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from Commons.config import *
import TasksManager.manager as tasks_manager
import TasksManager.tasks.google_search_crawler as gct
import ContentLabeler.model as cl
from ContentLabeler.labelers.google_sheets_manual_labeling import GoogleSheetsManualLabeling
from time import sleep
from Commons.db import connect_db
from datetime import datetime
import sys

app = Flask(__name__)
cors = CORS(app)


@app.before_request
def init():
  if len(sys.argv) > 2:
    os.chdir(sys.argv[2])


@app.route('/task/collection/start', methods=['POST'])
def collection_request():
  data = request.json
  db = connect_db(config['databases']['datavoids_explorer'])
  task = gct.GoogleCrawlerTask(
    data['keywords'],
    datetime.fromisoformat(data['schedule']['from']),
    datetime.fromisoformat(data['schedule']['to']),
    data['schedule']['frequency'],
    data['narratives']['disinformer'],
    data['narratives']['mitigator'],
    data['narratives']['neutral']
  )
  task.start(db)
  db.close()
  return jsonify({"status": "success", "taskId": task.id})


@app.route('/task/relabeling/start', methods=['POST'])
def relabeling_request():
  data = request.json
  db = connect_db(config['databases']['datavoids_explorer'])
  print("Relabeling started", data)
  task = gct.GoogleCrawlerTask.by_id(data['task_id'], db)
  new_task = task.start_relabeling(
    task,
    data['new_narratives']['disinformer'],
    data['new_narratives']['mitigator'],
    data['new_narratives']['neutral'],
    db
  )
  db.close()
  return jsonify({"status": "success", "taskId": new_task.id})


@app.route('/task/info/<task_id>')
def collection_info(task_id):
  db = connect_db(config['databases']['datavoids_explorer'])
  task = gct.GoogleCrawlerTask.by_id(task_id, db)
  db.close()
  return jsonify(task.to_dict() if task is not None else None)


@app.route('/task/collection/results/<task_id>')
def collection_results(task_id):
  db = connect_db(config['databases']['datavoids_explorer'])
  task = gct.GoogleCrawlerTask.by_id(task_id, db)
  results = []
  if task is not None:
    results = task.get_results(db)
  db.close()
  return jsonify(results)


@app.route('/labeler/export', methods=['POST'])
def export_results():
  data = request.json
  try:
    sleep(1)
    task_id = data['taskId']
    google_sheet_id = data['googleSpreadSheetId'] if 'googleSpreadSheetId' in data else None
    ml = GoogleSheetsManualLabeling(task_id, google_sheet_id, config)
    ml.export_labels()
    sheet_id = ml.google_sheet_id
  except Exception as e:
    return jsonify({"status": "error", "message": str(e)})
  return jsonify({"status": "success", "googleSpreadSheetId": sheet_id})

@app.route('/labeler/import', methods=['POST'])
def import_labels():
    data = request.json
    try:
        sleep(1)
        task_id = data['taskId']
        google_sheet_id = data['googleSpreadSheetId']
        print("Task ID:", task_id)
        print("Google Sheet ID:", google_sheet_id)  
        print("Importing labels...")
        ml = GoogleSheetsManualLabeling(task_id, google_sheet_id, config)
        print("ml", ml)
        ml.import_labels(google_sheet_id)
        print("Labels imported successfully")     
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})
    return jsonify({"status": "success", "message": "Labels reimported successfully"})


@ app.route('/config', methods=['GET'])
def get_config():
  return jsonify(config)


@ app.route('/active_tasks', methods=['GET'])
def tasks():
  db = connect_db(config['databases']['datavoids_explorer'])
  tasks = jsonify(tasks_manager.current_tasks(db))
  db.close()
  return tasks


@ app.route('/tasks', methods=['GET'])
def all_tasks():
  db = connect_db(config['databases']['datavoids_explorer'])
  tasks = jsonify(tasks_manager.all_tasks(db))
  db.close()
  return tasks


if __name__ == '__main__':
  print("Config path:", sys.argv[1])
  config = load_config(sys.argv[1])
  tasks_manager.init_db(config)
  app.run(port=config['tasks_manager']['port'], debug=True)
