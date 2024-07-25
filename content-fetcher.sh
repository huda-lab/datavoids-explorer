#!/bin/bash
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
pipenv run python ContentFetcher/main.py config.json