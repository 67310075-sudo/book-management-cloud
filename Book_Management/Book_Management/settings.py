"""
Django settings for Book_Management project.
Configured for Lab 9.6 & 9.7 Cloud Deployment (Render + Aiven MySQL + Vercel)
"""

import os
import ssl
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env file if present
load_dotenv(BASE_DIR / '.env')

# Quick-start development settings - unsuitable for production
# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-!(rp_*0j47(0pi6a#proix8+5ns&c_k!=m2!8sgzq_^*tp0fyi')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'False').lower() in ('true', '1', 'yes')

allowed_hosts_env = os.getenv('ALLOWED_HOSTS', '*')
if allowed_hosts_env == '*':
    ALLOWED_HOSTS = ['*']
else:
    ALLOWED_HOSTS = [h.strip() for h in allowed_hosts_env.split(',') if h.strip()]


# Application definition

INSTALLED_APPS = [
    'corsheaders',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'Book_Management',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'Book_Management.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'Book_Management.wsgi.application'


# Database Configuration
# Cloud MySQL (Aiven) auto-detection: if DB_HOST is set, switch to MySQL with SSL
DB_HOST = os.getenv('DB_HOST', 'bookstore-mysql-go-644a.k.aivencloud.com').strip()

if DB_HOST:
    ca_path = os.getenv('DB_SSL_CA', str(BASE_DIR / 'aiven_ca.pem'))
    ssl_options = {}
    ssl_required = os.getenv('DB_SSL_REQUIRED', 'True').lower() in ('true', '1', 'yes')

    if ssl_required:
        ctx = ssl.create_default_context()
        if os.path.exists(ca_path) and os.path.getsize(ca_path) > 50:
            try:
                ctx.load_verify_locations(cafile=ca_path)
            except Exception:
                pass
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        ssl_options['ssl'] = ctx

    port_val = os.getenv('DB_PORT', '21625').strip()
    try:
        db_port = int(port_val)
    except (ValueError, TypeError):
        db_port = 21625

    DATABASES = {
        'default': {
            'ENGINE': os.getenv('DB_ENGINE', 'django.db.backends.mysql'),
            'NAME': os.getenv('DB_NAME', 'defaultdb'),
            'USER': os.getenv('DB_USER', 'avnadmin'),
            'PASSWORD': os.getenv('DB_PASSWORD', '25282528'),
            'HOST': DB_HOST,
            'PORT': db_port,
            'OPTIONS': ssl_options,
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Email Configuration (Lab 9.2 & 9.6 - Compatible with Django 5 & 6)
import django

if django.VERSION[0] >= 6:
    MAILERS = {
        'default': {
            'BACKEND': os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.smtp.EmailBackend'),
            'HOST': os.getenv('EMAIL_HOST', 'smtp.gmail.com'),
            'PORT': int(os.getenv('EMAIL_PORT', '587')),
            'USE_TLS': os.getenv('EMAIL_USE_TLS', 'True').lower() in ('true', '1', 'yes'),
            'USERNAME': os.getenv('EMAIL_HOST_USER', 'rtaxdt@gmail.com'),
            'PASSWORD': os.getenv('EMAIL_HOST_PASSWORD', 'oirjaxwfzkfxysik'),
        }
    }
else:
    EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.smtp.EmailBackend')
    EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
    EMAIL_PORT = int(os.getenv('EMAIL_PORT', '587'))
    EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True').lower() in ('true', '1', 'yes')
    EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', 'rtaxdt@gmail.com')
    EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', 'oirjaxwfzkfxysik')

DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'Book Store <rtaxdt@gmail.com>')


# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'


# CORS configuration
CORS_ALLOW_ALL_ORIGINS = os.getenv('CORS_ALLOW_ALL', 'True').lower() in ('true', '1', 'yes')
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.vercel\.app$",
    r"^https://.*\.onrender\.com$",
    r"^http://localhost:\d+$",
    r"^http://127\.0\.0\.1:\d+$",
]


# Email Configuration
MAILERS = {
    'default': {
        'BACKEND': 'django.core.mail.backends.smtp.EmailBackend',
        'OPTIONS': {
            'host': os.getenv('EMAIL_HOST', 'smtp.gmail.com'),
            'port': int(os.getenv('EMAIL_PORT', 587)),
            'username': os.getenv('EMAIL_HOST_USER', 'rtaxdt@gmail.com'),
            'password': os.getenv('EMAIL_HOST_PASSWORD', 'oirjaxwfzkfxysik'),
            'use_tls': True,
            'use_ssl': False,
            'timeout': 15,
        },
    },
}
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'Book Store <rtaxdt@gmail.com>')


# Django REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'Book_Management.authentication.CustomJWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'EXCEPTION_HANDLER': 'Book_Management.exceptions.custom_exception_handler',
}


# Simple JWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'SIGNING_KEY': os.getenv('JWT_SECRET', 'my_bookstore_secret'),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'id',
}
