# Django settings for lot project.
from madrona.common.default_settings import *
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TIME_ZONE = 'America/Vancouver'
ROOT_URLCONF = 'urls'
LOGIN_REDIRECT_URL = '/visualize'

DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': 'marco',
        'USER': 'vagrant',
    }
}

LOG_DIR = '/var/log/marine-planner-wcodp/'
LOG_FILE = '/dev/null'

ADMIN_MEDIA_PATH = "/usr/local/venv/marine-planner/lib/python2.7/site-packages/django/contrib/admin/static/admin/"

STATIC_URL = '/static/'
MEDIA_URL = '/media/'
INSTALLED_APPS += ('django_extensions',
                   'social.apps.django_app.default',
                   'django.contrib.staticfiles',
                   'general',
                   'data_manager',
                   'mp_settings',
                   'mp_profile',
                   'explore',
                   'visualize',
                   'django.contrib.humanize',
                   'flatblocks',
                   'mp_proxy',
                   'ontology',
                   'django_mptt_admin',
                   'map_proxy'
                   )

GEOMETRY_DB_SRID = 99996
GEOMETRY_CLIENT_SRID = 3857  # for latlon
GEOJSON_SRID = 3857

APP_NAME = "West Coast Ocean Data Portal Marine Planner"
SERVER_ADMIN = 'edwin@pointnineseven.com'

ALLOWED_HOSTS = ['.apps.pointnineseven.com']

EMAIL_BACKEND = 'django.core.mail.backends.dummy.EmailBackend'

HELP_EMAIL = "developers@pointnineseven.com"
DEFAULT_FROM_EMAIL = "Point 97 Dev Team <developers@pointnineseven.com>"
SERVER_EMAIL = DEFAULT_FROM_EMAIL
EMAIL_SUBJECT_PREFIX = 'Marine Planner'
ADMINS = (
    ('Seth Hill', 'seth@pointnineseven.com'),
)
MANAGERS = ADMINS

MARINE_DEBRIS_URL = 'http://debris.westcoastoceans.org/'
MP_ONTOLOGY_URL = 'http://143.239.249.181:8080/sws/SWS?request=GetConceptHierarchy&responseLanguage=en&elementSet=extended'
MP_ONTOLOGY_FILTER_DEFAULT_LIMIT = 3 # years
FEEDBACK_RECIPIENT = "Point 97 Dev Team <developers@pointnineseven.com>"

# url for socket.io printing
# SOCKET_URL = 'http://dev.marco.marineplanning.org:8080'
SOCKET_URL = False

# Change the following line to True,
# to display the 'under maintenance' template
UNDER_MAINTENANCE_TEMPLATE = False

TEMPLATE_DIRS = (os.path.realpath(os.path.join(os.path.dirname(__file__),
                 'templates').replace('\\', '/')), )


AUTHENTICATION_BACKENDS = (
    # 'social.backends.google.GooglePlusAuth',
    'auth.CustomGooglePlusAuth',
    'django.contrib.auth.backends.ModelBackend',
)

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.contrib.auth.context_processors.auth',
    'django.core.context_processors.request',
    'social.apps.django_app.context_processors.backends',
    'social.apps.django_app.context_processors.login_redirect',
)

# MIDDLEWARE_CLASSES += (
#     'django.middleware.common.CommonMiddleware',
#     'django.contrib.sessions.middleware.SessionMiddleware',
#     'django.middleware.csrf.CsrfViewMiddleware',
#     'django.contrib.auth.middleware.AuthenticationMiddleware',
#     'django.contrib.messages.middleware.MessageMiddleware',
#     #'django.middleware.gzip.GZipMiddleware'

#     # Uncomment the next line for simple clickjacking protection:
#     # 'django.middleware.clickjacking.XFrameOptionsMiddleware',
# )
MIDDLEWARE_CLASSES = (
 'django.middleware.common.CommonMiddleware',
 'madrona.common.middleware.IgnoreCsrfMiddleware',
 'django.middleware.csrf.CsrfViewMiddleware',
 'django.contrib.sessions.middleware.SessionMiddleware',
 'django.contrib.messages.middleware.MessageMiddleware',
 'django.contrib.auth.middleware.AuthenticationMiddleware',
 'django.middleware.transaction.TransactionMiddleware',
 'madrona.openid.middleware.OpenIDMiddleware',
 'django.middleware.common.CommonMiddleware',
 'django.contrib.sessions.middleware.SessionMiddleware',
 'django.middleware.csrf.CsrfViewMiddleware',
 'django.contrib.auth.middleware.AuthenticationMiddleware',
 'django.contrib.messages.middleware.MessageMiddleware')


LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'main_formatter': {
            'format': '%(levelname)s:%(name)s: %(message)s '
                     '(%(asctime)s; %(filename)s:%(lineno)d)',
            'datefmt': "%Y-%m-%d %H:%M:%S",
        },
    },
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            # 'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler'
        },
        'console':{
            'level': 'DEBUG',
            # 'filters': ['require_debug_true'],
            'class': 'logging.StreamHandler',
            'formatter': 'main_formatter',
        },
        'production_file':{
            'level' : 'INFO',
            'class' : 'logging.handlers.RotatingFileHandler',
            'filename' : os.path.join(LOG_DIR, 'main.log'),
            'maxBytes': 1024*1024*5, # 5 MB
            'backupCount' : 7,
            'formatter': 'main_formatter',
            # 'filters': ['require_debug_false'],
        },
        'debug_file':{
            'level' : 'DEBUG',
            'class' : 'logging.handlers.RotatingFileHandler',
            'filename' : os.path.join(LOG_DIR, 'main_debug.log'),
            'maxBytes': 1024*1024*5, # 5 MB
            'backupCount' : 7,
            'formatter': 'main_formatter',
            # 'filters': ['require_debug_true'],
        },
        'null': {
            "class": 'django.utils.log.NullHandler',
        }
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins', 'console', 'production_file',],
            'level': 'ERROR',
            'propagate': True,
        },
        'django': {
            'handlers': ['null', ],
        },
        'py.warnings': {
            'handlers': ['null', ],
        },
        'apps': {
            'handlers': ['console', 'production_file', 'debug_file'],
            'level': "DEBUG",
        },
        'tracekit': {
            'handlers': ['console', 'production_file', 'debug_file'],
            'level': "DEBUG",
        },
    }
}

import logging
logging.getLogger('django.db.backends').setLevel(logging.ERROR)

try:
    from settings_local import *
except ImportError: 
    import warnings
    warnings.warn("settings_local.py module missing.")


