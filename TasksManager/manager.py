from Commons.db import connect_db
import os
from typing import Dict
import TasksManager.tasks.google_search_crawler as gct


def init_db(config):
  """
  Initializes the tasks database
  """
  db = connect_db(config['databases']['datavoids_explorer'])
  gct.init_db(db)
  db.close()


def current_tasks(db):
  """
  Returns the current tasks in the database
  """
  tasks = []

  gct_tasks = gct.get_active_tasks(db)
  tasks += [t.id for t in gct_tasks]

  # TODO possibly there are other types of tasks in the future to add
  # TODO merge all uniformly independently on the type of task

  return tasks


def all_tasks(db):
  """
  Return all tasks, even the ones that finished
  """
  tasks = []

  gct_tasks = gct.get_tasks(db)
  tasks += [t.to_dict() for t in gct_tasks]
  
  # TODO possibly there are other types of tasks in the future to add
  # TODO merge all uniformly independently on the type of task

  return tasks