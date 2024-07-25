#!/bin/bash
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
pipenv run python ContentLabeler/main.py config.json