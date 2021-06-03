from django.db import models

# Create your models here.

class Stop (models.Model):
    stop_id = models.CharField(max_length=80)

class Shape (models.Model):
    shape_id = models.CharField(max_length=80)

class ShapePoint (models.Model):
    shape_id = models.ForeignKey(Shape, on_delete=models.CASCADE)
    pt_lon = models.FloatField()
    pt_lat = models.FloatField()
    pt_sequence = models.IntegerField()
    dist_traveled = models.FloatField()
