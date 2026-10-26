import os
import sys
from pathlib import Path

# Add project root and inner Book_Management to sys.path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(BASE_DIR / 'Book_Management'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Book_Management.settings')

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
