from pathlib import Path
from decouple import config

from .config_values import *

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config("SECRET_KEY")  # Retrieves the secret key from environment variables

# Flag to determine if the environment is production (1) or not (0)
PRODUCTION = int(config("LOGBOOK_MANAGER_IS_PRODUCTION", default=1))

# Production settings
if PRODUCTION:
    from .production import *  # Import production-specific settings
# Development settings
else:
    from .dev import *  # Import development-specific settings

CORS_ALLOW_CREDENTIALS = True  # Allows cookies to be included in cross-origin requests


# Application definition

INSTALLED_APPS = [
    # Default Django apps
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party apps
    "corsheaders",  # Handles Cross-Origin Resource Sharing
    "rest_framework",  # Django REST framework for building APIs
    # Custom apps
    "core",  # Core app
    "users",  # Users app (custom user model)
    "logbook",  # Logbook app
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",  # Handles security-related operations
    "django.contrib.sessions.middleware.SessionMiddleware",  # Manages sessions
    "corsheaders.middleware.CorsMiddleware",  # Manages CORS headers
    "django.middleware.common.CommonMiddleware",  # Handles common HTTP operations
    "django.middleware.csrf.CsrfViewMiddleware",  # Protects against Cross-Site Request Forgery
    "django.contrib.auth.middleware.AuthenticationMiddleware",  # Manages authentication
    "django.contrib.messages.middleware.MessageMiddleware",  # Manages messaging framework
    "django.middleware.clickjacking.XFrameOptionsMiddleware",  # Prevents clickjacking
]

ROOT_URLCONF = "logbook_manager.urls"  # Root URL configuration for the project

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",  # Template engine backend
        "DIRS": [BASE_DIR / "build", BASE_DIR / "templates"],  # Template directories
        "APP_DIRS": True,  # Enables loading templates from app directories
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",  # Context for debugging
                "django.template.context_processors.request",  # Context for request
                "django.contrib.auth.context_processors.auth",  # Context for authentication
                "django.contrib.messages.context_processors.messages",  # Context for messages
            ],
        },
    },
]

WSGI_APPLICATION = "logbook_manager.wsgi.application"  # WSGI application for deployment


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",  # PostgreSQL database engine
        "NAME": config("DB_NAME_LOGBOOK_MANAGER"),  # Database name from environment variables
        "USER": config("DB_USER"),  # Database user from environment variables
        "PASSWORD": config("DB_USER_PASSWORD"),  # Database password from environment variables
        "HOST": config("DB_HOST"),  # Database host from environment variables
    }
}

# Custom user model for the application
AUTH_USER_MODEL = "users.User"

# REST Framework settings
REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),  # Requires authentication for API access
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework.authentication.SessionAuthentication",
    ),  # Uses session authentication
}

# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",  # Validates user attribute similarity
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",  # Validates minimum password length
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",  # Validates against common passwords
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",  # Validates against numeric passwords
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = "en-us"  # Sets the default language to English (US)

TIME_ZONE = "Africa/Nairobi"  # Sets the default timezone to Nairobi

USE_I18N = True  # Enables internationalization

USE_TZ = True  # Enables timezone-aware datetimes


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

STATIC_URL = "static/"  # URL for serving static files

STATICFILES_DIRS = [BASE_DIR / "build/static"]  # Directories for static files in the build folder
STATIC_ROOT = BASE_DIR / "static"  # Directory for collecting static files during deployment

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"  # Sets the default primary key type to BigAutoField

SESSION_COOKIE_SECURE = True  # Ensures the session cookie is only sent over HTTPS
CSRF_COOKIE_SECURE = True  # Ensures the CSRF cookie is only sent over HTTPS

SECURE_HSTS_SECONDS = 31536000  # 1 year of Strict-Transport-Security headers
SECURE_HSTS_INCLUDE_SUBDOMAINS = True  # Applies HSTS to all subdomains
SECURE_HSTS_PRELOAD = True  # Allows the site to be included in the HSTS preload list

# Content Security Policy (CSP) settings to enhance security
CSP_DEFAULT_SRC = ["'self'"]
CSP_FRAME_SRC = ["'self'"]
CSP_STYLE_SRC = [
    "'self'",
    "https://unpkg.com",
    "https://fonts.googleapis.com",
    "https://cdn.jsdelivr.net",
    "'unsafe-inline'",
]
CSP_SCRIPT_SRC = ["'self'", "https://unpkg.com", "blob:", "https://cdn.jsdelivr.net", "'unsafe-inline'"]
CSP_FONT_SRC = [
    "'self'",
    "https://fonts.gstatic.com",
    "https://unpkg.com",
    "https://cdn.jsdelivr.net",
]  # Added for fonts loading

SESSION_COOKIE_SAMESITE = "Strict"  # Enforces SameSite attribute for session cookies
CSRF_COOKIE_SAMESITE = "Strict"  # Enforces SameSite attribute for CSRF cookies
