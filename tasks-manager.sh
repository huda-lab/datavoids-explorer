#!/bin/bash
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
pipenv run python TasksManager/main.py config.json