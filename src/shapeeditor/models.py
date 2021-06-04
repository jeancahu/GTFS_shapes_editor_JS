from django.db import models

# Create your models here.

def default_stop_line(): # TODO
    return {'id': [], 'points': [], 'distances': []}

def default_shape_line():
    return {'id': [], 'points': [], 'distances': []}

# models

class Stop (models.Model):
    stop_id = models.CharField(
        primary_key=True,  # This makes the id unique in database
        db_index=True,
        max_length=80)

    lines = models.JSONField(default=default_stop_line) # TODO replace with multiple fields

    def __str__(self):
        return self.stop_id

class Shape (models.Model):
    shape_id = models.CharField(
        primary_key=True, # This makes the id unique in database
        db_index=True,
        max_length=80)

    lines = models.JSONField(default=default_shape_line)

    def __str__(self):
        return self.shape_id
