from django.shortcuts import render
#from django.shortcuts import get_object_or_404, redirect
#from django.core.mail import send_mail, BadHeaderError
#from django.http import HttpResponse, HttpResponseRedirect

# Create your views here.

def shapeeditor(request):

    if request.method == 'GET':
        print('method GET')

    context = {}
    return render(request, 'shapeeditor/index.html', context)
    #return HttpResponse('gtfs_editor/index.html', content_type='text/html')
