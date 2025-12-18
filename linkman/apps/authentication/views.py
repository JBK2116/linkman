from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpRequest
from django.http.response import HttpResponse
from django.shortcuts import redirect, render
from django_ratelimit.decorators import ratelimit

from ..authentication import utils as auth_utils
from ..main.models import Group
from .forms import LoginForm, SignupForm
from .models import CustomUser

# TODO: Ensure that rate-limiting works appropriately, also make sure to create a rate limit view


def landing_page(request: HttpRequest) -> HttpResponse:
    """Landing page for the application"""
    if request.user.is_authenticated:
        return redirect("dashboard")
    return render(request, "index.html")


@ratelimit(key="ip", method="POST", rate="10/m")
def signup_page(request: HttpRequest) -> HttpResponse:
    """Signup page for the application"""
    if request.user.is_authenticated:
        return redirect("dashboard")
    if request.method == auth_utils.HttpMethod.POST.value:
        # validate the form
        validation_result: SignupForm | HttpResponse = auth_utils.validate_signup_form(
            request, SignupForm(request.POST)
        )
        if isinstance(validation_result, HttpResponse):
            return validation_result
        # form is clean by this point
        cleaned_form = validation_result
        # ensure that a user does not exist with the same email
        if auth_utils.user_exists(cleaned_form.cleaned_data["email"]):
            return render(
                request,
                template_name="authentication/signup.html",
                context={
                    "form": cleaned_form,
                    "email_exists": "A user already exists with that email",
                },
                status=400,
            )
        # User does not exist and form data is valid, now we can create the new user
        new_user: CustomUser = auth_utils.create_user(
            cleaned_form.cleaned_data["email"],
            cleaned_form.cleaned_data["password_one"],
        )
        # handle the edge cass if a parallel request makes a user with the same email
        try:
            new_user.save()
        except IntegrityError:
            return render(
                request,
                "authentication/signup.html",
                {"email_exists": "A user already exists with that email"},
            )
        # Create and link the default group to the user
        default_group: Group = auth_utils.create_default_group(new_user)
        default_group.save()
        # Login the user and redirect
        login(request, new_user)
        return redirect("dashboard")
    else:
        return render(request, "authentication/signup.html", {"form": SignupForm()})


@ratelimit(key="ip", method="POST", rate="10/m")
def login_page(request: HttpRequest) -> HttpResponse:
    """Login page for the application"""
    if request.user.is_authenticated:
        return redirect("dashboard")
    if request.method == auth_utils.HttpMethod.POST.value:
        # validate the login form
        validation_result: LoginForm | HttpResponse = auth_utils.validate_login_form(
            request, LoginForm(request.POST)
        )
        if isinstance(validation_result, HttpResponse):
            return validation_result
        cleaned_form = validation_result
        # authenticate the user
        user = authenticate(
            request,
            email=cleaned_form.cleaned_data["email"],
            password=cleaned_form.cleaned_data["password"],
        )
        if not user:
            return render(
                request,
                template_name="authentication/login.html",
                context={
                    "form": cleaned_form,
                    "invalid_credentials": "Invalid email or password.",
                },
                status=400,
            )
        # login the user
        login(request, user)
        return redirect("dashboard")
    else:
        return render(request, "authentication/login.html", {"form": LoginForm()})


@ratelimit(key="ip", method="POST", rate="10/m")
@login_required
def settings_page(request: HttpRequest) -> HttpResponse:
    """Settings page for the application"""
    assert isinstance(request.user, CustomUser)
    user: CustomUser = request.user
    created_at: str = user.created_at.strftime("%B %d, %Y")
    total_groups: int = user.user_groups.count()  # type: ignore -> This is valid, check models.py
    total_links: int = user.links.count()  # type: ignore  -> This is also valid, check models.py
    return render(
        request,
        "authentication/settings.html",
        context={
            "user": request.user,
            "created_at": created_at,
            "total_links": total_links,
            "total_groups": total_groups,
        },
    )
