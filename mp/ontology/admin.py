from django.contrib import admin
from django_mptt_admin.admin import DjangoMpttAdmin
from models import RDFConcept

class RDFConceptAdmin(DjangoMpttAdmin):
    pass

admin.site.register(RDFConcept, RDFConceptAdmin)

