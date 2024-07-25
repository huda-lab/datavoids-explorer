from Commons.db import connect_db
from datetime import datetime
from GoogleSearchCrawler.definitions import ScheduleFrequency
from TasksManager.definitions import TaskStatus

# This is to manage the GoogleSearchCrawler tasks


def init_db(db):
  """
  Initializes the tasks database
  """
  cursor = db.cursor()

  cursor.execute("""
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE TABLE IF NOT EXISTS tasks (
      task_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      keywords varchar,
      schedule_from timestamp,
      schedule_to timestamp,
      frequency varchar,
      disinformer_narrative varchar,
      mitigator_narrative varchar,
      neutral_narrative varchar,
      status_google_search_crawler varchar,
      status_content_fetcher varchar,
      status_labeler varchar
    );
  """)

  cursor.close()
  db.commit()


def get_tasks(db):
  """ Get all tasks """
  cursor = db.cursor()
  cursor.execute("""
    SELECT
      task_id,
      keywords,
      schedule_from,
      schedule_to,
      frequency,
      disinformer_narrative,
      mitigator_narrative,
      neutral_narrative,
      status_google_search_crawler,
      status_content_fetcher,
      status_labeler
    FROM tasks
  """)
  tasks_data = cursor.fetchall()
  tasks = [GoogleCrawlerTask(
      keywords=task[1],
      date_from=task[2],
      date_to=task[3],
      frequency=task[4],
      disinformer_narrative=task[5],
      mitigator_narrative=task[6],
      neutral_narrative=task[7],
      status_google_search_crawler=TaskStatus.from_str(task[8]),
      status_content_fetcher=TaskStatus.from_str(task[9]),
      status_labeler=TaskStatus.from_str(task[10]),
      id=task[0],
  ) for task in tasks_data]
  cursor.close()
  return tasks


def get_active_tasks(db):
  """ Get active tasks """
  cursor = db.cursor()
  cursor.execute("""
    SELECT
      task_id,
      keywords,
      schedule_from,
      schedule_to,
      frequency,
      disinformer_narrative,
      mitigator_narrative,
      neutral_narrative,
      status_google_search_crawler,
      status_content_fetcher,
      status_labeler
    FROM tasks
    WHERE
         status_google_search_crawler = %s
      OR status_content_fetcher = %s
      OR status_labeler = %s
  """, (
    TaskStatus.ACTIVE.value,
    TaskStatus.ACTIVE.value,
    TaskStatus.ACTIVE.value
  ))
  tasks_data = cursor.fetchall()
  tasks = [GoogleCrawlerTask(
      keywords=task[1],
      date_from=task[2],
      date_to=task[3],
      frequency=task[4],
      disinformer_narrative=task[5],
      mitigator_narrative=task[6],
      neutral_narrative=task[7],
      status_google_search_crawler=TaskStatus.from_str(task[8]),
      status_content_fetcher=TaskStatus.from_str(task[9]),
      status_labeler=TaskStatus.from_str(task[10]),
      id=task[0]
  ) for task in tasks_data]
  cursor.close()
  return tasks


def get_google_search_crawler_active_tasks(db):
  """ Get active tasks for google search crawler"""
  cursor = db.cursor()
  cursor.execute("""
    SELECT
      task_id,
      keywords,
      schedule_from,
      schedule_to,
      frequency,
      disinformer_narrative,
      mitigator_narrative,
      neutral_narrative,
      status_google_search_crawler,
      status_content_fetcher,
      status_labeler
    FROM tasks
    WHERE google_search_crawler_status = %s
  """, (TaskStatus.ACTIVE.value,))
  tasks_data = cursor.fetchall()
  tasks = [GoogleCrawlerTask(
      keywords=task[1],
      date_from=task[2],
      date_to=task[3],
      frequency=task[4],
      disinformer_narrative=task[5],
      mitigator_narrative=task[6],
      neutral_narrative=task[7],
      status_google_search_crawler=TaskStatus.from_str(task[8]),
      status_content_fetcher=TaskStatus.from_str(task[9]),
      status_labeler=TaskStatus.from_str(task[10]),
      id=task[0]
  ) for task in tasks_data]
  cursor.close()
  return tasks


