
To add data add in the data folder your csv file with the same format as the others, 
and change the file in `data/index.json` adding an object like the following:

```json
  {
    "task_id": "your_task_id",
    "data_file": "your_csv_file.csv",
    "keywords": "your keywords",
    "from": "2020-12-01 00:00:00",
    "to": "2024-12-01 00:00:00",
    "frequency": "Monthly",
    "disinformer_narrative": "Your disinformer narrative",
    "mitigator_narrative": "Your mitigator narrative",
    "neutral_narrative": "Your neutral narrative"
  }
```
