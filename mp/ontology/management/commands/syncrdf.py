from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from ontology.models import RDFConcept
from ontology.utils import get_filters
from lxml import etree
import requests

CONCEPT_TAG = '{http://www.w3.org/2004/02/skos/core#}Concept'
CONCEPT_KEY = '{http://www.w3.org/1999/02/22-rdf-syntax-ns#}about'
PREFLABEL_TAG = '{http://www.w3.org/2004/02/skos/core#}prefLabel'
DEFINITION_TAG = '{http://www.w3.org/2004/02/skos/core#}definition'
NARROWER_TAG = '{http://www.w3.org/2004/02/skos/core#}narrower'

class Command(BaseCommand):
    args = ''
    help = 'Syncs the RDFConcepts from settings.MP_ONTOLOGY_URL to the database.'

    def handle(self, *args, **options):
        target_url = settings.MP_ONTOLOGY_URL

        if target_url is None or len(target_url) == 0:
            raise CommandError('You need to specify an MP_ONTOLOGY_URL in settings.')

        print "Fetching debris slugs..."
        debris_general = get_filters()
        self.debris_json = debris_general.json()['fields']

        print "Fetching ontology..."
        resp = requests.get(target_url)
        if resp.status_code != 200:
            raise CommandError("Could not contact ontology url.")

        # Parse the concept hierarchy with lxml
        parsed = etree.fromstring(resp.content)

        RDFConcept.objects.all().delete()
        for child in parsed.getchildren():
            self.create_concept(child)

        #raise CommandError('Poll "%s" does not exist' % poll_id)
        self.stdout.write('Successfully updated concepts.')

    def create_concept(self, dom_element, parent=None):
        if dom_element.tag != CONCEPT_TAG:
            raise ValueError("Found a child of root that wasn't a concept: {0}".format(dom_element.tag))

        uri = dom_element.attrib[CONCEPT_KEY]
        concept = RDFConcept.objects.create(uri=uri)
        concept.parent = parent
        concept.preflabel = ""
        concept.definition = None
        concept.save()

        self.create_children(concept, dom_element)

    def create_children(self, parent_concept, parent_dom_node):
        for child in parent_dom_node.getchildren():
            if child.tag == PREFLABEL_TAG:
                # This will give us 'Cat_Toxic' vs. 'Toxic':
                split_uri = parent_concept.uri.split("/")[-1]
                # Attempt to reconcile debris-specific slugs with names from the ontology:
                debris_json_matches = [x for x in self.debris_json if split_uri == x['slug']]
                if len(debris_json_matches) == 1:
                    parent_concept.slug = debris_json_matches[0]['slug']

                # We need to differentiate between the e.g. Paper category and the Paper item
                if 'concept/Cat_' in parent_concept.uri:
                    parent_concept.preflabel = "{0} Category".format(child.text)
                else:
                    parent_concept.preflabel = child.text

                parent_concept.save()
            elif child.tag == DEFINITION_TAG:
                # This is the 'description'. Not all tags have it.
                parent_concept.definition = child.text
                parent_concept.save()
            elif child.tag == NARROWER_TAG:
                # Recursively create new concepts
                [self.create_concept(child_of_narrower, parent_concept) for
                        child_of_narrower in child.getchildren()]
