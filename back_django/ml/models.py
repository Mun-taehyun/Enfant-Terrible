from django.db import models

# 1. 유저 테이블
class User(models.Model):
    user_id = models.BigAutoField(primary_key=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=20, default='USER')
    status = models.CharField(max_length=20, default='ACTIVE')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "et_user"
        managed = False

    def __str__(self):
        return f"{self.name} ({self.email})"


# 2. 상품 마스터 테이블
class Product(models.Model):
    product_id = models.BigAutoField(primary_key=True)
    # 실제 DB에는 category_id라는 BIGINT 컬럼이 있으므로 그대로 유지하거나 
    # 나중에 Category 모델을 만들면 ForeignKey로 변경 가능합니다.
    category_id = models.BigIntegerField() 
    product_code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    status = models.CharField(max_length=20, default='ON_SALE') 
    base_price = models.IntegerField()
    description = models.TextField(null=True, blank=True)
    average_rating = models.FloatField(default=0.0)
    review_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "et_product"
        managed = False

    def __str__(self):
        return self.name


# 3. 추천 결과 저장 테이블
class UserRecommendation(models.Model):
    recommendation_id = models.BigAutoField(primary_key=True)
    
    # [수정] 단순 ID 보다는 ForeignKey로 설정하면 추천 API 작성이 매우 편해집니다.
    # db_column을 지정하면 기존 BIGINT 컬럼과 완벽히 매핑됩니다.
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, db_column='user_id', related_name='recommendations'
    )
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, db_column='product_id', related_name='recommended_to'
    )
    
    rank_no = models.IntegerField(null=True, blank=True)
    score = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True) 

    class Meta:
        db_table = "et_user_recommendation"
        managed = False
        ordering = ['rank_no'] # 기본 정렬을 순위순으로 설정