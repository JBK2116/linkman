/*
This module stores the functionality for the `link-form-modal`
 */

import * as utils from './utils.js';
import * as display_utils from './display_utils.js';

// ============================================================================
// DOM ELEMENTS
// ============================================================================

const ADD_LINK_BUTTON = document.getElementById('add-link-button');
const ADD_LINK_FORM = document.getElementById('link-form');
const LINK_FORM_NAME_INPUT = document.getElementById('link-name-input');
const LINK_FORM_URL_INPUT = document.getElementById('link-url-input');
const LINK_FORM_GROUP_SELECT = document.getElementById('link-group-select');
const LINK_FORM_CANCEL_BUTTON = document.getElementById('cancel-link-form');
const LINK_FORM_CANCEL_ICON = document.getElementById('close-link-form');
const LINK_FORM_ERRORS = document.getElementById('link-form-errors');

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validates the `link-form-modal`
 * @param name Link name to validate
 * @param url Link url to validate
 * @returns {string} Error string if validation failed, else empty string
 */
export function validateLinkForm(name, url) {
    // validate the name
    name = name.trim();
    if (name.length > 50) {
        return 'Link name must be less than 50 characters.';
    }
    if (name.length <= 0) {
        return 'Link name required';
    }
    // validate the url
    url = url.trim();
    if (url.length > 2000) {
        return 'Link url must be less than 2000 characters';
    }
    if (url.length <= 0) {
        return 'Link url required';
    }
    return '';
}

/**
 * Populates the group select element with available groups
 */
export function populateGroupSelect() {
    LINK_FORM_GROUP_SELECT.innerHTML =
        '<option value="">Select a group...</option>';
    utils.GROUPS.forEach((group) => {
        const option = document.createElement('option');
        option.value = group.id;
        option.textContent = group.name;
        LINK_FORM_GROUP_SELECT.appendChild(option);
    });
}

/**
 * Resets all data in the `link form`
 */
export function resetLinkForm() {
    // reset the form values
    LINK_FORM_NAME_INPUT.value = '';
    LINK_FORM_URL_INPUT.value = '';
    LINK_FORM_GROUP_SELECT.value = '';
    // reset the form errors display
    if (!LINK_FORM_ERRORS.classList.contains('hidden')) {
        LINK_FORM_ERRORS.classList.add('hidden');
    }
    LINK_FORM_ERRORS.innerHTML = '';
}

/**
 * Handles the logic for closing the add link form
 */
export function closeLinkForm() {
    const formIsEmpty =
        LINK_FORM_NAME_INPUT.value.trim().length <= 0 &&
        LINK_FORM_URL_INPUT.value.trim().length <= 0;
    if (formIsEmpty) {
        utils.toggleElementVisibility('link-form-modal');
    } else {
        const result = confirm(
            'Your form data may not be saved. Are you sure?',
        );
        if (result) {
            resetLinkForm();
            utils.toggleElementVisibility('link-form-modal');
        }
    }
}

/**
 * Opens the add link modal. Resetting it's state completely in the process.
 */
export function openAddLinkForm() {
    console.log('function called');
    // show modal
    utils.toggleElementVisibility('link-form-modal');
    // reset fields and errors
    resetLinkForm();
    // populate group dropdown
    populateGroupSelect();
    LINK_FORM_NAME_INPUT.focus();
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

// LINK FORM VISIBILITY
ADD_LINK_BUTTON.addEventListener('click', () => {
    // show the form
    utils.toggleElementVisibility('link-form-modal');
    LINK_FORM_NAME_INPUT.focus();
    // populate the group select
    populateGroupSelect();
});

// LINK FORM SUBMIT FUNCTIONALITY
ADD_LINK_FORM.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = ADD_LINK_FORM.action;
    const csrfToken = utils.getCSRFToken();
    const linkName = LINK_FORM_NAME_INPUT.value.trim();
    const linkURL = LINK_FORM_URL_INPUT.value.trim();
    const groupID = LINK_FORM_GROUP_SELECT.value;
    const validationResult = validateLinkForm(linkName, linkURL);
    // validation failed
    if (validationResult) {
        LINK_FORM_ERRORS.classList.remove('hidden');
        LINK_FORM_ERRORS.innerHTML = `<p>${validationResult}</p>`;
        return;
    }
    // get the associated group object
    const group = utils.getGroup(groupID);
    if (!group) {
        LINK_FORM_ERRORS.classList.remove('hidden');
        LINK_FORM_ERRORS.innerHTML = `<p>Unable to find the selected group</p>`;
        return;
    }
    // all data is valid by now
    const payload = {
        link_name: linkName,
        link_url: linkURL,
        group_id: group.id,
    };
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
        // handle error response
        if (!response.ok) {
            if (LINK_FORM_ERRORS.classList.contains('hidden')) {
                LINK_FORM_ERRORS.classList.remove('hidden');
            }
            LINK_FORM_ERRORS.innerHTML = `<p>${data.detail}</p>`;
            return;
        }
        // handle successful response
        alert(`Link successfully created!`);
        utils.LINKS.push(data.link);
        resetLinkForm();
        utils.toggleElementVisibility('link-form-modal');
        display_utils.reloadLinksDisplay();
    } catch (error) {
        alert('An error occurred creating the link');
        console.log(`Error creating link: ${error}`);
    }
});

// LINK FORM CANCEL FUNCTIONALITY
LINK_FORM_CANCEL_BUTTON.addEventListener('click', () => {
    closeLinkForm();
});
LINK_FORM_CANCEL_ICON.addEventListener('click', () => {
    closeLinkForm();
});

// ARROW KEY NAVIGATION IN LINK FORM
ADD_LINK_FORM.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const formElements = [
        LINK_FORM_NAME_INPUT,
        LINK_FORM_URL_INPUT,
        LINK_FORM_GROUP_SELECT,
    ];
    const currentIndex = formElements.indexOf(document.activeElement);
    if (currentIndex === -1) return;
    let nextIndex;
    if (e.key === 'ArrowDown') {
        nextIndex = (currentIndex + 1) % formElements.length;
    } else {
        nextIndex =
            (currentIndex - 1 + formElements.length) % formElements.length;
    }
    formElements[nextIndex].focus();
});
