# ml/models.py

from django.db import models


class UserRecommendation(models.Model):
    recommendation_id = models.BigAutoField(primary_key=True)
    user_id = models.BigIntegerField()
    product_id = models.BigIntegerField()
    rank_no = models.IntegerField(null=True)
    score = models.FloatField(null=True)
    created_at = models.DateTimeField()

    class Meta:
        db_table = "et_user_recommendation"
        managed = False
