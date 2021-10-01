from django.contrib import admin
from .models import History, Shape, Stop
from django.urls import reverse

# Register your models here.

@admin.register(History)
class SEHistory(admin.ModelAdmin):
    list_display = ('pk', 'history_id', 'history_date')
    list_display_links = ('history_id',)
    ordering = ('-pk',)
    search_fields = ('history_id', 'history_date')
    fieldsets = (
          ('History Information', {
              'description':
              "History saved in data base from Shapeeditor, \
              click on \"view on site\" to edit from this version",
              'fields': ('history_id',),
          }),
     )
    def view_on_site(self, obj):
        url = reverse('shapeeditor', kwargs={'history_id': obj.pk})
        return url

@admin.register(Shape)
class SEShape(admin.ModelAdmin):
    pass

@admin.register(Stop)
class SEStop(admin.ModelAdmin):
    pass
