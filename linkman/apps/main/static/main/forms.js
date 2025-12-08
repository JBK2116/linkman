/*
This javascript file handles the forms functionality in the `main.js` file
 */
import * as utils from "./utils.js";

// CONSTANTS
const ADD_GROUP_BUTTON = document.getElementById("add-group-button");
const GROUP_FORM_MODAL = document.getElementById("group-form-modal");
const GROUP_FORM = document.getElementById("group-form");
const GROUP_NAME_INPUT = document.getElementById("group-name-input");
const GROUP_FORM_CANCEL_BUTTON = document.getElementById("cancel-group-form");
const GROUP_FORM_CANCEL_ICON = document.getElementById("close-group-form");
const GROUP_FORM_ERRORS = document.getElementById("group-form-errors");

const ADD_LINK_BUTTON = document.getElementById("add-link-button");
const LINK_FORM_MODAL = document.getElementById("link-form-modal");
const LINK_FORM = document.getElementById("link-form");
const LINK_FORM_CANCEL = document.getElementById("link-form-cancel");
const LINK_FORM_ERRORS = document.getElementById("link-form-errors");

// GROUP FORM VISIBILITY
ADD_GROUP_BUTTON.addEventListener("click", () => {
    utils.toggleElementVisibility("group-form-modal");
})
// GROUP FORM CANCEL BUTTONS
GROUP_FORM_CANCEL_ICON.addEventListener("click", closeGroupForm)
GROUP_FORM_CANCEL_BUTTON.addEventListener("click", closeGroupForm)

// GROUP FORM SUBMIT FUNCTIONALITY
GROUP_FORM.addEventListener("submit", async (e) => {
    e.preventDefault();
    // form values
    const url = GROUP_FORM.action
    const csrfToken = utils.getCSRFToken();
    const groupName = GROUP_NAME_INPUT.value.trim();
    const payload = {"group_name": groupName}
    // validate the group name
    const validationResult = validateGroupName(groupName);
    if (validationResult) {
        GROUP_FORM_ERRORS.classList.remove("hidden");
        GROUP_FORM_ERRORS.innerHTML = `<p>${validationResult}</p>`;
        return;
    }
    // hide fixed errors
    if (!GROUP_FORM_ERRORS.classList.contains("hidden")) {
        GROUP_FORM_ERRORS.classList.add("hidden");
    }
    try {
        const response = await fetch(url, {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {"Content-Type": "application/json", "X-CSRFToken": csrfToken},
        })
        const data = await response.json();
        if (!response.ok) {
            // showcase the error message sent from the backend
            if (GROUP_FORM_ERRORS.classList.contains("hidden")) {
                GROUP_FORM_ERRORS.classList.remove("hidden");
            }
            GROUP_FORM_ERRORS.innerHTML = `<p>${data.detail}</p>`;
            GROUP_FORM_ERRORS.classList.remove("hidden");
            return;
        }
        // POST was successful
        alert(`Link successfully created!`);
        utils.LINKS.push(data.group);
    } catch (error) {
        console.log(`Error creating group: ${error}`);
    }
});


/**
 * Handles the logic for closing the group form
 */
function closeGroupForm() {
    const formIsEmpty = GROUP_NAME_INPUT.value.trim().length <= 0;
    if (formIsEmpty) {
        utils.toggleElementVisibility("group-form-modal");
    } else {
        let result = confirm("Your form data may not be saved. Are you sure?")
        if (result) {
            // reset the forms value
            GROUP_NAME_INPUT.value = "";
            // reset the forms errors
            if (!GROUP_FORM_ERRORS.classList.contains("hidden")) {
                GROUP_FORM_ERRORS.classList.add("hidden");
            }
            GROUP_FORM_ERRORS.innerHTML = "";
            utils.toggleElementVisibility("group-form-modal");
        }
    }
}

/**
 * Validates the provided group name
 * @param name Name to validate
 * @returns {string} Error reason if validation fails, else empty string
 */
function validateGroupName(name) {
    // ensure that name is not empty
    name = name.trim();
    if (!name) {
        return "Group name is required.";
    }
    // ensure that name is not too long
    if (name.length >= 50) {
        return "Group name must be less than 50 characters.";
    }
    return "";
}
