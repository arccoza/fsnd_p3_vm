#!/usr/bin/python
# REF: http://flask.pocoo.org/docs/0.12/deploying/mod_wsgi/
import sys
import logging
import os
sys.path.insert(0, '/var/www/fsnd_p4_catalog/')
sys.path.insert(1, '/var/www/fsnd_p4_catalog/lib/')
logging.basicConfig(stream=sys.stderr)
logging.warn('OVER HERE ---------------> ' + os.getcwd())

# This import must happen here, after the sys.path updates.
from app import app as application
