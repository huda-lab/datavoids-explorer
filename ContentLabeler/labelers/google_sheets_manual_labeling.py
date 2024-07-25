from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
import TasksManager.tasks.google_search_crawler as gct
import ContentLabeler.model as cl
from Commons.db import connect_db
import gspread

SCOPES = ["https://spreadsheets.google.com/feeds",
          "https://www.googleapis.com/auth/spreadsheets",
          "https://www.googleapis.com/auth/drive.file",
          "https://www.googleapis.com/auth/drive"]


class GoogleSheetsManualLabeling:

  def __init__(self, task_id, google_sheet_id, config):
    self.config = config
    self.task_id = task_id
    self.google_sheet_id = google_sheet_id
    self.credentials_file = config["APIs"]["google_sheets_api"]["credentials_file"]
    self.creds = None
    self.client = None
    self.sheet_service = None

  def authenticate(self):
    self.creds = Credentials.from_service_account_file(self.credentials_file, scopes=SCOPES)
    self.client = gspread.authorize(self.creds)
    self.sheet_service = build('sheets', 'v4', credentials=self.creds)

  def open_sheet(self) -> str:
    """
    Create a Google Sheet with columns URLs and Label, using the API and returns the sheet id to it
    """
    if not self.client:
      self.authenticate()

    if self.google_sheet_id:
      # no need to create a new one
      return

    spreadsheet = self.client.create(self.task_id)
    spreadsheet.share(None, perm_type='anyone', role='writer')
    self.google_sheet_id = spreadsheet.id

  def get_labels(self):
    db = connect_db(self.config['databases']['datavoids_explorer'])
    task = gct.GoogleCrawlerTask.by_id(self.task_id, db)
    if task is None:
      raise Exception("Task not found")
    labels = cl.get_all(self.task_id, db)
    db.close()
    return labels

  def export_labels(self):
    if not self.client:
      self.authenticate()

    if not self.google_sheet_id:
      self.open_sheet()

    labels = self.get_labels()
    sheet = self.client.open_by_key(self.google_sheet_id)
    sheet_name = "Sheet1"
    worksheet = sheet.worksheet(sheet_name)
    worksheet.clear()
    worksheet.append_row(["URL", "Label", "Manual Label"])
    rows = [[label["url"], label["label"], label["manual_label"]] for label in labels]
    worksheet.append_rows(rows)
    self.protect_columns(worksheet)

  def protect_columns(self, worksheet):
    body = {
      "requests": [
        {
          "addProtectedRange": {
            "protectedRange": {
              "range": {
                "sheetId": worksheet.id,
                "startRowIndex": 0,
                "endRowIndex": worksheet.row_count,
                "startColumnIndex": 0,
                "endColumnIndex": 2
              },
              "description": "Protecting first two columns",
              "warningOnly": False,  # True for warn but still allow edit
            }
          }
        }
      ]
    }
    self.sheet_service.spreadsheets().batchUpdate(
        spreadsheetId=self.google_sheet_id, body=body).execute()

  def get_sheet_url(self):
    return f'https://docs.google.com/spreadsheets/d/{self.google_sheet_id}/edit#gid=0'

  def import_labels(self, sheet_id):
    if not self.client:
      self.authenticate()

    sheet = self.client.open_by_key(sheet_id)
    sheet_name = "Sheet1"
    worksheet = sheet.worksheet(sheet_name)
    rows = worksheet.get_all_values()
    labels = [{"url": row[0], "label": row[1], "manual_label": row[2]} for row in rows[1:]]
    db = connect_db(self.config['databases']['datavoids_explorer'])
    cl.commit_manual_labeling(self.task_id, labels, db)
    db.close()
