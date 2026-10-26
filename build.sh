#!/usr/bin/env bash
set -o errexit

if [ -f "requirements.txt" ]; then
  pip install -r requirements.txt
elif [ -f "Book_Management/requirements.txt" ]; then
  pip install -r Book_Management/requirements.txt
fi

if [ -f "manage.py" ]; then
  python manage.py collectstatic --noinput
  python manage.py migrate
  if [ -f "seed_cloud_db.py" ]; then
    python seed_cloud_db.py
  fi
elif [ -f "Book_Management/manage.py" ]; then
  python Book_Management/manage.py collectstatic --noinput
  python Book_Management/manage.py migrate
  if [ -f "Book_Management/seed_cloud_db.py" ]; then
    python Book_Management/seed_cloud_db.py
  fi
fi
