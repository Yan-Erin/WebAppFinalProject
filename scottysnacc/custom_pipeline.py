from social_core.exceptions import AuthForbidden
from django.shortcuts import redirect
from django.urls import reverse

def check_email_domain(backend, details, response, *args, **kwargs):
    email = details.get('email', '')
    print(email)
    if email and email.endswith('@andrew.cmu.edu'):
        return
    else:
        return redirect(reverse('login'))