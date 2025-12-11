"""
This module stores utility functions for the `api` application
"""

import json
from typing import Any

from django.contrib.auth.models import AbstractBaseUser, AnonymousUser
from django.core import serializers

from ..main.models import CustomUser, Group, Link


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
    :param user: User object to check with
    :return: Group object if it exists, false otherwise
    """
    return Group.objects.filter(id=group_id, user=user).first()


def delete_link_in_db(link_id) -> bool:
    """
    Deletes a link from the database
    :param link_id: ID of the link to delete
    :return: True if the link was deleted, false otherwise
    """
    try:
        link = Link.objects.get(id=link_id)
        link.delete()
        return True
    except Link.DoesNotExist:
        return False


def update_link_in_db(
    link_id: int, data: dict[str, Any], user: CustomUser
) -> str | Link:
    """
    Updates a link in the database
    :param link_id: ID of the link to update
    :param data: data to update the link
    :param user: User associated with the link
    :return: Link object if it was updated else string explaining why the update failed
    """

    link: Link | None = get_link_from_db(link_id)
    if link is None:
        return "Unable to update link. Link not found."
    group: Group | None = get_group_from_db(data["group_id"])
    if group is None:
        return "Unable to update link. Group not found."
    if data["for_clicked"] is True:
        link.click_count += 1
        link.save()
        return link
    link.name = data["link_name"]
    link.url = data["link_url"]
    link.group = group
    link.save()
    return link


def get_group_from_db(group_id: int) -> Group | None:
    try:
        group = Group.objects.get(id=group_id)
        return group
    except Group.DoesNotExist:
        return None


def get_link_from_db(link_id) -> Link | None:
    try:
        link = Link.objects.get(id=link_id)
        return link
    except Link.DoesNotExist:
        return None


def serialize_object(obj: Any) -> dict[str, Any]:
    """
    Serializes the provided object to a dict
    :param obj: Object to serialize
    :return: Serialized object json dictionary
    """
    data: dict[str, Any] = json.loads(serializers.serialize("json", [obj]))[0]["fields"]
    data["id"] = obj.id
    return data
