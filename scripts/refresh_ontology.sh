#!/bin/bash

# Install in cron with (run once a day at 1am)
# 0 1 * * * path/to/marine_planner_wcodp_refresh_ontology.sh

source /usr/local/venv/marine-planner-wcodp/bin/activate
cd /usr/local/apps/marine-planner-wcodp/mp
python manage.py syncrdf


