"""
This module stores utility functions for the `api` application
"""

import json
from typing import Any

from django.contrib.auth.models import AbstractBaseUser, AnonymousUser
from django.core import serializers

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


def validate_link_name(link_name: str) -> bool:
    link_name = link_name.strip()
    return 0 < len(link_name) <= 50


def validate_link_url(link_url: str) -> bool:
    link_url = link_url.strip()
    return 0 < len(link_url) <= 2000


def validate_group_exists(group_id: int, user: CustomUser) -> Group | None:
    """
    Validates that a group exists with the provided id and belongs to the provided user
    :param group_id: ID of the group to check
    :param user: User object to check wit
    :return: Group object if it exists, false otherwise
    """
    return Group.objects.filter(id=group_id, user=user).first()


def serialize_object(obj: Any) -> dict[str, Any]:
    """
    Serializes the provided object to a dict
    :param obj: Object to serialize
    :return: Serialized object json dictionary
    """
    data: dict[str, Any] = json.loads(serializers.serialize("json", [obj]))[0]["fields"]
    data["id"] = obj.id
    return data
