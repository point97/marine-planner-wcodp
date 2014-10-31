import datetime
import json
import logging
from urllib import urlencode
from urlparse import urlparse

from django.conf.urls.defaults import *
from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
import httplib2
from proxy.views import proxy_view
import requests

from data_manager.models import Layer
from ontology.models import RDFConcept


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
        _all_concepts = RDFConcept.objects.all().select_related('lft', 'rght')
        concepts = {}

        for concept in _all_concepts:
            fields = []

            # Aggregate and append all the descendants of this concept, and append
            # their slugs to the list:
            subchildren = concept.get_descendants()
            [fields.append(x) for x in subchildren if x.slug != '']

            # Append if it exists, create it otherwise. This removes duplicate
            # entries.
            fun_tuples = [x.preflabel for x in fields]
            if concepts.get(concept.preflabel):
                map(concepts[concept.preflabel]["tuples"].append, fun_tuples)
                concepts[concept.preflabel]["tuples"] = list(set(concepts[concept.preflabel]["tuples"]))
            else:
                concepts[concept.preflabel] = {
                    "tuples": list(set(fun_tuples))
                }
            # Do this after so the logic remains
            concepts[concept.preflabel]["slug"] = concept.slug
        to_return = [{'name': k, 'slug': v['slug'], 'subfields': v['tuples']} for k,v in concepts.items()]

        return HttpResponse(json.dumps(to_return), content_type="application/json")
    return HttpResponse("[]", content_type="application/json")


def layer_proxy_view(request, layer_id):
    layer = get_object_or_404(Layer, id=layer_id, proxy_url=True)
    new_req_url = None
    
    to = request.GET.get('to')
    from_ = request.GET.get('from')
    
    if not to and not from_: 
        try:
            limit = settings.MP_ONTOLOGY_FILTER_DEFAULT_LIMIT
        except: 
            limit = 3
        
        to = datetime.date.today()
        from_ = to.replace(year=to.year - limit)

        to = to.strftime('%Y-%m-%d')
        from_ = from_.strftime('%Y-%m-%d')
    
    concepts = request.GET.get('concepts', [])
    if concepts: 
        concepts = [concepts.split(',')]
    categories = request.GET.get('categories', [])
    if categories: 
        categories = categories.split(',')
    type_ = request.GET.get('type')
    
    for category in categories:
        # Get the list of categories in the concept
        concept_list = RDFConcept.objects.filter(preflabel=category)
        if not concept_list:
            continue
        concepts.append(child.slug 
                        for child in concept_list[0].get_descendants()
                        if child.slug)

    query_parameters = []
    if from_:
        query_parameters.append("from=%s" % from_)
    if to: 
        query_parameters.append("to=%s" % to)
    if type_: 
        query_parameters.append("type=%s" % type_)

    for concept_list in concepts:
        query_parameters.append('c=%s' % (','.join(concept_list)))

    if query_parameters: 
        new_req_url = '%s&%s' % (layer.url, '&'.join(query_parameters))

    resp = None
    if new_req_url:
        r = requests.get(new_req_url)
        # Note: Future versions will need to use r.iter_content and a django
        # Streaming HTTP Response. 
        resp = HttpResponse(r.text, r.status_code)
    else:
        # If we don't have any categories we just do this:
        resp = proxy_view(request, layer.url)
    return resp


def capabilities_proxy_view(request, layer_id):
    layer = get_object_or_404(Layer, id=layer_id)
    if layer.url.endswith('?'):
        orig_url = layer.url[:-1]
    else:
        orig_url = layer.url
    capabilities_url = orig_url + '?request=getCapabilities'
    extra_requests_args = {'headers': {'CONTENT-TYPE': 'text/xml'}}
    return proxy_view(request, capabilities_url, extra_requests_args)



