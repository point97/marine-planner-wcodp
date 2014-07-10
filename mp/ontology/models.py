from django.db import models
from django.conf import settings
from django.contrib.gis.db import models
from django.template.defaultfilters import slugify

from mptt.models import MPTTModel, TreeForeignKey

import caching.base

class Term(caching.base.CachingMixin, models.Model):
    name = models.CharField(max_length=125)
    slug = models.CharField(max_length=125)
    description = models.TextField(blank=True, null=True)
    parents = models.ManyToManyField("self", blank=True, null=True, related_name="children")
    # self.children.all()
    objects = caching.base.CachingManager() #caches in redis

class RDFConcept(caching.base.CachingMixin, MPTTModel):
    parent = TreeForeignKey('self', null=True, blank=True, related_name='children', db_index=True)
    # URI From RDF for this concept
    uri = models.CharField(max_length=255)
    preflabel = models.CharField(max_length=125)
    definition = models.TextField(null=True, blank=True)

    objects = caching.base.CachingManager()

    def __unicode__(self):
        return self.preflabel
