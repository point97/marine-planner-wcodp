from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from ontology.models import RDFConcept
from lxml import etree
import requests

class Command(BaseCommand):
    args = ''
    help = 'Syncs the RDFConcepts from settings.MP_ONTOLOGY_URL to the database.'

    def handle(self, *args, **options):
        target_url = settings.MP_ONTOLOGY_URL

        if target_url is None or len(target_url) == 0:
            raise CommandError('You need to specify an MP_ONTOLOGY_URL in settings.')

        # I'm pretty sure this is all in a transaction...
        RDFConcept.objects.all().delete()

        resp = requests.get(target_url)
        if resp.status_code != 200:
            raise CommandError("Could not contact ontology url.")

        # 1. Pass stuff into LXML
        parsed = etree.fromstring(resp.content)
        # 2. Parse into tree
        import ipdb; ipdb.set_trace()
        "asdf"

        #raise CommandError('Poll "%s" does not exist' % poll_id)
        #self.stdout.write('Successfully closed poll "%s"' % poll_id)
