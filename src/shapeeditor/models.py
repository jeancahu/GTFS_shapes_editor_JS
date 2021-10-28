# from django.db import models
from django.contrib.gis.db import models
from django.contrib.gis.geos import LineString

# Managers
class shapeManager (models.Manager):
    def getDistances (self, shape_id):
        [shape] = super().get_queryset().filter(
            shape_id=shape_id
        )

        integral_distance = [0]
        for coor_a, coor_b in zip(shape.linestring.array[1:], shape.linestring.array[:-1]):
            integral_distance.append( # TODO Fix linear distance using spherical and km FIXME
                integral_distance[-1] +
                LineString((coor_a, coor_b)).length
            )

        print(len(integral_distance))
        print(len(shape.lines["distances"]))
        return integral_distance

# Create your models here.
def default_linestring(): # TODO
    return LineString()

def default_empty_json(): # TODO
    return {}

def default_stop_line(): # TODO
    return {'id': [], 'points': [], 'distances': []}

def default_shape_line():
    return {'id': [], 'points': [], 'distances': []}

# models

class History (models.Model):
    """
    Commands succession to reach a desired state in the editor frontend
    """
    history_id = models.CharField(
        max_length=80)

    history_date =  models.DateTimeField(
        # Time and date the history was upload
        auto_now_add = True,
        editable = False,
        blank = False
    )

    history_json = models.JSONField( # TODO: add default
        blank = False,
        editable = False
    )

    class Meta:
        verbose_name = "History"
        verbose_name_plural = "Histories"

    def __str__(self):
        return '{} - {} ({})'.format(
            self.pk,
            self.history_id,
            self.history_date.strftime("%Y-%m-%d"))

class Stop (models.Model):
    """
    Stop, a node near some waypoint in the shape
    """
    stop_id = models.CharField(
        primary_key=True,  # This makes the id unique in database
        db_index=True,
        max_length=80)

    lines = models.JSONField(default=default_stop_line) # TODO replace with multiple fields

    def __str__(self):
        return self.stop_id

class Shape (models.Model):
    """
    Shape, has a unique ID type string, it has an array of geocoordinates and equivalent
    1:1 array integral distance (distance from first endpoint)
    """
    objects = shapeManager()

    shape_id = models.CharField(
        primary_key=True, # This makes the id unique in database
        db_index=True,
        max_length=80)

    lines = models.JSONField(
        default=default_shape_line,
        editable = False
    )

    linestring = models.LineStringField(default=default_linestring)

    def __str__(self):
        return self.shape_id
