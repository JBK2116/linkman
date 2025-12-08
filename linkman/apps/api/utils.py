"""
This module stores utility functions for the `api` application
"""

from django.contrib.auth.models import AbstractBaseUser, AnonymousUser

from ..main.models import CustomUser, Group


def validate_group_name(group_name: str) -> bool:
    """
    Validates the provided group name
    :param group_name: Group name to validate
    :return: True if the group name is valid, false otherwise
    """
    group_name = group_name.strip()
    return 0 < len(group_name) <= 50


def validate_unique_group_name(group_name: str, user: CustomUser) -> bool:
    """
    Checks if the user already has a group with the provided name
    :param group_name: Group name to check for
    :param user: User object to check in
    :return: True if the user does not have a group with the provided group name, false otherwise
    """
    return not Group.objects.filter(name=group_name, user=user).exists()


def validate_authentication(user: AbstractBaseUser | AnonymousUser) -> bool:
    """
    Validates the provided user, ensuring that they are authenticated and in the database
    :param user: User object to validate
    :return: True if the user is valid, false otherwise
    """
    if not isinstance(user, CustomUser):
        return False
    return CustomUser.objects.filter(id=user.id).exists()
