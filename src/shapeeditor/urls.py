from django.urls import path

from . import views

urlpatterns = [
    path('', views.shapeeditor, name='shapeeditor'),
    path('push_shapes', views.push_shapes, name='shapeeditor_push_shapes'),
    path('push_stops', views.push_stops, name='shapeeditor_push_stops'),
]
