from django.conf import settings
from django.shortcuts import render
from django.http import JsonResponse
import json

from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET, require_POST
from django.views.decorators.csrf import csrf_exempt

# @login_required(login_url='/admin/login/') # TODO login
@login_required # TODO login
@require_GET
def shapeeditor(request):
    routing_machine_url=''
    extent=''
    center=''

    try:
        routing_machine_url = settings.SHAPEEDITOR_ROUTING_MACHINE_URL
    except:
        routing_machine_url = "null"

    try:
        center = settings.SHAPEEDITOR_MAP_CENTER
    except:
        center = "null"

    try:
        extent = settings.SHAPEEDITOR_MAP_EXTENT_AREA
    except:
        extent = "null"

    context = { # TODO
        "routing_machine_url": routing_machine_url, # TODO
        "extent": extent,
        "center": center
    }

    return render(request, 'shapeeditor/index.html', context)

@login_required # TODO admin only
@require_POST
@csrf_exempt # TODO remove
def push_shapes(request):
    try:
        body = request.body
        data = json.loads(body)

        if 'head' not in data or 'body' not in data:
            return JsonResponse(status=400, data={"message": "Invalid data format"})

        payload = {'head': data['head'], 'body': data['body']}
        #print(json.dumps(payload['body'], indent=4, sort_keys=True))
        print(payload['body'][0]["distances"])

        return JsonResponse(status=200, data={"message": "Web push successful"})
    except TypeError:
        return JsonResponse(status=500, data={"message": "An error occurred"})

@login_required # TODO admin only
@require_POST
@csrf_exempt # TODO remove
def push_stops(request):
    try:
        body = request.body
        data = json.loads(body)

        if 'head' not in data or 'body' not in data:
            return JsonResponse(status=400, data={"message": "Invalid data format"})

        payload = {'head': data['head'], 'body': data['body']}
        print(json.dumps(payload, indent=4, sort_keys=True))

        return JsonResponse(status=200, data={"message": "Web push successful"})
    except TypeError:
        return JsonResponse(status=500, data={"message": "An error occurred"})
