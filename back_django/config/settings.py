from pathlib import Path
import os
import base64
from dotenv import load_dotenv

# 1. 경로 설정
BASE_DIR = Path(__file__).resolve().parent.parent
# .env 파일 로드 (부모 디렉토리의 .env 확인)
load_dotenv(BASE_DIR.parent / '.env')

# 분석 데이터 및 서비스용 CSV 경로
AI_ANALYSIS_DIR = BASE_DIR.parent / "ai_analysis"
PROCESSED_DIR = AI_ANALYSIS_DIR / "data" / "processed"
SERVICE_READY_CSV = PROCESSED_DIR / "service_ready_data.csv"

# [추가] 분석 폴더 자동 생성 (서버 가동 시 에러 방지)
os.makedirs(PROCESSED_DIR, exist_ok=True)

# 2. 보안 및 디버그 설정
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-fallback-key')
DEBUG = True
ALLOWED_HOSTS = ['*']

# 3. 앱 설정
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',  # CORS 처리를 위해 상단 배치
    'ml',           # 추천 엔진 앱
]

# 4. 미들웨어 설정
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # 가장 상단 권장
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

# 5. 템플릿 설정 (admin 및 ml 앱 템플릿 연동)
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

# 6. 데이터베이스 설정 (enfant 님의 MySQL 정보 반영)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.getenv('DB_NAME', 'kosmo'),
        'USER': os.getenv('DB_USER', 'kosmo'),  # 유저 ID: enfant (env 미설정 시 대비)
        'PASSWORD': os.getenv('DB_PASSWORD', '1234'),
        'HOST': os.getenv('DB_HOST', '127.0.0.1'),
        'PORT': os.getenv('DB_PORT', '3306'),
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            'charset': 'utf8mb4',
        },
    }
}

# 7. JWT 및 인증 설정
JWT_ALGORITHM = "HS256"
JWT_SECRET_B64 = os.getenv("JWT_SECRET_B64", "")
try:
    JWT_SECRET = base64.b64decode(JWT_SECRET_B64)
except Exception:
    # 디코딩 실패 시 fallback (개발 환경용)
    JWT_SECRET = b'temporary-secret-key-for-development'

# 8. CORS 설정 (다른 팀원 프론트엔드 연동용)
CORS_ALLOW_ALL_ORIGINS = True 
CORS_ALLOW_CREDENTIALS = True

# 9. 국제화 및 시간대 설정
LANGUAGE_CODE = 'ko-kr'
TIME_ZONE = 'Asia/Seoul'
USE_I18N = True
USE_TZ = True  # DB 저장 시 UTC 기준 유지 (필요 시 False로 변경 가능)

# 10. 정적 및 미디어 파일 설정
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# 기본 PK 타입 설정
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'