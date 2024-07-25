#!/bin/bash
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
pipenv run python DataImporter/import_data.py config.json