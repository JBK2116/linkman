"""
This module stores the token logic for this application
"""

from django.core import signing

from .models import CustomUser

EXPIRATION_SECONDS = 60  # One minute


def generate_verification_token(user: CustomUser):
    """
    Creates a URL-safe token containing the user_id and a timestamp.
    """
    return signing.dumps({"user_id": user.pk}, salt="email-verification")


def verify_verification_token(token: str) -> int | None:
    """
    Decodes the token, checks the signature, and verifies expiration.
    Returns the user_id if valid, or None if invalid/expired.

    :param token: Token to verify
    :returns: ID embedded in token if valid, else None
    """
    try:
        # decode and verify the signature
        payload = signing.loads(
            token, salt="email-verification", max_age=EXPIRATION_SECONDS
        )
        # ensure that the user id is valid
        user_id = payload.get("user_id")
        if not user_id:
            return None
        # ensure that the user account exists
        user_exists: bool = CustomUser.objects.filter(pk=user_id).exists()
        if not user_exists:
            return None
        # user is valid by now
        return user_id
    except (signing.BadSignature, signing.SignatureExpired):
        # Token was tampered with or is invalid
        return None


def get_user_id_from_expired_token(token: str) -> int | None:
    """
    Extracts user_id from an expired token without checking expiration.
    Used for resending verification emails.
    :param token: Expired token
    :returns: user_id if token is valid (ignoring expiration), else None
    """
    try:
        payload = signing.loads(token, salt="email-verification", max_age=None)
        return payload.get("user_id")
    except signing.BadSignature:
        return None
