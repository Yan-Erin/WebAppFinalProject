from django import forms
from django.contrib.auth import authenticate 
from django.contrib.auth.models import User

class LoginForm(forms.Form):
    username = forms.CharField(max_length=50, widget=forms.TextInput(attrs={'id': 'id_login_username',
                                                                            'class': "form-item form-group form-control"}))
    password = forms.CharField(max_length=200, widget=forms.PasswordInput(attrs={'id': 'id_login_password',
                                                                                 'class': "form-item form-group form-control"}))

    # Customizes form validation for properties that apply to more
    # than one field.  Overrides the forms.Form.clean function.
    def clean(self):
        # Calls our parent (forms.Form) .clean function, gets a dictionary
        # of cleaned data as a result
        cleaned_data = super().clean()

        username = cleaned_data.get('username')
        password = cleaned_data.get('password')
        user = authenticate(username=username, password=password)
        if not user:
            raise forms.ValidationError("Invalid username/password")

        # We must return the cleaned data we got from our parent.
        return cleaned_data


class RegisterForm(forms.Form):
    username   = forms.CharField(max_length=50,
                                 widget=forms.TextInput(attrs={'id': 'id_register_username', 'class': "form-item form-control"}))

    email      = forms.CharField(max_length=50,
                                 widget=forms.EmailInput(attrs={'id': 'id_register_email', 'class': "form-item form-control"}))

    password1  = forms.CharField(max_length=200,
                                 label='Password', 
                                 widget=forms.PasswordInput(attrs={'id': 'id_register_password',
                                                                   'class': "form-item form-control"}))
    password2  = forms.CharField(max_length=200,
                                 label='Confirm password',  
                                 widget=forms.PasswordInput( attrs={'id': 'id_confirm_password',
                                                                    'class': "form-item form-control"}))

    # Customizes form validation for properties that apply to more
    # than one field.  Overrides the forms.Form.clean function.
    def clean(self):
        # Calls our parent (forms.Form) .clean function, gets a dictionary
        # of cleaned data as a result
        cleaned_data = super().clean()

        # Confirms that the email is not already present in the
        # User model database.
        email = self.cleaned_data.get('email')
        if User.objects.filter(email__exact=email):
            raise forms.ValidationError("Email is already registered")
        
        if not email.endswith("@andrew.cmu.edu"):
            raise forms.ValidationError("Please register using your Andrew email")
        
        # Confirms that the username is not already present in the
        # User model database.
        username = self.cleaned_data.get('username')
        if User.objects.filter(username__exact=username):
            raise forms.ValidationError("Username is already registered")

        # Confirms that the two password fields match
        password1 = cleaned_data.get('password1')
        password2 = cleaned_data.get('password2')
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Passwords did not match")

        # We must return the cleaned data we got from our parent.
        return cleaned_data