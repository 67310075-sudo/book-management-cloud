# Outer Book_Management package initialization
import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
inner_app = os.path.join(BASE_DIR, 'Book_Management')
if inner_app not in sys.path:
    sys.path.insert(0, inner_app)
