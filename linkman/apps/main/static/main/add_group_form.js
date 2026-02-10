/*
This module stores the functionality for the `group-form-modal`
 */
import * as utils from './utils.js';

// ============================================================================
// DOM ELEMENTS
// ============================================================================

const ADD_GROUP_BUTTON = document.getElementById('add-group-button');
const Add_group_form = document.getElementById('group-form');
const GROUP_NAME_INPUT = document.getElementById('group-name-input');
const GROUP_FORM_CANCEL_BUTTON = document.getElementById('cancel-group-form');
const GROUP_FORM_CANCEL_ICON = document.getElementById('close-group-form');
const GROUP_FORM_ERRORS = document.getElementById('group-form-errors');

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validates the provided group name
 * @param name Name to validate
 * @returns {string} Error reason if validation fails, else empty string
 */
function validateGroupName(name) {
    // ensure that name is not empty
    name = name.trim();
    if (!name) {
        return 'Group name is required.';
    }
    // ensure that name is not too long
    if (name.length >= 50) {
        return 'Group name must be less than 50 characters.';
    }
    return '';
}

/**
 * Resets all values in the `group form modal`
 */
export function resetGroupForm() {
    GROUP_NAME_INPUT.value = '';
    if (!GROUP_FORM_ERRORS.classList.contains('hidden')) {
        GROUP_FORM_ERRORS.classList.add('hidden');
    }
    GROUP_FORM_ERRORS.innerHTML = '';
}

/**
 * Handles the logic for closing the group form
 */
export function closeGroupForm() {
    const formIsEmpty = GROUP_NAME_INPUT.value.trim().length <= 0;
    if (formIsEmpty) {
        utils.toggleElementVisibility('group-form-modal');
    } else {
        let result = confirm('Your form data may not be saved. Are you sure?');
        if (result) {
            resetGroupForm();
            utils.toggleElementVisibility('group-form-modal');
        }
    }
}
/**
 * Opens the add group form. Resetting it's state completely in the process
 */
export function openAddGroupForm() {
    // Make sure the modal is visible
    utils.toggleElementVisibility('group-form-modal');

    // Reset input and errors
    GROUP_NAME_INPUT.value = '';
    GROUP_FORM_ERRORS.innerHTML = '';
    GROUP_FORM_ERRORS.classList.add('hidden');

    // Focus the group name input for immediate typing
    GROUP_NAME_INPUT.focus();
}
// ============================================================================
// EVENT LISTENERS
// ============================================================================

// GROUP FORM VISIBILITY
ADD_GROUP_BUTTON.addEventListener('click', () => {
    utils.toggleElementVisibility('group-form-modal');
});

// GROUP FORM CANCEL BUTTONS
GROUP_FORM_CANCEL_ICON.addEventListener('click', closeGroupForm);
GROUP_FORM_CANCEL_BUTTON.addEventListener('click', closeGroupForm);

// GROUP FORM SUBMIT FUNCTIONALITY
Add_group_form.addEventListener('submit', async (e) => {
    e.preventDefault();
    // form values
    const url = Add_group_form.action;
    const csrfToken = utils.getCSRFToken();
    const groupName = GROUP_NAME_INPUT.value.trim();
    const payload = { group_name: groupName };
    // validate the group name
    const validationResult = validateGroupName(groupName);
    if (validationResult) {
        GROUP_FORM_ERRORS.classList.remove('hidden');
        GROUP_FORM_ERRORS.innerHTML = `<p>${validationResult}</p>`;
        return;
    }
    // hide fixed errors
    if (!GROUP_FORM_ERRORS.classList.contains('hidden')) {
        GROUP_FORM_ERRORS.classList.add('hidden');
    }
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
        });
        const data = await response.json();
        if (!response.ok) {
            // showcase the error message sent from the backend
            if (GROUP_FORM_ERRORS.classList.contains('hidden')) {
                GROUP_FORM_ERRORS.classList.remove('hidden');
            }
            GROUP_FORM_ERRORS.innerHTML = `<p>${data.detail}</p>`;
            GROUP_FORM_ERRORS.classList.remove('hidden');
            return;
        }
        // POST was successful
        alert(`Group successfully created!`);
        utils.GROUPS.push(data.group);
        resetGroupForm();
        utils.toggleElementVisibility('group-form-modal');
    } catch (error) {
        alert('An error occurred creating the group');
        console.log(`Error creating group: ${error}`);
    }
});
