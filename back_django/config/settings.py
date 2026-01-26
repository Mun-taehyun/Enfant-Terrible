from pathlib import Path
import os
import base64
import binascii
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
# .env 파일 로드
load_dotenv(BASE_DIR.parent / '.env')

# 분석 데이터 경로
AI_ANALYSIS_DIR = BASE_DIR.parent / "ai_analysis"
PROCESSED_DIR = AI_ANALYSIS_DIR / "data" / "processed"
SERVICE_READY_CSV = PROCESSED_DIR / "service_ready_data.csv"

SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-fallback-key')
DEBUG = True
ALLOWED_HOSTS = ['*']

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

ROOT_URLCONF = 'config.urls'

# --- [수정 포인트] TEMPLATES 설정 추가 (admin.E403 에러 해결) ---
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'], # 프로젝트 수준의 템플릿 폴더
        'APP_DIRS': True,                # 각 앱(ml 등) 폴더 내 templates 검색 허용
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
DATABASES = {
    'default': {
        'ENGINE': os.getenv('DB_ENGINE', 'django.db.backends.mysql'),
        'NAME': os.getenv('DB_NAME', 'kosmo'),
        'USER': os.getenv('DB_USER', 'kosmo'),
        'PASSWORD': os.getenv('DB_PASSWORD', '1234'),
        'HOST': os.getenv('DB_HOST', '127.0.0.1'),
        'PORT': os.getenv('DB_PORT', '3306'),
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            'charset': 'utf8mb4',
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

# 미디어 파일 설정 (이미지 업로드 등 대비)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'