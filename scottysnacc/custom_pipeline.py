from social_core.exceptions import AuthForbidden
from django.shortcuts import redirect
from django.urls import reverse
from django.contrib import messages

def check_email_domain(backend, details, response, *args, **kwargs):
    email = details.get('email', '')
    if email and email.endswith('@andrew.cmu.edu'):
        return
    else:
        messages.error(kwargs['request'], "Invalid email domain. Please use an '@andrew.cmu.edu' email")
        return redirect(reverse('login'))