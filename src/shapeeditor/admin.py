from django.contrib import admin
from .models import History

# Register your models here.

@admin.register(History)
class SEHistory(admin.ModelAdmin):
    pass
