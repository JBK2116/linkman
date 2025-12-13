/*
This module stores the functionality for the `edit-link-form`
 */

import * as utils from "./utils.js";
import * as display_utils from "./display_utils.js";
import * as add_link_form from "./add_link_form.js";

// ============================================================================
// DOM ELEMENTS
// ============================================================================

const EDIT_LINK_FORM = document.getElementById("edit-link-form");
const EDIT_LINK_GROUP_DROPDOWN = document.getElementById("edit-group-dropdown");
const EDIT_LINK_FORM_ERRORS = document.getElementById("edit-link-form-errors");
const EDIT_LINK_NAME = document.getElementById("edit-link-name-input");
const EDIT_LINK_URL = document.getElementById("edit-link-url-input");
const EDIT_LINK_GROUP_INPUT = document.getElementById("edit-link-group-input");
const EDIT_LINK_GROUP_ID = document.getElementById("edit-link-group-id");
const EDIT_LINK_CANCEL_BUTTON = document.getElementById(
    "cancel-edit-link-form"
);
const EDIT_LINK_CANCEL_ICON = document.getElementById("close-edit-link-form");

// ============================================================================
// STATE
// ============================================================================

let editLinkCloseHandler = null;
let editGroupSelectorInitialized = false;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function validateEditLink(linkObj, newLinkName, newLinkURL, newLinkGroupID) {
    if (!newLinkGroupID) {
        // handle ""
        return "Group not found";
    }
    // check for changes
    const linkGroupID = linkObj.group_id || linkObj.group;
    if (
        linkObj.name === newLinkName &&
        linkObj.url === newLinkURL &&
        linkGroupID === Number(newLinkGroupID)
    ) {
        return "No changes detected";
    }
    // validate the new name and url
    const nameAndUrlResult = add_link_form.validateLinkForm(
        newLinkName,
        newLinkURL
    );
    if (nameAndUrlResult) {
        return nameAndUrlResult;
    }
    // validate that the user has chose a proper group
    const group = utils.getGroup(newLinkGroupID);
    if (!group) {
        return "Group not found";
    }
    return "";
}

/**
 * Resets all values in the `edit-link-modal`
 */
function resetEditLinkForm() {
    EDIT_LINK_NAME.value = "";
    EDIT_LINK_URL.value = "";
    EDIT_LINK_GROUP_INPUT.value = "";
    EDIT_LINK_GROUP_ID.value = "";
}

/**
 * Showcases an error string in the `edit-link-modal` form
 * @param errorStr Error message to display
 */
function showEditLinkError(errorStr) {
    if (EDIT_LINK_FORM_ERRORS.classList.contains("hidden")) {
        EDIT_LINK_FORM_ERRORS.classList.remove("hidden");
    }
    EDIT_LINK_FORM_ERRORS.innerHTML = `<p>${errorStr}</p>`;
}

/**
 * Removes all error strings in the `edit-link-modal` form
 */
function hideEditLinkErrors() {
    if (!EDIT_LINK_FORM_ERRORS.classList.contains("hidden")) {
        EDIT_LINK_FORM_ERRORS.classList.add("hidden");
    }
    EDIT_LINK_FORM_ERRORS.innerHTML = "";
}

// ============================================================================
// SETUP FUNCTIONS
// ============================================================================

/**
 * Handles the functionality for the `edit-group-dropdown`
 */
export function setUpEditGroupSelector() {
    if (editGroupSelectorInitialized) {
        return;
    }
    editGroupSelectorInitialized = true;
    EDIT_LINK_GROUP_INPUT.addEventListener("input", () => {
        const term = EDIT_LINK_GROUP_INPUT.value.trim().toLowerCase();
        if (term === "") {
            EDIT_LINK_GROUP_ID.value = "";
        }
        EDIT_LINK_GROUP_DROPDOWN.innerHTML = "";
        // find matching groups
        const matches = term
            ? utils.GROUPS.filter((g) => g.name.toLowerCase().includes(term))
            : utils.GROUPS;
        // no matches found
        if (matches.length === 0) {
            EDIT_LINK_GROUP_DROPDOWN.classList.add("hidden");
            return;
        }
        // show all matches
        EDIT_LINK_GROUP_DROPDOWN.classList.remove("hidden");
        // add all matches to the group dropdown
        for (const group of matches) {
            const option = document.createElement("div");
            option.className =
                "px-4 py-2 text-[#E0E0E0] cursor-pointer hover:bg-[#2A2A2A]";
            option.textContent = group.name;

            option.addEventListener("click", () => {
                EDIT_LINK_GROUP_INPUT.value = group.name;
                EDIT_LINK_GROUP_ID.value = group.id;
                EDIT_LINK_GROUP_DROPDOWN.classList.add("hidden");
            });

            EDIT_LINK_GROUP_DROPDOWN.appendChild(option);
        }
    });
    // show all groups when focusing the empty input
    EDIT_LINK_GROUP_INPUT.addEventListener("focus", () => {
        if (EDIT_LINK_GROUP_INPUT.value.trim() === "") {
            EDIT_LINK_GROUP_INPUT.dispatchEvent(new Event("input"));
        }
    });
    // hide the drop-down when clicked out of
    document.addEventListener("click", (e) => {
        if (
            !EDIT_LINK_GROUP_DROPDOWN.contains(e.target) &&
            e.target !== EDIT_LINK_GROUP_INPUT
        ) {
            EDIT_LINK_GROUP_DROPDOWN.classList.add("hidden");
        }
    });
}

