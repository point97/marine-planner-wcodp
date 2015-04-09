#!/bin/bash

set -e 

PROJECT=mp
BIND=127.0.0.1:8002
APPDIR=/usr/local/apps/marine-planner-wcodp
VENVDIR=/usr/local/venv/marine-planner-wcodp
GUNICORN=/usr/local/venv/marine-planner-wcodp/bin/gunicorn
LOGFILE=/var/log/marine-planner-wcodp/gunicorn.log
PIDFILE=/var/run/marine-planner-wcodp.pid
TIMEOUT_S=600
NUM_WORKERS=4
USER=marine-planner
GROUP=marine-planner

cd $APPDIR
source $VENVDIR/bin/activate
exec $GUNICORN $PROJECT.wsgi_wcgardf:application \
     --bind $BIND \
     --workers $NUM_WORKERS \
     --timeout $TIMEOUT_S \
     --pid $PIDFILE \
     --user=$USER --group=$GROUP --log-level=INFO --log-file=$LOGFILE 2>>$LOGFILE &
