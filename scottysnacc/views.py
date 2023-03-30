from django.shortcuts import render, redirect, get_object_or_404
from scottysnacc.forms import LoginForm, RegisterForm
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.urls import reverse
from django.core import serializers
from scottysnacc.models import Profile, Event
from django.utils import timezone
from django.http import HttpResponse, Http404
import json
from scottysnacc import models
from datetime import datetime
from django.core.exceptions import ObjectDoesNotExist
import pytz

@login_required
def map_action(request):
    return render(request, "mapElement.html", {})

def login_action(request):
    context = {}

    # Just display the registration form if this is a GET request.
    if request.method == 'GET':
        context['form'] = LoginForm()
        return render(request, 'login.html', context)

    # Creates a bound form from the request POST parameters and makes the 
    # form available in the request context dictionary.
    form = LoginForm(request.POST)
    context['form'] = form

    # Validates the form.
    if not form.is_valid():
        return render(request, 'login.html', context)

    new_user = authenticate(username=form.cleaned_data['email'],
                            password=form.cleaned_data['password'])

    login(request, new_user)
    return redirect(reverse('home'))

def _my_json_error_response(message, status=200):
    # You can create your JSON by constructing the string representation yourself (or just use json.dumps)
    response_json = '{"error": "' + message + '"}'
    return HttpResponse(response_json, content_type='application/json', status=status)

def logout_action(request):
    logout(request)
    return redirect(reverse('login'))

def register_action(request):
    context = {}

    # Just display the registration form if this is a GET request.
    if request.method == 'GET':
        context['form'] = RegisterForm()
        return render(request, 'register.html', context)

    # Creates a bound form from the request POST parameters and makes the 
    # form available in the request context dictionary.
    form = RegisterForm(request.POST)
    context['form'] = form

    # Validates the form.
    if not form.is_valid():
        return render(request, 'register.html', context)

    # At this point, the form data is valid.  Register and login the user.
    new_user = User.objects.create_user(username=form.cleaned_data['email'],
                                        password=form.cleaned_data['password1'])

    new_user.save()

    profile = Profile()
    profile.user = new_user
    profile.save()

    new_user = authenticate(username=form.cleaned_data['email'],
                            password=form.cleaned_data['password1'])

    login(request, new_user)
    return redirect(reverse('home'))

def add_action(request):
    #TODO more error handling
    if not request.user.is_authenticated:
        return _my_json_error_response("Not logged-in.", status=401)
    
    if request.method == 'GET':
        return _my_json_error_response("Invalid GET request.", status=405)

    if 'event_name' not in request.POST or not request.POST['event_name']:
        return _my_json_error_response("You must enter event name.", status=400)
    
    event = models.Event()
    event.user = request.user
    event.name = request.POST['event_name']
    event.lng = request.POST['lng']
    event.lat = request.POST['lat']
    event.building = request.POST['building']
    event.description = request.POST['description']
    event.specLocation = request.POST['specLocation']
    event.startdate = datetime.strptime(request.POST['start'], '%Y/%m/%d %H:%M')
    event.enddate = datetime.strptime(request.POST['end'], '%Y/%m/%d %H:%M')
    event.tag = request.POST['tag']

    event.save()

    return get_events_json_dumps_serializer(request)

def delete_action(request, event_id):
    if not request.user.is_authenticated:
        return _my_json_error_response("You must be logged in to do this operation", status=401)

    if request.method != 'POST':
        return _my_json_error_response("You must use a POST request for this operation", status=405)

    try:
        event = models.Event.objects.get(id=event_id)
    except ObjectDoesNotExist:
        return _my_json_error_response(f"Item with id={event_id} does not exist.", status=404)

    if request.user != event.user:
        return _my_json_error_response("You cannot delete other user's entries", status=403)

    event.delete()

    return get_events_json_dumps_serializer(request)

def get_events_json_dumps_serializer(request):
    if not request.user.is_authenticated:
        return _my_json_error_response("Not logged-in.", status=401)
    
    active_event_data = []
    inactive_event_data = []
    for event in models.Event.objects.all():
        e = {
            'user': event.user.id,
            'name': event.name,
            'lng': event.lng,
            'lat': event.lat,
            'building': event.building,
            'description': event.description,
            'specLocation': event.specLocation,
            'startDate': str(event.startdate),
            'endDate': str(event.enddate),
            'tag': event.tag,
            'id': event.id,
            }
        if event.enddate.replace(tzinfo=pytz.UTC) > timezone.datetime.now().replace(tzinfo=pytz.timezone('US/Eastern')):
            active_event_data.append(e)
        else:
            inactive_event_data.append(e)
            
    response_data = {'active_events' : active_event_data, 'inactive_events' : inactive_event_data}

    response_json = json.dumps(response_data)

    return HttpResponse(response_json, content_type='application/json')


