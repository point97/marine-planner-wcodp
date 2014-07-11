from django.core.management.base import BaseCommand, CommandError
from ontology.models import RDFConcept

class Command(BaseCommand):
    args = '<rdf_url>'
    help = 'Syncs the RDF specified at the given url to the local database.'

    def handle(self, *args, **options):
        # I'm pretty sure this is all in a transaction...
        RDFConcept.objects.all().delete()
        request_uri = args[0]
        import ipdb; ipdb.set_trace()
        "asdf"
            #raise CommandError('Poll "%s" does not exist' % poll_id)
            #self.stdout.write('Successfully closed poll "%s"' % poll_id)
