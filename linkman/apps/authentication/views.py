import logging

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
from ..authentication.utils import LogLevel
from ..main.models import Group
from .forms import LoginForm, SignupForm
from .models import CustomUser

logger = logging.getLogger(__name__)
error_logger = logging.getLogger("error")


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
                    "email_sent": False,
                    "email_sent_error": None,
                    "user_email": None,
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
            logger.log(level=LogLevel.INFO.value, msg=f"Created new user {new_user}")
        except IntegrityError:
            error_logger.log(
                level=LogLevel.ERROR.value,
                msg=f"Integrity Error occurred saving new user with email {new_user.email}",
            )
            return render(
                request,
                "authentication/signup.html",
                {
                    "form": cleaned_form,
                    "email_exists": "A user already exists with that email",
                    "email_sent": False,
                    "email_sent_error": None,
                    "user_email": None,
                },
            )
        # Create and link the default group to the user
        default_group: Group = auth_utils.create_default_group(new_user)
        default_group.save()
        logger.log(level=LogLevel.INFO.value, msg=f"Created new group {default_group}")
        # Email the user
        token: str = generate_verification_token(new_user)
        email_sent_result: str | None = auth_utils.send_account_verification_email(
            token, new_user.email, request
        )
        # error occurred sending the email
        if email_sent_result:
            logger.log(
                level=LogLevel.ERROR.value,
                msg=f"Error occurred sending verify account email: {email_sent_result}",
            )
            return render(
                request,
                "authentication/signup.html",
                {
                    "form": cleaned_form,
                    "email_sent_error": email_sent_result,
                    "email_sent": False,
                    "email_exists": None,
                    "user_email": None,
                },
            )
        # email was sent successfully
        return render(
            request,
            "authentication/signup.html",
            {
                "form": cleaned_form,
                "email_sent": True,
                "user_email": new_user.email,
                "email_sent_error": None,
                "email_exists": None,
            },
        )
    else:
        return render(
            request,
            "authentication/signup.html",
            {
                "form": SignupForm(),
                "email_sent": False,
                "email_sent_error": None,
                "email_exists": None,
                "user_email": None,
            },
        )


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
        logger.log(
            level=LogLevel.INFO.value,
            msg="Authenticating user for login",
            extra={"email": cleaned_form.cleaned_data["email"]},
        )
        if not user:
            logger.log(
                LogLevel.WARNING.value,
                msg="Authentication failed for user",
                extra={
                    "email": cleaned_form.cleaned_data["email"],
                    "reason": "Invalid email or password",
                },
            )
            return render(
                request,
                template_name="authentication/login.html",
                context={
                    "form": cleaned_form,
                    "invalid_credentials": "Invalid email or password.",
                    "email_verified": False,
                    "verification_expired": False,
                    "email_resent": False,
                    "email": None,
                    "user_email": None,
                },
                status=400,
            )
        # ensure that the user is verified
        if not user.is_verified: # pyright: ignore[reportAttributeAccessIssue] 
            logger.log(
                level=LogLevel.WARNING.value,
                msg="Authentication failed for user",
                extra={
                    "email": user.email, # pyright: ignore[reportAttributeAccessIssue]
                    "reason": "User is not verified in the database",
                },
            )
            return render(
                request,
                template_name="authentication/login.html",
                context={
                    "form": cleaned_form,
                    "invalid_credentials": "Invalid email or password.",
                    "email_verified": False,
                    "verification_expired": False,
                    "email_resent": False,
                    "email": None,
                    "user_email": None,
                },
            )
        # login the user
        logger.log(
            level=LogLevel.INFO.value, msg="User logged in", extra={"User": user}
        )
        login(request, user)
        return redirect("dashboard")
    else:
        email_resent: bool = request.session.pop("email_resent", False)
        resent_email: str | None = request.session.pop("resent_email", None)
        return render(
            request,
            "authentication/login.html",
            {
                "form": LoginForm(),
                "invalid_credentials": "",
                "email_verified": False,
                "verification_expired": False,
                "email_resent": email_resent,
                "email": resent_email,
                "user_email": None,
            },
        )


@ratelimit(key="ip", method="POST", rate="5/m")
def resend_email(request: HttpRequest) -> HttpResponseRedirect | HttpResponse:
    email: str | None = request.POST.get("email")
    if not email:
        logger.log(
            level=LogLevel.INFO.value,
            msg="Unable to resend verify account email",
            extra={"reason": "Email not provided"},
        )
        # TODO: This redirect should return to login with context to tell the user an invalid email was entered
        return redirect("login_page")

    user: CustomUser | None = CustomUser.objects.filter(
        email=email, is_verified=False
    ).first()
    if user:
        logger.log(
            level=LogLevel.INFO.value,
            msg="Resending verify account email",
            extra={"email": email},
        )
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
        logger.log(
            level=LogLevel.WARNING.value,
            msg="Unable to verify user email",
            extra={"reason": "Token not found in url parameter"},
        )
        return redirect("signup_page")
    result: int | None = verify_verification_token(token)
    if not result:
        logger.log(
            level=LogLevel.INFO.value,
            msg="Unable to verify user email",
            extra={"reason": "Invalid verification token received"},
        )
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
                "invalid_credentials": False,
                "email_verified": False,
                "verification_expired": True,
                "email_resent": "",
                "email": user.email if user else None,
                "user_email": user.email if user else None,
            },
        )
    user_id: int = result
    user = CustomUser.objects.filter(pk=user_id).first()
    if not user:
        # TODO: This should alert the user to restart the account creation process
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
    logger.log(
        level=LogLevel.INFO.value, msg="User account verified", extra={"user": user}
    )
    # user can now login
    return render(
        request,
        "authentication/login.html",
        {
            "form": LoginForm(),
            "invalid_credentials": False,
            "email_verified": True,
            "verification_expired": False,
            "email_resent": "",
            "email": user.email if user else None,
            "user_email": user.email if user else None,
        },
    )


@ratelimit(key="ip", method="POST", rate="10/m")
@login_required
def settings_page(request: HttpRequest) -> HttpResponse:
    """Settings page for the application"""
    assert isinstance(request.user, CustomUser)
    user: CustomUser = request.user
    created_at: str = user.created_at.strftime("%B %d, %Y")
    total_groups: int = user.user_groups.count() # pyright: ignore[reportAttributeAccessIssue]
    total_links: int = user.links.count() # pyright: ignore[reportAttributeAccessIssue]
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
