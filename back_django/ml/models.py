from django.db import models
from django.utils import timezone

# Create your models here.

class UserRecommendation(models.Model):
    recommendation_id = models.BigAutoField(primary_key=True)
    user_id = models.BigIntegerField()
    product_id = models.BigIntegerField()
    rank_no = models.IntegerField(null=True)
    score = models.FloatField(null=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "et_user_recommendation"
        managed = False
