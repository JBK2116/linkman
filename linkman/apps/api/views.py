import json
from typing import Any

from django.core import serializers
from django.http import HttpRequest
from django.http.response import JsonResponse

from ..api import utils
from ..authentication.models import CustomUser
from ..authentication.utils import HttpMethod
from ..main.models import Group, Link


def group_all(request: HttpRequest) -> JsonResponse:
    if request.method == HttpMethod.POST.value:
        """Equivalent to api/group POST"""
        # ensure that the user is authenticated
        if not utils.validate_authentication(request.user):
            return JsonResponse({"detail": "User not authenticated"}, status=401)
        assert isinstance(
            request.user, CustomUser
        )  # user is confirmed to be a custom user by now
        # parse the data
        data: dict[str, Any] = json.loads(request.body)
        group_name: str | None = data.get("group_name")
        if group_name is None:
            return JsonResponse(
                {"detail": "Error Occurred. Group name is missing"}, status=400
            )
        # Validate the group name
        name_validation_result: bool = utils.validate_group_name(group_name)
        if not name_validation_result:
            return JsonResponse(
                {
                    "detail": "Invalid group name. Group name must be between 0 - 50 characters"
                },
                status=400,
            )
        name_uniqueness_result: bool = utils.validate_unique_group_name(
            group_name, request.user
        )
        if not name_uniqueness_result:
            return JsonResponse(
                {"detail": f"A group with the name '{group_name}' already exists "},
                status=400,
            )
        # Group name is valid by now
        new_group = Group(user=request.user, name=group_name)
        new_group.save()
        new_group_data: dict[str, Any] = json.loads(
            serializers.serialize("json", [new_group])
        )[0]["fields"]
        new_group_data["id"] = new_group.id
        return JsonResponse(
            {"detail": "Group successfully created", "group": new_group_data},
            status=201,
        )

    # Request is a simple api/group GET
    groups = list(Group.objects.filter(user=request.user).values())
    return JsonResponse({"groups": groups})


def link_all(request) -> JsonResponse:
    links = list(Link.objects.filter(user=request.user).values())
    return JsonResponse({"links": links})
