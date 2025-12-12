/*
This module stores the functionality for the `link-form-modal`
 */

import * as utils from "./utils.js";

const ADD_LINK_BUTTON = document.getElementById("add-link-button");
const Add_link_form = document.getElementById("link-form");
const LINK_FORM_NAME_INPUT = document.getElementById("link-name-input");
const LINK_FORM_URL_INPUT = document.getElementById("link-url-input");
const LINK_FORM_GROUP_INPUT = document.getElementById("link-group-input");
const LINK_FORM_GROUP_DROPDOWN = document.getElementById("group-dropdown");
const LINK_FORM_GROUP_HIDDEN = document.getElementById("link-group-id");
const LINK_FORM_CANCEL_BUTTON = document.getElementById("cancel-link-form");
const LINK_FORM_CANCEL_ICON = document.getElementById("close-link-form");
const LINK_FORM_ERRORS = document.getElementById("link-form-errors");

// LINK FORM VISIBILITY
ADD_LINK_BUTTON.addEventListener("click", () => {
    // show the form
    utils.toggleElementVisibility("link-form-modal");
    // initialize the group options
    LINK_FORM_GROUP_INPUT.value = "";
    LINK_FORM_GROUP_HIDDEN.value = "";

})

// LINK FORM GROUP SEARCH FUNCTIONALITY
LINK_FORM_GROUP_INPUT.addEventListener('focus', () => {
    LINK_FORM_GROUP_DROPDOWN.innerHTML = utils.GROUPS.map(g =>
        `<div class="px-4 py-2 hover:bg-[#2A2A2A] text-[#E0E0E0] cursor-pointer" data-id="${g.id}">${g.name}</div>`
    ).join('');
    LINK_FORM_GROUP_DROPDOWN.classList.remove('hidden');
});

LINK_FORM_GROUP_INPUT.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = utils.GROUPS.filter(g => g.name.toLowerCase().includes(query));

    LINK_FORM_GROUP_DROPDOWN.innerHTML = filtered.map(g =>
        `<div class="px-4 py-2 hover:bg-[#2A2A2A] text-[#E0E0E0] cursor-pointer" data-id="${g.id}">${g.name}</div>`
    ).join('');

    LINK_FORM_GROUP_DROPDOWN.classList.toggle('hidden', filtered.length === 0);
});

LINK_FORM_GROUP_DROPDOWN.addEventListener('click', (e) => {
    if (e.target.dataset.id) {
        LINK_FORM_GROUP_INPUT.value = e.target.textContent;
        LINK_FORM_GROUP_HIDDEN.value = e.target.dataset.id;
        LINK_FORM_GROUP_DROPDOWN.classList.add('hidden');
    }
});

LINK_FORM_GROUP_INPUT.addEventListener('blur', () => {
    setTimeout(() => LINK_FORM_GROUP_DROPDOWN.classList.add('hidden'), 200);
});
// LINK FORM SUBMIT FUNCTIONALITY
Add_link_form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const url = Add_link_form.action
    const csrfToken = utils.getCSRFToken();
    const linkName = LINK_FORM_NAME_INPUT.value.trim();
    const linkURL = LINK_FORM_URL_INPUT.value.trim();
    const groupID = LINK_FORM_GROUP_HIDDEN.value
    const validationResult = validateLinkForm(linkName, linkURL);
    // validation failed
    if (validationResult) {
        LINK_FORM_ERRORS.classList.remove("hidden");
        LINK_FORM_ERRORS.innerHTML = `<p>${validationResult}</p>`;
        return;
    }
    // get the associated group object
    const group = utils.getGroup(groupID);
    if (!group) {
        LINK_FORM_ERRORS.innerHTML = `<p>Unable to find the selected group</p>`;
        return;
    }
    // all data is valid by now
    const payload = {"link_name": linkName, "link_url": linkURL, "group_id": group.id};
    try {
        const response = await fetch(url, {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {"Content-Type": "application/json", "X-CSRFToken": csrfToken},
        })
        const data = await response.json();
        // handle error response
        if (!response.ok) {
            if (GROUP_FORM_ERRORS.classList.contains("hidden")) {
                GROUP_FORM_ERRORS.classList.remove("hidden");
            }
            GROUP_FORM_ERRORS.innerHTML = `<p>${response.detail}</p>`;
            return;
        }
        // handle successful response
        alert(`Link successfully created!`);
        utils.LINKS.push(data.link);
        resetLinkForm();
        utils.toggleElementVisibility("link-form-modal");
    } catch (error) {
        alert("An error occurred creating the link");
        console.log(`Error creating link: ${error}`);
    }
})


// LINK FORM CANCEL FUNCTIONALITY
LINK_FORM_CANCEL_BUTTON.addEventListener("click", () => {
    closeLinkForm();
})
LINK_FORM_CANCEL_ICON.addEventListener("click", () => {
    closeLinkForm();
})

/**
 * Handles the logic for closing the add link form
 */
function closeLinkForm() {
    const formIsEmpty = LINK_FORM_NAME_INPUT.value.trim().length <= 0 && LINK_FORM_URL_INPUT.value.trim().length <= 0;
    if (formIsEmpty) {
        utils.toggleElementVisibility("link-form-modal");
    } else {
        const result = confirm("Your form data may not be saved. Are you sure?");
        if (result) {
            resetLinkForm();
            utils.toggleElementVisibility("link-form-modal");
        }
    }
}

/**
 * Resets all data in the `link form`
 */
function resetLinkForm() {
    // reset the form values
    LINK_FORM_NAME_INPUT.value = "";
    LINK_FORM_URL_INPUT.value = "";
    LINK_FORM_GROUP_INPUT.innerHTML = "";
    // reset the form errors display
    if (!LINK_FORM_ERRORS.classList.contains("hidden")) {
        LINK_FORM_ERRORS.classList.add("hidden");
    }
    LINK_FORM_ERRORS.innerHTML = "";
}

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
        return "Link name must be less than 50 characters.";
    }
    if (name.length <= 0) {
        return "Link name required"
    }
    // validate the url
    url = url.trim();
    if (url.length > 2000) {
        return "Link url must be less than 2000 characters"
    }
    if (url.length <= 0) {
        return "Link url required"
    }
    return ""
}
