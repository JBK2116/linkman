from django.db import models

from ..authentication.models import CustomUser


class Group(models.Model):
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        null=False,
        help_text="The User who this group belongs to",
        related_name="user_groups",
    )  # One group can belong to Many users
    name = models.CharField(
        max_length=50,
        null=False,
        blank=False,
        default="Default",
        help_text="Name of the group",
    )  # group name should be unique per user
    created_at = models.DateTimeField(
        auto_now_add=True, help_text="Date and time when this group was created"
    )
    updated_at = models.DateTimeField(
        auto_now=True, help_text="Date and time when this group was last updated"
    )

    def __str__(self) -> str:
        return f"Group: {self.name}"


class Link(models.Model):
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        null=False,
        help_text="The User who this link belongs to",
        related_name="links",
    )
    group = models.ForeignKey(
        Group,
        on_delete=models.CASCADE,
        null=False,
        help_text="The Group who this link belongs to",
        related_name="group_links",
    )
    name = models.CharField(
        max_length=50, null=False, blank=False, help_text="Name of the link"
    )
    url = models.CharField(
        max_length=2000, null=False, blank=False, help_text="URL of the link"
    )
    click_count = models.PositiveIntegerField(
        default=0, help_text="Click count of the link"
    )
    created_at = models.DateTimeField(
        auto_now_add=True, help_text="Date and time when this link was created"
    )
    updated_at = models.DateTimeField(
        auto_now=True, help_text="Date and time when this link was last updated"
    )

    def __str__(self) -> str:
        return f"Link: {self.name} Belonging to Group: {self.group.name} Of User: {self.user.email}"
