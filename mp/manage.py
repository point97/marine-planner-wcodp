#!/usr/bin/env python
import os
import sys

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "settings")

    from django.core.management import execute_from_command_line

    from django.core.servers.basehttp import WSGIServer
    WSGIServer.request_queue_size = 10

    execute_from_command_line(sys.argv)