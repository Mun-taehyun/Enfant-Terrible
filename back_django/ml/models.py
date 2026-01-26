from django.db import models

# 1. 유저 테이블 (KOSMO 프로젝트 전용 반려동물 프로필)
class User(models.Model):
    user_id = models.BigAutoField(primary_key=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=20, default='USER')
    status = models.CharField(max_length=20, default='ACTIVE')
    
    # --- 하이브리드 추천 필드: Seeding 스크립트와 매칭됨 ---
    pet_type = models.CharField(max_length=50, null=True, blank=True) # 강아지, 고양이, 관상어 등
    dog_age = models.IntegerField(default=0)      # 0:신생, 1:성견, 2:노견
    dog_size = models.IntegerField(default=0)     # 0:소형, 1:중형, 2:대형
    activity_level = models.IntegerField(default=1) # 1~3 활동량
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "et_user"
        managed = False # 실제 DB인 kosmo의 et_user 테이블 사용

    def __str__(self):
        return f"{self.name} ({self.email})"


# 2. 상품 마스터 테이블 (사료/장난감 등 타겟 속성 포함)
class Product(models.Model):
    product_id = models.BigAutoField(primary_key=True)
    # 카테고리와의 관계 (필요 시 Category 모델로 변경 가능)
    category_id = models.BigIntegerField() 
    product_code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    status = models.CharField(max_length=20, default='ON_SALE') 
    base_price = models.IntegerField()
    description = models.TextField(null=True, blank=True)
    average_rating = models.FloatField(default=0.0)
    review_count = models.IntegerField(default=0)

    # --- 하이브리드 추천 타겟 필드 ---
    target_age = models.IntegerField(default=0)
    target_size = models.IntegerField(default=0)
    target_gender = models.IntegerField(default=0)
    target_activity = models.IntegerField(default=1)

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
    
    # ForeignKey를 통해 User와 Product 객체에 직접 접근 가능
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, db_column='user_id', related_name='kosmo_recommendations'
    )
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, db_column='product_id', related_name='kosmo_recommended_to'
    )
    
    rank_no = models.IntegerField(null=True, blank=True)
    score = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True) 

    class Meta:
        db_table = "et_user_recommendation"
        managed = False
        ordering = ['rank_no']