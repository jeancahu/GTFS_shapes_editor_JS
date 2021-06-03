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
    context = { # TODO
        "router_machine_url": settings.SHAPEEDITOR_ROUTING_MACHINE_URL,
        "extent": settings.SHAPEEDITOR_MAP_EXTENT_AREA
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
        print(json.dumps(payload, indent=4, sort_keys=True))

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
