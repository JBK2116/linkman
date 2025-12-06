"""
This file stores utility functions for the `authentication` app
"""

from enum import Enum

from django.core.exceptions import ValidationError
from django.http import HttpRequest, HttpResponse
from django.shortcuts import render

from ..main.models import Group
from .forms import LoginForm, SignupForm
from .models import CustomUser


class HttpMethod(Enum):
    """ENUM class to represent HTTP methods"""

    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    PATCH = "PATCH"
    DELETE = "DELETE"


def validate_signup_form(
    request: HttpRequest, form: SignupForm
) -> SignupForm | HttpResponse:
    """
    Validates the provided SignupForm data by calling `is_valid()`
    :param request: Request object sent by the client
    :param form: Form to validate
    :return: Form if valid, else HttpResponse with error message
    """
    is_valid = form.is_valid()
    if is_valid:
        return form
    else:
        return render(request, "authentication/signup.html", {"form": form})


def validate_login_form(
    request: HttpRequest, form: LoginForm
) -> LoginForm | HttpResponse:
    """
    Validates the provided LoginForm data by calling `is_valid()`
    :param request: Request object sent by the client
    :param form: Form to validate
    :return: Form if valid, else HttpResponse with error message
    """
    is_valid = form.is_valid()
    if is_valid:
        return form
    else:
        return render(request, "authentication/login.html", {"form": form})


def user_exists(email) -> bool:
    """
    Checks if a user exists with the provided email
    :param email: Email to check with
    :return: True if user exists, else False
    """
    return CustomUser.objects.filter(email=email).exists()


def create_user(email: str, password: str) -> ValidationError | CustomUser:
    """
    Creates a new user and returns the created user
    :param email: Email to set for the new user
    :param password: Password to hash and set for the new user
    :return: Created user
    """
    user = CustomUser(email=email)
    user.set_password(password)
    user.full_clean()
    return user


def create_default_group(user: CustomUser) -> Group:
    """
    Creates the default group for the user
    :param user: User to link the default group to
    :return: Created default group
    """
    return Group(user=user, name="Default")
