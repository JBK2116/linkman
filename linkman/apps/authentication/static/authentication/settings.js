// GROUP MANAGEMENT FUNCTIONALITY

const GROUP_SELECT = document.getElementById('group-select');
const GROUP_EDIT_FORM_CONTAINER = document.getElementById(
    'group-edit-form-container',
);
const GROUP_EDIT_FORM = document.getElementById('group-edit-form');
const GROUP_EDIT_FORM_ERRORS = document.getElementById('group-edit-errors');
const GROUP_DELETE_BUTTON = document.getElementById('group-delete-btn');
const GROUP_CANCEL_BUTTON = document.getElementById('group-cancel-btn');
const GROUP_EMPTY_STATE = document.getElementById('group-empty-state');

// Form fields
const GROUP_EDIT_ID = document.getElementById('group-edit-id');
const GROUP_EDIT_NAME = document.getElementById('group-edit-name');
const GROUP_EDIT_CREATED = document.getElementById('group-edit-created');

// DELETE ACCOUNT FUNCTIONALITY
const DELETE_ACCOUNT_MODAL = document.getElementById('delete-account-modal');
const DELETE_ACCOUNT_CANCEL_BUTTON = document.getElementById(
    'cancel-delete-account',
);
const DELETE_ACCOUNT_CONFIRM_BUTTON = document.getElementById(
    'confirm-delete-account',
);
const DELETE_ACCOUNT_BUTTON = document.getElementById('delete-account-btn');

// VARIABLES
const ALL_GROUPS = [];
let CURRENT_SELECTED_GROUP = null;

const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
};
const locales = 'en-US';

function formatTime(datetime) {
    const newDate = new Date(datetime);
    return newDate.toLocaleDateString(locales, options);
}

/**
 * Retrieves all the groups that belong to the logged-in user
 */
async function getAllGroups() {
    try {
        const response = await fetch('/api/groups', { method: 'GET' });
        const data = await response.json();
        if (!response.ok) {
            console.log(`Unable to fetch all groups: ${data.detail}`);
            return;
        }
        data.groups.forEach((item) => {
            ALL_GROUPS.push(item);
        });
        populateGroupSelect();
    } catch (error) {
        console.log(`Error occurred fetching all groups: ${error}`);
    }
}

/**
 * Populates the group select dropdown with all groups
 */
function populateGroupSelect() {
    GROUP_SELECT.innerHTML =
        '<option value="">Choose a group to manage...</option>';
    ALL_GROUPS.forEach((group) => {
        const option = document.createElement('option');
        option.value = group.id;
        option.textContent = group.name;
        GROUP_SELECT.appendChild(option);
    });
}

/**
 * Populates the edit group form with the selected group's data
 */
function populateEditGroupForm(group) {
    CURRENT_SELECTED_GROUP = group;
    GROUP_EDIT_ID.value = group.id;
    GROUP_EDIT_NAME.value = group.name;
    GROUP_EDIT_CREATED.textContent = formatTime(group.created_at);
    hideEditFormErrors();
}

/**
 * Shows the edit group form
 */
function showEditGroupForm() {
    GROUP_EDIT_FORM_CONTAINER.classList.remove('hidden');
    GROUP_EMPTY_STATE.classList.add('hidden');
}

/**
 * Hides the edit group form
 */
function hideEditGroupForm() {
    GROUP_EDIT_FORM_CONTAINER.classList.add('hidden');
    GROUP_EMPTY_STATE.classList.remove('hidden');
}

/**
 * Shows errors in the edit form
 */
function showEditFormErrors(message) {
    GROUP_EDIT_FORM_ERRORS.textContent = message;
    GROUP_EDIT_FORM_ERRORS.classList.remove('hidden');
}

/**
 * Hides errors in the edit form
 */
function hideEditFormErrors() {
    GROUP_EDIT_FORM_ERRORS.classList.add('hidden');
    GROUP_EDIT_FORM_ERRORS.textContent = '';
}

/**
 * Resets the edit group form
 */
function resetEditGroupForm() {
    CURRENT_SELECTED_GROUP = null;
    GROUP_EDIT_FORM.reset();
    GROUP_EDIT_ID.value = '';
    GROUP_EDIT_NAME.value = '';
    GROUP_EDIT_CREATED.textContent = '-';
    hideEditFormErrors();
    hideEditGroupForm();
}

