from django import forms
from django.contrib.auth import authenticate 
from django.contrib.auth.models import User

#TODO:(ERIN) Move to a constants.json file
CMU_BUILDINGS = ["Tepper", "Gates", "Baker", "Wean", "Posner", "Porter", "The Cut", "Hunts Library"] 
TAGS = ["Freshman", "Sophmore", "Junior", "Senior", "CIT", "SCS", "MCS", "HOA"]

class LoginForm(forms.Form):
    email = forms.CharField(max_length=20, widget=forms.TextInput(attrs={'id': 'id_username',
                                                                            'class': "form-group form-control"}))
    password = forms.CharField(max_length=200, widget=forms.PasswordInput(attrs={'id': 'id_password',
                                                                                 'class': "form-group form-control"}))

    # Customizes form validation for properties that apply to more
    # than one field.  Overrides the forms.Form.clean function.
    def clean(self):
        # Calls our parent (forms.Form) .clean function, gets a dictionary
        # of cleaned data as a result
        cleaned_data = super().clean()

        # Confirms that the two password fields match
        email = cleaned_data.get('email')
        password = cleaned_data.get('password')
        user = authenticate(username=email, password=password)
        if not user:
            raise forms.ValidationError("Invalid username/password")

        # We must return the cleaned data we got from our parent.
        return cleaned_data


class RegisterForm(forms.Form):
    email      = forms.CharField(max_length=50,
                                 widget=forms.EmailInput(attrs={'id': 'id_email', 'class': "form-control"}))

    password1  = forms.CharField(max_length=200,
                                 label='Password', 
                                 widget=forms.PasswordInput(attrs={'id': 'id_password',
                                                                   'class': "form-control"}))
    password2  = forms.CharField(max_length=200,
                                 label='Confirm password',  
                                 widget=forms.PasswordInput( attrs={'id': 'id_confirm_password',
                                                                    'class': "form-control"}))

    # Customizes form validation for properties that apply to more
    # than one field.  Overrides the forms.Form.clean function.
    def clean(self):
        # Calls our parent (forms.Form) .clean function, gets a dictionary
        # of cleaned data as a result
        cleaned_data = super().clean()

        # Confirms that the two password fields match
        password1 = cleaned_data.get('password1')
        password2 = cleaned_data.get('password2')
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Passwords did not match.")

        # We must return the cleaned data we got from our parent.
        return cleaned_data

    # Customizes form validation for the username field.
    def clean_username(self):
        # Confirms that the username is not already present in the
        # User model database.
        email = self.cleaned_data.get('email')
        if User.objects.filter(username__exact=email):
            raise forms.ValidationError("Username is already taken.")

        # We must return the cleaned data we got from the cleaned_data
        # dictionary
        return email