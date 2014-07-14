from django.conf.urls.defaults import *
from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import get_object_or_404

from data_manager.models import Layer
from ontology.models import RDFConcept
from ontology.utils import get_filters as ontology_get_filters
from proxy.views import proxy_view

from urllib import urlencode
from urlparse import urlparse
import requests, logging, httplib2, logging.config, json
#PROXY_FORMAT = u"http://%s/%s" % (settings.PROXY_DOMAIN, u"%s")

def getLegendJSON(request, url):
    logger = logging.getLogger(__name__)  
    logger.info("Begin getLegendJSON")
    logger.debug("Request: %s" % (request))
    conn = httplib2.Http()
    # optionally provide authentication for server
    #conn.add_credentials('admin','admin-password')
    if request.method == "GET":

        getUrl = request.GET.get('url')
        logger.debug(getUrl)
        parsedURL = urlparse(getUrl)
        #url_ending = "%s?%s" % (parts[0], parts[-1])
        #print(url_ending)
        #url = PROXY_FORMAT % url_ending
        #resp, content = conn.request(url, request.method)
        try:
          results = requests.get(getUrl)
        except Exception,e:
          if(logger):
            logger.exception(e)
        else:
          if(results.status_code == 200):
            return HttpResponse(results.text)
          return(HttpResponse(''))
    elif request.method == "POST":
        data = urlencode(request.POST)
        resp, content = conn.request(url, request.method, data)
        return HttpResponse(content)

def get_filters(request):
    if request.method == "GET":
        # 1. Get all RDFConcepts from the database.
        # 2. Return a list of {'slug': x, 'name': y, 'fields': [all,fields,with,this,concept]}
        # Then all I should have to do is rewrite the type ahead to use the 'fields' field.
        _all_concepts = RDFConcept.objects.all().select_related('lft', 'rght')
        concepts = { 'fields': [] }

        for concept in _all_concepts:
            fields = []

            if concept.slug != '':
                fields.append(concept.slug)

            subchildren = _all_concepts.filter(lft__gt=concept.lft, rght__lt=concept.rght)
            [fields.append(x.slug) for x in subchildren if x.slug != '']

            if concept.slug != '' and len(fields) > 0:
                to_append = {
                    #'slug': concept.slug,
                    'name': concept.preflabel,
                    'fields': list(set(fields)) # Remove duplicates
                }
                concepts['fields'].append(to_append)

        return HttpResponse(json.dumps(concepts), content_type="application/json")
    return HttpResponse(json.dumps({'fields': []}), content_type="application/json")


def layer_proxy_view(request, layer_id):
    layer = get_object_or_404(Layer, id=layer_id, proxy_url=True)
    return proxy_view(request, layer.url)