/**
 * Updates a group via API
 */
async function updateGroup(groupId, groupName) {
    try {
        const response = await fetch(`/api/groups/${groupId}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify({ name: groupName }),
        });
        // handle invalid responses
        const data = await response.json();
        if (!response.ok) {
            showEditFormErrors(data.detail || 'Failed to update group');
            return null;
        }
        // Update local GROUPS array
        const groupIndex = ALL_GROUPS.findIndex((g) => g.id === data.group.id);
        if (groupIndex !== -1) {
            ALL_GROUPS[groupIndex] = data.group;
        }
        // Update the select dropdown
        populateGroupSelect();
        alert('Group updated');
        return data.group;
    } catch (error) {
        showEditFormErrors(`Error updating group: ${error.message}`);
        return null;
    }
}

/**
 * Deletes a group via API
 */
async function deleteGroup(groupId) {
    try {
        const response = await fetch(`/api/groups/${groupId}/`, {
            method: 'DELETE',
            headers: { 'X-CSRFToken': getCSRFToken() },
        });
        // handle invalid responses
        if (!response.ok) {
            const data = await response.json();
            showEditFormErrors(data.detail || 'Failed to delete group');
            return false;
        }
        // Remove from local GROUPS array
        const groupIndex = ALL_GROUPS.findIndex(
            (g) => g.id === Number(groupId),
        );
        if (groupIndex !== -1) {
            ALL_GROUPS.splice(groupIndex, 1);
        }
        // Update the select dropdown
        populateGroupSelect();
        alert('Group deleted');
        return true;
    } catch (error) {
        showEditFormErrors(`Error deleting group: ${error.message}`);
        return false;
    }
}

/**
 * Gets the CSRF Token embedded in the webpage
 */
function getCSRFToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]').value;
}

// EVENT LISTENERS

// Handle group selection
GROUP_SELECT.addEventListener('change', function () {
    const groupId = this.value;
    if (!groupId) {
        resetEditGroupForm();
        return;
    }

    const group = ALL_GROUPS.find((g) => g.id === Number(groupId));
    if (group) {
        populateEditGroupForm(group);
        showEditGroupForm();
    }
});

// Save group changes
GROUP_EDIT_FORM.addEventListener('submit', async (e) => {
    e.preventDefault();

    const groupId = GROUP_EDIT_ID.value;
    const groupName = GROUP_EDIT_NAME.value.trim();

    if (!groupName) {
        showEditFormErrors('Group name cannot be empty');
        return;
    }

    const updatedGroup = await updateGroup(groupId, groupName);

    if (updatedGroup) {
        // Update the select to show the new name
        GROUP_SELECT.value = updatedGroup.id;
        populateEditGroupForm(updatedGroup);
    }
});

// Delete group
GROUP_DELETE_BUTTON.addEventListener('click', async (e) => {
    e.preventDefault();

    if (
        !confirm(
            'Are you sure you want to delete this group? This action cannot be undone.',
        )
    ) {
        return;
    }

    const groupId = GROUP_EDIT_ID.value;
    const success = await deleteGroup(groupId);

    if (success) {
        resetEditGroupForm();
        GROUP_SELECT.value = '';
    }
});

// Cancel edit form
GROUP_CANCEL_BUTTON.addEventListener('click', (e) => {
    e.preventDefault();
    resetEditGroupForm();
    GROUP_SELECT.value = '';
});

// DELETE ACCOUNT MODAL
DELETE_ACCOUNT_BUTTON.addEventListener('click', () => {
    DELETE_ACCOUNT_MODAL.classList.toggle('hidden'); // show the modal
});

DELETE_ACCOUNT_CANCEL_BUTTON.addEventListener('click', () => {
    DELETE_ACCOUNT_MODAL.classList.toggle('hidden'); // hide the modal
});

DELETE_ACCOUNT_CONFIRM_BUTTON.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        const url = `/api/users/me/`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: { 'X-CSRFToken': getCSRFToken() },
        });
        if (!response.ok) {
            const data = await response.json();
            alert(`Unable to delete your account: ${data.detail}`);
        }
        // redirect to login page
        window.location.href = '/login/';
    } catch (error) {
        alert('Error occurred whilst deleting the account');
    }
});

document.addEventListener('DOMContentLoaded', getAllGroups);
