from django.contrib import admin
from .models import History, Shape, Stop

# Register your models here.

@admin.register(History)
class SEHistory(admin.ModelAdmin):
    pass

@admin.register(Shape)
class SEShape(admin.ModelAdmin):
    pass

@admin.register(Stop)
class SEStop(admin.ModelAdmin):
    pass
