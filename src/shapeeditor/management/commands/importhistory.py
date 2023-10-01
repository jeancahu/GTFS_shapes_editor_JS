from django.core.management.base import BaseCommand #, CommandError

class Command(BaseCommand):
    help = "Populate the history table in database with a se_history.txt"

    # The se_history.txt path
    def add_arguments(self, parser):
        parser.add_argument('history_path', nargs='+') # type path?

        # Named (optional) arguments
        parser.add_argument(
            '--clear',
            #action='db_clear_shapes', # TODO
            help='Clear the shape information in database',
        )

    def handle(self, *args, **options):
        if options['clear']:
            db_clear_shapes() # TODO

        self.stdout.write(self.style.SUCCESS(
            'Successfully import from "%s"' % options['history_path'][0]))

    def db_clear_shapes(self): # TODO
        self.stdout.write(self.style.SUCCESS(
            'Successfully clear the database history'))
