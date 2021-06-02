from django.conf import settings
from django.shortcuts import render
from django.contrib.auth.decorators import login_required

# @login_required(login_url='/admin/login/') # TODO login
@login_required() # TODO login
def shapeeditor(request):

    if request.method == 'GET':
        print('method GET')

    context = { # TODO
        "router_machine_url": settings.SHAPEEDITOR_ROUTING_MACHINE_URL,
        "extent": settings.SHAPEEDITOR_MAP_EXTENT_AREA
    }

    return render(request, 'shapeeditor/index.html', context)