/**
 * Handles the logic for closing the `edit-link-modal`
 * @param initialName Initial name of the link
 * @param initialURL Initial url of the link
 * @param initialGroupId Initial group associated with the link
 */
export function setUpEditLinkCloseHandlers(
    initialName,
    initialURL,
    initialGroupId
) {
    // track if an event listener is added to the cancel button
    if (editLinkCloseHandler) {
        EDIT_LINK_CANCEL_BUTTON.removeEventListener(editLinkCloseHandler);
        EDIT_LINK_CANCEL_ICON.removeEventListener(editLinkCloseHandler);
        editLinkCloseHandler = null;
    }
    const closeHandler = () => {
        if (
            EDIT_LINK_NAME.value !== initialName ||
            EDIT_LINK_URL.value !== initialURL ||
            EDIT_LINK_GROUP_ID.value !== initialGroupId
        ) {
            if (!confirm("Your changes may not be saved. Are you sure?")) {
                return; // User cancelled, keep modal open
            }
        }
        // close the modal
        resetEditLinkForm();
        utils.toggleElementVisibility("edit-link-modal");
        // clean up listeners
        EDIT_LINK_CANCEL_BUTTON.removeEventListener("click", closeHandler);
        EDIT_LINK_CANCEL_ICON.removeEventListener("click", closeHandler);
        editLinkCloseHandler = null;
    };
    // store the close handler reference so we can remove it later
    editLinkCloseHandler = closeHandler;
    // set up event listeners
    EDIT_LINK_CANCEL_BUTTON.addEventListener("click", closeHandler);
    EDIT_LINK_CANCEL_ICON.addEventListener("click", closeHandler);
}

/**
 * Sets up the edit link form functionality to work with the information of the provided link
 * @param link Link to edit
 */
export function setUpEditLinkForm(link) {
    // update the edit link form to store the id of this link card
    document.getElementById("edit-link-id").value = link.id;
    // initialize the starting values
    const currentLinkObj = utils.getLink(link.id);

    // pass down the initial name
    const initialName = currentLinkObj.name;
    const initialURL = currentLinkObj.url;
    const initialGroupId = currentLinkObj.group_id || currentLinkObj.group;

    // populate the form
    const nameInput = document.getElementById("edit-link-name-input");
    const urlInput = document.getElementById("edit-link-url-input");
    const groupInput = document.getElementById("edit-link-group-input");
    const groupIdInput = document.getElementById("edit-link-group-id");

    nameInput.value = initialName;
    urlInput.value = initialURL;
    groupIdInput.value = initialGroupId;
    groupInput.value = utils.getGroup(initialGroupId).name;

    // setup close event handlers
    setUpEditLinkCloseHandlers(initialName, initialURL, initialGroupId);

    // setup change group dropdown functionality
    setUpEditGroupSelector();

    // show the edit link form
    utils.toggleElementVisibility("edit-link-modal");
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

EDIT_LINK_FORM.addEventListener("submit", async function (e) {
    e.preventDefault();
    // retrieve the updated values

    const currentLinkID = document.getElementById("edit-link-id").value;
    const link = utils.getLink(currentLinkID);
    const newLinkName = EDIT_LINK_NAME.value;
    const newLinkURL = EDIT_LINK_URL.value;
    const newLinkGroupID = EDIT_LINK_GROUP_ID.value;

    // validate the form
    const validationResult = validateEditLink(
        link,
        newLinkName,
        newLinkURL,
        newLinkGroupID
    );
    if (validationResult) {
        showEditLinkError(validationResult);
        return;
    }
    // form is valid by now
    hideEditLinkErrors();
    const payload = {
        id: link.id,
        link_name: newLinkName,
        link_url: newLinkURL,
        group_id: Number(newLinkGroupID),
        for_clicked: false,
    };
    const url = `/api/links/${link.id}/`;
    const csrfToken = utils.getCSRFToken();
    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken,
            },
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) {
            showEditLinkError(data.detail);
            return;
        }
        const updateResult = utils.replaceLink(data.link.id, data.link);
        if (!updateResult) {
            showEditLinkError("Error occurred updating the link");
            return;
        }
        display_utils.updateLinkCard(data.link);
        alert(`Link successfully updated!`);
        resetEditLinkForm();
        utils.toggleElementVisibility("edit-link-modal");

        if (editLinkCloseHandler) {
            // remove the cancel button event listeners
            EDIT_LINK_CANCEL_BUTTON.removeEventListener(
                "click",
                editLinkCloseHandler
            );
            EDIT_LINK_CANCEL_ICON.removeEventListener(
                "click",
                editLinkCloseHandler
            );
            editLinkCloseHandler = null;
        }
    } catch (error) {
        console.log(`Error updating link: ${error.message}`);
    }
});

