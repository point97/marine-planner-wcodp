from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from ontology.models import RDFConcept
from lxml import etree
import requests

CONCEPT_TAG = '{http://www.w3.org/2004/02/skos/core#}Concept'
CONCEPT_KEY = '{http://www.w3.org/1999/02/22-rdf-syntax-ns#}about'

class Command(BaseCommand):
    args = ''
    help = 'Syncs the RDFConcepts from settings.MP_ONTOLOGY_URL to the database.'

    def handle(self, *args, **options):
        target_url = settings.MP_ONTOLOGY_URL

        if target_url is None or len(target_url) == 0:
            raise CommandError('You need to specify an MP_ONTOLOGY_URL in settings.')

        resp = requests.get(target_url)
        if resp.status_code != 200:
            raise CommandError("Could not contact ontology url.")

        # Parse the concept hierarchy with lxml
        parsed = etree.fromstring(resp.content)

        for child in parsed.getchildren():
            if child.tag != CONCEPT_TAG:
                raise ValueError("Found a child of root that wasn't a concept: {0}".format(child.tag))
            import ipdb; ipdb.set_trace()
            "asdf"

            concept, _ = RDFConcept.objects.get_or_create(uri=child.attrib[CONCEPT_KEY])
            concept.parent = None
            concept.preflabel = ""
            concept.definition = None
            concept.save()

            self.create_children(concept)

        #raise CommandError('Poll "%s" does not exist' % poll_id)
        #self.stdout.write('Successfully closed poll "%s"' % poll_id)
    def create_children(self, parent):
        return True
