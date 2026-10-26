# -*- coding: utf-8 -*-
import os
import sys

# Ensure Book_Management folder is in python path
root_dir = os.path.dirname(os.path.abspath(__file__))
book_mgmt_dir = os.path.join(root_dir, 'Book_Management')
if os.path.exists(book_mgmt_dir):
    sys.path.insert(0, book_mgmt_dir)
sys.path.insert(0, root_dir)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Book_Management.settings')

import django
django.setup()

from Book_Management.models import Books, User
import bcrypt

def seed_users():
    print("=" * 60)
    print(" [SEEDING USERS FOR LAB 9.5 / 9.6 / 9.7]")
    print("=" * 60)

    raw_password = "123456"
    hashed_password = bcrypt.hashpw(raw_password.encode('utf-8'), bcrypt.gensalt(10)).decode('utf-8')
    print(f"Generated bcrypt hash ({len(hashed_password)} chars): {hashed_password[:20]}...")

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

    for item in users_data:
        user, created = User.objects.update_or_create(
            email=item["email"],
            defaults=item
        )
        status_text = "CREATED" if created else "UPDATED"
        print(f" -> [{status_text}] ID: {user.id} | Email: {user.email:<18} | Role: {user.role:<8} | Verified: {user.is_verified}")

    print(f"Total users in DB: {User.objects.count()}\n")


def seed_books():
    print("=" * 60)
    print(" [SEEDING SAMPLE BOOKS]")
    print("=" * 60)

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
            "author": "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
            "price": 590.00,
            "stock": 8,
            "category": "Architecture"
        },
        {
            "title": "Learning Python (5th Edition)",
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

    for item in books_data:
        book, created = Books.objects.update_or_create(
            title=item["title"],
            defaults=item
        )
        status_text = "CREATED" if created else "UPDATED"
        print(f" -> [{status_text}] ID: {book.id:<2} | {book.title[:35]:<35} | {book.price} THB | Stock: {book.stock}")

    print(f"Total books in DB: {Books.objects.count()}\n")


if __name__ == '__main__':
    seed_users()
    seed_books()
    print(" Seeding completed successfully!")
