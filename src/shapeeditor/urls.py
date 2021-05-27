from django.urls import path

from . import views

urlpatterns = [
    path('', views.shapeeditor, name='shapeeditor')
]
