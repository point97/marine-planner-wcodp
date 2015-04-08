from django.conf import settings
import requests, logging

logger = logging.getLogger(__name__)

def get_filters():
    get_url = settings.MARINE_DEBRIS_URL + 'events/get_filters'
    print "Fetching URL {0}".format(get_url)
    try:
        results = requests.get(get_url)
    except Exception, e:
        print "Hit exception {0}".format(e)
        if logger:
            logger.exception(e)
            return None
    else:
        if results.status_code == 200:
            return results
        return None
