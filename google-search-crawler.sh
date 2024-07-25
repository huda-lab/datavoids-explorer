#!/bin/bash
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
pipenv run python GoogleSearchCrawler/main.py config.json