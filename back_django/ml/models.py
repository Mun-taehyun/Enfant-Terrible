from django.db import models

# 1. 추천 결과 저장 테이블
class UserRecommendation(models.Model):
    """
    스키마: recommendation_id(PK), user_id, product_id, rank_no, score, created_at
    """
    recommendation_id = models.BigAutoField(primary_key=True)
    user_id = models.BigIntegerField()
    product_id = models.BigIntegerField()
    rank_no = models.IntegerField(null=True, blank=True)
    score = models.FloatField(null=True, blank=True)
    # 덤프 스키마의 DEFAULT CURRENT_TIMESTAMP 반영
    created_at = models.DateTimeField(auto_now_add=True) 

    class Meta:
        db_table = "et_user_recommendation"
        managed = False  # 실제 DB 테이블이 존재하므로 Django가 관리하지 않음


# 2. 상품 마스터 테이블
class Product(models.Model):
    """
    스키마: product_id(PK), category_id(FK), product_code, name, status, base_price, 
           description, average_rating, review_count, created_at, updated_at, deleted_at
    """
    product_id = models.BigAutoField(primary_key=True)
    category_id = models.BigIntegerField() # 실제로는 ForeignKey이나 managed=False이므로 ID로 취급 가능
    product_code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    
    # Enum 형태의 status (ON_SALE, OUT_OF_STOCK, HIDE 등)
    status = models.CharField(max_length=20, default='ON_SALE') 
    base_price = models.IntegerField()
    description = models.TextField(null=True, blank=True)
    
    # 캐시 컬럼: 스키마상 타입에 맞춰 FloatField 또는 DecimalField 사용 (덤프는 float/double 기준)
    average_rating = models.FloatField(default=0.0)
    review_count = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # 최신 스키마의 핵심 필드
    deleted_at = models.DateTimeField(null=True, blank=True) 

    class Meta:
        db_table = "et_product"
        managed = False


# 3. 유저 테이블
class User(models.Model):
    """
    스키마: user_id(PK), email, password, name, role, status, created_at, updated_at, deleted_at
    """
    user_id = models.BigAutoField(primary_key=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255) # 덤프에 password 필드 존재함
    name = models.CharField(max_length=100)
    
    # role: 'USER', 'ADMIN' 등
    role = models.CharField(max_length=20, default='USER')
    # status: 'ACTIVE', 'INACTIVE', 'BANNED' 등
    status = models.CharField(max_length=20, default='ACTIVE')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "et_user"
        managed = False