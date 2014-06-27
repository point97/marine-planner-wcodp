from django.db import models
from django.conf import settings
from django.contrib.gis.db import models
from django.template.defaultfilters import slugify

import caching.base

class Term(caching.base.CachingMixin, models.Model):
    name = models.CharField(max_length=125)
    slug = models.CharField(max_length=125)
    description = models.TextField(blank=True, null=True)
    parents = models.ManyToManyField("self", blank=True, null=True, related_name="children")
    # self.children.all()
    objects = caching.base.CachingManager() #caches in redis