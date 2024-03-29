from django.conf import settings
from django.shortcuts import render
from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist
import json

from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET, require_POST

from .models import History, Shape, Stop
from .__version__ import __version__ as se_version

# @login_required(login_url='/admin/login/') # TODO login
@login_required # TODO login
@require_GET
def shapeeditor(request, history_id='no_history'):
    routing_machine_url=''
    extent=''
    center=''

    try:
        routing_machine_url = settings.SHAPEEDITOR_ROUTING_MACHINE_URL
    except:
        routing_machine_url = "http://router.project-osrm.org/route/v1/driving/"

    try:
        center = settings.SHAPEEDITOR_MAP_CENTER
    except:
        center = "null"

    try:
        temp = settings.SHAPEEDITOR_MAP_EXTENT_AREA
        extent = [
            # Resolve the order for points,
            # first point is the lesser in both coordinates
            # second point is the greater in both coordinates
            [temp[0][0] if temp[0][0] < temp[1][0] else temp[1][0],
             temp[0][1] if temp[0][1] < temp[1][1] else temp[1][1]],
            [temp[0][0] if temp[0][0] > temp[1][0] else temp[1][0],
             temp[0][1] if temp[0][1] > temp[1][1] else temp[1][1]],
        ]
    except:
        extent = "null"

    if history_id == 'no_history':
        history = 'undefined'
    elif history_id == 0:
        try:
            history = json.dumps(History.objects.last().history_json)
        except:
            history = 'undefined'
    else: # History from data base:
        try:
            history = json.dumps(History.objects.get(pk=history_id).history_json)
        except:
            history = 'undefined'

    context = { # TODO
        "routing_machine_url": routing_machine_url, # TODO
        "extent": extent,
        "center": center,
        "history": history,
        "se_version": se_version
    }

    return render(request, 'shapeeditor/index.html', context)

@login_required # TODO admin only
@require_POST
def push_shapes(request):
    try:
        body = request.body
        data = json.loads(body)

        if 'head' not in data or 'body' not in data:
            if 'points' not in data['body'] or 'distances' not in data['body'] or 'id' not in data['body']:
                return JsonResponse(status=400, data={"message": "Invalid data format"})

        shapes = []
        for item in data["body"]: # for each shape
            shapes.append(Shape(
                shape_id = item['id'],
                lines = item
            ))
        Shape.objects.all().delete()
        Shape.objects.bulk_create(shapes)

        return JsonResponse(status=200, data={"message": "Web push successful"})
    except TypeError:
        return JsonResponse(status=500, data={"message": "An error occurred"})

@login_required # TODO admin only
@require_POST
def push_stops(request):
    try:
        body = request.body
        data = json.loads(body)

        if 'head' not in data or 'body' not in data:
            return JsonResponse(status=400, data={"message": "Invalid data format"})


        stops = []
        for item in data["body"]: # for each stop
            stops.append(Stop(
                stop_id = item['stop_id'],
                lines = item
            ))
        Stop.objects.all().delete()
        Stop.objects.bulk_create(stops)


        return JsonResponse(status=200, data={"message": "Web push successful"})
    except TypeError:
        return JsonResponse(status=500, data={"message": "An error occurred"})

@login_required # TODO admin only
@require_POST
def push_history(request):
    try:
        body = request.body
        data = json.loads(body)

        if 'head' not in data or 'body' not in data:
            return JsonResponse(status=400, data={"message": "Invalid data format"})

        history = History(
            history_id=data['head'],
            history_json=data['body']
        )
        history.save()

        return JsonResponse(status=200, data={"message": "Web push successful"})
    except TypeError:
        return JsonResponse(status=500, data={"message": "An error occurred"})


### API JSON ###
def get_stop(element_id):
    try:
        stop = Stop.objects.get(stop_id=element_id)
        return JsonResponse(status=200, data=stop.lines)
    except ObjectDoesNotExist:
        return JsonResponse(status=500, data={"message": "Stop matching query does not exist."})
    except:
        return JsonResponse(status=500, data={"message": "An error occurred"})

def get_shape(element_id): # a single shape
    try:
        shape = Shape.objects.get(shape_id=element_id)
        return JsonResponse(status=200, data=shape.lines)
    except ObjectDoesNotExist:
        return JsonResponse(status=500, data={"message": "Shape matching query does not exist."})
    except:
        return JsonResponse(status=500, data={"message": "An error occurred"})

@require_GET
def api (request, element, element_id):
    print(request)

    if ("shape" == element):
        return get_shape(element_id)
    elif ("stop" == element):
        return get_stop(element_id)

    return JsonResponse(status=500, data={"message": "Wrong element on request"})
