# -*- coding: utf-8 -*-
"""
Database Seeding Script for Lab 9.5 & Lab 9.6 / 9.7
Seeds 4 test users with bcrypt hashed passwords ('123456') and 5 sample books.
"""

import os
import sys
import django
import bcrypt

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Book_Management.settings')
django.setup()

from Book_Management.models import Books, User

def run_seed():
    raw_password = "123456"
    hashed_password = bcrypt.hashpw(raw_password.encode('utf-8'), bcrypt.gensalt(10)).decode('utf-8')

    users_data = [
        {
            "name": "User A (Viewer)",
            "email": "usera@test.com",
            "password": hashed_password,
            "role": "viewer",
            "is_verified": True,
            "verification_token": None
        },
        {
            "name": "User B (Editor)",
            "email": "userb@test.com",
            "password": hashed_password,
            "role": "editor",
            "is_verified": True,
            "verification_token": None
        },
        {
            "name": "User C (Admin)",
            "email": "userc@test.com",
            "password": hashed_password,
            "role": "admin",
            "is_verified": True,
            "verification_token": None
        },
        {
            "name": "Manager",
            "email": "manager@test.com",
            "password": hashed_password,
            "role": "manager",
            "is_verified": True,
            "verification_token": None
        },
    ]

    print("--- Seeding Users (Lab 9.5 & 9.6) ---")
    for item in users_data:
        user, created = User.objects.update_or_create(
            email=item["email"],
            defaults=item
        )
        tag = "CREATED" if created else "UPDATED"
        print(f"[{tag}] {user.email} | Role: {user.role} | Verified: {user.is_verified}")

    books_data = [
        {
            "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
            "author": "Robert C. Martin",
            "price": 450.00,
            "stock": 15,
            "category": "Programming"
        },
        {
            "title": "The Pragmatic Programmer: Your Journey To Mastery",
            "author": "David Thomas & Andrew Hunt",
            "price": 520.00,
            "stock": 10,
            "category": "Software Engineering"
        },
        {
            "title": "Design Patterns: Elements of Reusable Object-Oriented Software",
            "author": "Erich Gamma et al.",
            "price": 590.00,
            "stock": 8,
            "category": "Architecture"
        },
        {
            "title": "Learning Python, 5th Edition",
            "author": "Mark Lutz",
            "price": 650.00,
            "stock": 12,
            "category": "Python"
        },
        {
            "title": "Building Microservices: Designing Fine-Grained Systems",
            "author": "Sam Newman",
            "price": 480.00,
            "stock": 20,
            "category": "Cloud Computing"
        }
    ]

    print("\n--- Seeding Books ---")
    for item in books_data:
        book, created = Books.objects.update_or_create(
            title=item["title"],
            defaults=item
        )
        tag = "CREATED" if created else "UPDATED"
        print(f"[{tag}] #{book.id} {book.title} | {book.price} THB")

    print(f"\nCompleted! Users count: {User.objects.count()}, Books count: {Books.objects.count()}")

if __name__ == '__main__':
    run_seed()
