"""
This module stores forms used for authentication
"""

from typing import Any

from django import forms
from django.contrib.auth.forms import PasswordResetForm, SetPasswordForm


class SignupForm(forms.Form):
    email = forms.EmailField(max_length=254, min_length=3, required=True)
    password_one = forms.CharField(
        widget=forms.PasswordInput, required=True, max_length=265, min_length=8
    )
    password_two = forms.CharField(
        widget=forms.PasswordInput, required=True, max_length=265, min_length=8
    )

    def clean(self) -> dict[str, Any]:
        cleaned_data = super(SignupForm, self).clean()
        assert cleaned_data is not None  # to get rid of pyright warnings
        password_one = cleaned_data.get("password_one")
        password_two = cleaned_data.get("password_two")
        if password_one != password_two:
            raise forms.ValidationError("Passwords do not match!")
        return cleaned_data


class LoginForm(forms.Form):
    email = forms.EmailField(max_length=254, min_length=3, required=True)
    password = forms.CharField(
        widget=forms.PasswordInput, required=True, max_length=265, min_length=8
    )


class ForgotPasswordForm(PasswordResetForm):
    pass


class ResetPasswordForm(SetPasswordForm):
    pass
