from pathlib import Path
import os
import base64
import binascii
from urllib.parse import urlparse
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
# .env 파일 로드
load_dotenv(BASE_DIR.parent / '.env')

# 분석 데이터 경로
AI_ANALYSIS_DIR = BASE_DIR.parent / "ai_analysis"
PROCESSED_DIR = AI_ANALYSIS_DIR / "data" / "processed"
SERVICE_READY_CSV = PROCESSED_DIR / "service_ready_data.csv"

_et_log_dir = os.getenv("ET_LOG_DIR", "").strip()
if _et_log_dir:
    LOG_DIR = Path(_et_log_dir).expanduser().resolve()
else:
    LOG_DIR = BASE_DIR.parent / "logs"

SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-fallback-key')
DEBUG = os.getenv('DJANGO_DEBUG', 'false').strip().lower() in ('1', 'true', 'yes', 'y', 'on')
ALLOWED_HOSTS = [
    'web.filmal.dev',
    'localhost',
    '127.0.0.1',
]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'ml',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'https://web.filmal.dev',
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'], 
        'APP_DIRS': True,                
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# 데이터베이스 설정
_db_url = os.getenv('DB_URL', '')
_db_username = os.getenv('DB_USERNAME', '')
_db_user = os.getenv('DB_USER', 'enfant')
_db_password = os.getenv('DB_PASSWORD', 'enfant')
_db_host = os.getenv('DB_HOST', 'mysql.filmal.dev')
_db_port = os.getenv('DB_PORT', '3307')
_db_name = os.getenv('DB_NAME', 'enfant')

if _db_url:
    try:
        _normalized = _db_url.strip()
        _normalized = _normalized.replace('jdbc:mysql://jdbc:mysql://', 'jdbc:mysql://')
        if _normalized.startswith('jdbc:'):
            _normalized = _normalized[len('jdbc:'):]
        parsed = urlparse(_normalized)
        if parsed.hostname:
            _db_host = parsed.hostname
        if parsed.port:
            _db_port = str(parsed.port)
        if parsed.path and parsed.path != '/':
            _db_name = parsed.path.lstrip('/')
    except Exception:
        pass

DATABASES = {
    'default': {
        'ENGINE': os.getenv('DB_ENGINE', 'django.db.backends.mysql'),
        'NAME': _db_name,
        'USER': (_db_username or _db_user),
        'PASSWORD': _db_password,
        'HOST': _db_host,
        'PORT': _db_port,
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            'charset': 'utf8mb4',
            'connect_timeout': 30,
        },
    }
}

# JWT 설정
JWT_ALGORITHM = "HS256"
JWT_SECRET_B64 = os.getenv("JWT_SECRET_B64", "")
try:
    JWT_SECRET = base64.b64decode(JWT_SECRET_B64)
except Exception:
    JWT_SECRET = b'temporary-secret-key'

LANGUAGE_CODE = 'ko-kr'
TIME_ZONE = 'Asia/Seoul'
USE_I18N = True
USE_TZ = True
STATIC_URL = 'static/'
STATIC_ROOT = '/app/static'

# 미디어 파일 설정 (이미지 업로드 등 대비)
MEDIA_URL = '/media/'
MEDIA_ROOT = '/app/uploads'