class GoogleCrawlerTask:
  def __init__(self,
               keywords: str,
               date_from: datetime,
               date_to: datetime,
               frequency: ScheduleFrequency,
               disinformer_narrative: str,
               mitigator_narrative: str,
               neutral_narrative: str,
               status_google_search_crawler: TaskStatus = None,
               status_content_fetcher: TaskStatus = None,
               status_labeler: TaskStatus = None,
               id=None):
    self.keywords = keywords
    self.date_from = date_from
    self.date_to = date_to
    if isinstance(frequency, str):
      self.frequency = ScheduleFrequency.from_str(frequency)
    else:
      self.frequency = frequency
    self.disinformer_narrative = disinformer_narrative
    self.mitigator_narrative = mitigator_narrative
    self.neutral_narrative = neutral_narrative
    self.status_google_search_crawler = status_google_search_crawler
    self.status_content_fetcher = status_content_fetcher
    self.status_labeler = status_labeler
    self.set_status()
    self.id = id

  def set_status(self):
    if self.status_google_search_crawler is None:
      self.status_google_search_crawler = TaskStatus.ACTIVE
    if self.status_content_fetcher is None:
      self.status_content_fetcher = TaskStatus.ACTIVE
    if self.status_labeler is None:
      self.status_labeler = TaskStatus.ACTIVE
    if self.status_google_search_crawler == TaskStatus.DONE \
        and self.status_content_fetcher == TaskStatus.DONE \
            and self.status_labeler == TaskStatus.DONE:
      self.status = TaskStatus.DONE
    elif self.status_google_search_crawler == TaskStatus.ERROR \
        or self.status_content_fetcher == TaskStatus.ERROR \
            or self.status_labeler == TaskStatus.ERROR:
      self.status = TaskStatus.ERROR
    elif self.status_google_search_crawler == TaskStatus.CANCELLED \
        or self.status_content_fetcher == TaskStatus.CANCELLED \
            or self.status_labeler == TaskStatus.CANCELLED:
      self.status = TaskStatus.CANCELLED
    else:
      self.status = TaskStatus.ACTIVE

  def to_dict(self):
    return {
      "id": self.id,
      "keywords": self.keywords,
      "schedule": {
        "from": self.date_from.isoformat(),
        "to": self.date_to.isoformat(),
        "frequency": self.frequency.value
      },
      "narratives": {
        "disinformer": self.disinformer_narrative,
        "mitigator": self.mitigator_narrative,
        "neutral": self.neutral_narrative
      },
      "status_google_search_crawler": self.status_google_search_crawler.value,
      "status_content_fetcher": self.status_content_fetcher.value,
      "status_labeler": self.status_labeler.value,
      "status": self.status.value
    }

  def by_id(task_id, db):
    """
    Retrieves a task by its id
    """
    cursor = db.cursor()
    try:
      cursor.execute("""
        SELECT
          keywords,
          schedule_from,
          schedule_to,
          frequency,
          disinformer_narrative,
          mitigator_narrative,
          neutral_narrative,
          status_google_search_crawler,
          status_content_fetcher,
          status_labeler
        FROM tasks
        WHERE task_id = %s
      """, (task_id,))
      task = cursor.fetchone()
      if task is None:
        return None
      task = GoogleCrawlerTask(
          keywords=task[0],
          date_from=task[1],
          date_to=task[2],
          frequency=task[3],
          disinformer_narrative=task[4],
          mitigator_narrative=task[5],
          neutral_narrative=task[6],
          status_google_search_crawler=TaskStatus.from_str(task[7]),
          status_content_fetcher=TaskStatus.from_str(task[8]),
          status_labeler=TaskStatus.from_str(task[9]),
          id=task_id
      )
    except Exception as e:
      return None
    finally:
      cursor.close()
    return task

  def start(self, db):
    """
    Starts a new google search crawler task
    """
    cursor = db.cursor()
    cursor.execute("""
      INSERT INTO tasks (
          keywords,
          schedule_from,
          schedule_to,
          frequency,
          disinformer_narrative,
          mitigator_narrative,
          neutral_narrative,
          status_google_search_crawler,
          status_content_fetcher,
          status_labeler
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING task_id
    """, (
        self.keywords,
        self.date_from.isoformat(),
        self.date_to.isoformat(),
        self.frequency.value,
        self.disinformer_narrative,
        self.mitigator_narrative,
        self.neutral_narrative,
        TaskStatus.ACTIVE.value,
        TaskStatus.ACTIVE.value,
        TaskStatus.ACTIVE.value
    ))
    self.id = cursor.fetchone()
    cursor.close()
    db.commit()
    return self.id

  def start_relabeling(self, task, new_disinformer_narrative: str,
                       new_mitigator_narrative: str,
                       new_neutral_narrative: str,
                       db):
    """
    Starts a new google search crawler task
    """
    cursor = db.cursor()
    cursor.execute("""
      INSERT INTO tasks (
          keywords,
          schedule_from,
          schedule_to,
          frequency,
          disinformer_narrative,
          mitigator_narrative,
          neutral_narrative,
          status_google_search_crawler,
          status_content_fetcher,
          status_labeler
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING task_id
    """, (
        self.keywords,
        self.date_from.isoformat(),
        self.date_to.isoformat(),
        self.frequency.value,
        new_disinformer_narrative,
        new_mitigator_narrative,
        new_neutral_narrative,
        task.status_google_search_crawler.value, 
        task.status_content_fetcher.value,
        task.status_labeler.value,
    ))
    new_id = cursor.fetchone()
    cursor.close()
    #TODO copy all URLs from the old task to the new
    db.commit()
    return GoogleCrawlerTask(
      self.keywords,
      self.date_from,
      self.date_to,
      self.frequency,
      new_disinformer_narrative,
      new_mitigator_narrative,
      new_neutral_narrative,
      id=new_id
    )

  def update_task_status(self, db):
    """
    Updates the status of a task
    """
    cursor = db.cursor()
    cursor.execute("""
      UPDATE tasks
      SET status_google_search_crawler = %s,
          status_content_fetcher = %s,
          status_labeler = %s
      WHERE task_id = %s;
    """, (
      self.status_google_search_crawler.value,
      self.status_content_fetcher.value,
      self.status_labeler.value,
      self.id
    ))
    cursor.close()
    db.commit()

  def get_results(self, db):
    """
    Get task results
    """
    cursor = db.cursor()
    try:
      cursor.execute("""
        SELECT
          distinct
          ul.url,
          COALESCE(manual_label, label) AS label,
          to_char(date, 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
          position
        FROM
          google_search_crawler_results gscr
            LEFT JOIN
          urls_labels ul
            ON
          gscr.url = ul.url AND gscr.task_id = ul.task_id
        WHERE
          gscr.task_id = %s
      """, (self.id,))
      results = cursor.fetchall()
      cursor.close()
      return results

    except Exception as e:
      cursor.close()
      return []

  def __str__(self) -> str:
    res = "Task"
    if self.id is None:
      res += f": {self.keywords} "
    else:
      res += f" {self.id}: '{self.keywords} "
    res += f"from {self.date_from} to {self.date_to} every {self.frequency}"
    return res
