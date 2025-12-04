"""
This module stores forms used for authentication
"""
from django import forms


class SignupForm(forms.Form):
    email = forms.EmailField(max_length=254, min_length=3, required=True)
    password_one = forms.CharField(widget=forms.PasswordInput, required=True,max_length=265, min_length=8)
    password_two = forms.CharField(widget=forms.PasswordInput, required=True,max_length=265, min_length=8)

    def clean(self):
        cleaned_data = super(SignupForm, self).clean()
        password_one = cleaned_data.get("password_one")
        password_two = cleaned_data.get("password_two")
        if password_one != password_two:
            raise forms.ValidationError("Passwords do not match!")
        return cleaned_data

class LoginForm(forms.Form):
    email = forms.EmailField(max_length=254, min_length=3, required=True)
    password = forms.CharField(widget=forms.PasswordInput, required=True,max_length=265, min_length=8)
