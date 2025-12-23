"""
This file stores utility functions for the `authentication` app
"""

import logging
from enum import Enum

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.http import HttpRequest, HttpResponse
from django.shortcuts import render
from django.template.loader import render_to_string

from ..main.models import Group
from .forms import LoginForm, SignupForm
from .models import CustomUser

logger = logging.getLogger("authentication_app")


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
        print(form.errors)
        return render(
            request,
            template_name="authentication/signup.html",
            context={"form": form},
            status=400,
        )


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
        return render(
            request,
            template_name="authentication/login.html",
            context={"form": form},
            status=400,
        )


def user_exists(email: str) -> bool:
    """
    Checks if a user exists with the provided email
    :param email: Email to check with
    :return: True if user exists, else False
    """
    return CustomUser.objects.filter(email=email).exists()


def create_user(email: str, password: str) -> CustomUser:
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


def send_account_verification_email(
    token: str, user_email: str, request: HttpRequest
) -> str | None:
    """
    Sends a verification email to the provided user email

    :param token: Token to embed in the email
    :param user_email: Email to send to
    :param request: Http request
    :returns: String if an error occurred, else None
    """
    protocol: str = "https" if request.is_secure() else "http"
    domain: str = request.get_host()
    subject: str = "FuzzyLinks - Verify Your Account"
    text_content: str = "Verify your account to begin using FuzzyLinks"
    html_message = render_to_string(
        template_name="authentication/verify_email.html",
        context={
            "token": token,
            "protocol": protocol,
            "domain": domain,
            "minutes": "15",
        },
    )
    msg = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.EMAIL_FROM_USER,
        to=[user_email],
    )
    msg.attach_alternative(content=html_message, mimetype="text/html")
    try:
        msg.send()
        return None
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")  # Showcase the actual error
        return "Failed to send verification email. Please try again."
