from django.db import models

# Create your models here.

class User(models.Model) :
    user_id = models.AutoField(primary_key=True)        # 기준점

    class Meta :
        db_table = "et_user"
        managed = False # db 관리하지 않는다

class Product(models.Model):
    product_id = models.AutoField(primary_key=True)
    product_name = models.CharField(max_length=255)      
    status = models.CharField(max_length=50, null=True)
    deleted_at = models.DateTimeField(null=True)

    class Meta:
        db_table = "et_product"
        managed = False


class UserRecommendation(models.Model):
    recommendation_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, db_column="user_id", on_delete=models.DO_NOTHING)       
    product = models.ForeignKey(Product, db_column="product_id",on_delete=models.DO_NOTHING)
    rank = models.IntegerField(null=True)
    score = models.FloatField(null=True)
    generated_at = models.DateTimeField()

    class Meta :
        db_table = "et_user_recommendation"
        managed = False