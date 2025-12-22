from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpRequest, HttpResponseRedirect
from django.http.response import HttpResponse
from django.shortcuts import redirect, render
from django_ratelimit.decorators import ratelimit

from ..authentication import utils as auth_utils
from ..authentication.tokens import (
    generate_verification_token,
    get_user_id_from_expired_token,
    verify_verification_token,
)
from ..main.models import Group
from .forms import LoginForm, SignupForm
from .models import CustomUser


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
        # Email the user
        token: str = generate_verification_token(new_user)
        email_sent_result: str | None = auth_utils.send_account_verification_email(
            token, new_user.email, request
        )
        # error occurred sending the email
        if email_sent_result:
            return render(
                request,
                "authentication/signup.html",
                {"form": cleaned_form, "email_sent_error": email_sent_result},
            )
        # email was sent successfully
        return render(
            request,
            "authentication/signup.html",
            {"form": cleaned_form, "email_sent": True, "user_email": new_user.email},
        )
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
        # ensure that the user is verified
        if not user.is_verified:
            return render(
                request,
                template_name="authentication/login.html",
                context={
                    "form": cleaned_form,
                    "invalid_credentials": "Invalid email or password.",
                },
            )
        # login the user
        login(request, user)
        return redirect("dashboard")
    else:
        email_resent: bool = request.session.pop("email_resent", False)
        resent_email: str | None = request.session.pop("resent_email", None)
        return render(
            request,
            "authentication/login.html",
            {"form": LoginForm(), "email_resent": email_resent, "email": resent_email},
        )


@ratelimit(key="ip", method="POST", rate="5/m")
def resend_email(request: HttpRequest) -> HttpResponseRedirect | HttpResponse:
    email: str | None = request.POST.get("email")
    if not email:
        return redirect("login_page")

    user: CustomUser | None = CustomUser.objects.filter(
        email=email, is_verified=False
    ).first()
    if user:
        # create a new token and send back the email
        new_token: str = generate_verification_token(user)
        auth_utils.send_account_verification_email(new_token, user.email, request)
        # set these values to be used in the login page again
        request.session["email_resent"] = True
        request.session["resent_email"] = email
    return redirect("login_page")


@ratelimit(key="ip", method="POST", rate="5/m")
def verify_email(request: HttpRequest) -> HttpResponse:
    """Email verification view for creating a new account"""
    token = request.GET.get("token")  # get the token from the url param
    if not token:
        return redirect("signup_page")
    result: int | None = verify_verification_token(token)
    if not result:
        # token was invalid
        token_user_id: int | None = get_user_id_from_expired_token(token)
        user = (
            CustomUser.objects.filter(pk=token_user_id).first()
            if token_user_id
            else None
        )
        return render(
            request,
            template_name="authentication/login.html",
            context={
                "form": LoginForm(),
                "verification_expired": True,
                "email": user.email if user else None,
            },
        )
    user_id: int = result
    user = CustomUser.objects.filter(pk=user_id).first()
    if not user:
        # user does not exist anymore
        return redirect("login_page")
    if user.is_verified:
        # user is already verified
        return render(
            request,
            "authentication/login.html",
            {"form": LoginForm(), "email_verified": True},
        )
    # verify the user's account
    user.is_verified = True
    user.save()
    # user can now login
    return render(
        request,
        "authentication/login.html",
        {"form": LoginForm(), "email_verified": True},
    )


@ratelimit(key="ip", method="POST", rate="10/m")
@login_required
def settings_page(request: HttpRequest) -> HttpResponse:
    """Settings page for the application"""
    assert isinstance(request.user, CustomUser)
    user: CustomUser = request.user
    created_at: str = user.created_at.strftime("%B %d, %Y")
    total_groups: int = user.user_groups.count()
    total_links: int = user.links.count()
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
