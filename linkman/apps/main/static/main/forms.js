/*
This javascript file handles the forms functionality in the `main.js` file
 */
import * as utils from "./utils.js";

// CONSTANTS
const ADD_GROUP_BUTTON = document.getElementById("add-group-button");
const GROUP_FORM = document.getElementById("group-form");
const GROUP_NAME_INPUT = document.getElementById("group-name-input");
const GROUP_FORM_CANCEL_BUTTON = document.getElementById("cancel-group-form");
const GROUP_FORM_CANCEL_ICON = document.getElementById("close-group-form");
const GROUP_FORM_ERRORS = document.getElementById("group-form-errors");

const ADD_LINK_BUTTON = document.getElementById("add-link-button");
const LINK_FORM = document.getElementById("link-form");
const LINK_FORM_NAME_INPUT = document.getElementById("link-name-input");
const LINK_FORM_URL_INPUT = document.getElementById("link-url-input");
const LINK_FORM_GROUP_INPUT = document.getElementById("link-group-input");
const LINK_FORM_GROUP_DROPDOWN = document.getElementById("group-dropdown");
const LINK_FORM_GROUP_HIDDEN = document.getElementById("link-group-id");
const LINK_FORM_CANCEL_BUTTON = document.getElementById("cancel-link-form");
const LINK_FORM_CANCEL_ICON = document.getElementById("close-link-form");
const LINK_FORM_ERRORS = document.getElementById("link-form-errors");

const EDIT_LINK_FORM = document.getElementById("edit-link-form");
const EDIT_LINK_GROUP_DROPDOWN = document.getElementById("edit-group-dropdown");
const EDIT_LINK_FORM_ERRORS = document.getElementById("edit-link-form-errors");
const EDIT_LINK_NAME = document.getElementById("edit-link-name-input");
const EDIT_LINK_URL = document.getElementById("edit-link-url-input");
const EDIT_LINK_GROUP_INPUT = document.getElementById("edit-link-group-input");
const EDIT_LINK_GROUP_ID = document.getElementById("edit-link-group-id");
const EDIT_LINK_SAVE_BUTTON = document.getElementById("edit-link-form-submit");
const EDIT_LINK_CANCEL_BUTTON = document.getElementById("cancel-edit-link-form");
const EDIT_LINK_CANCEL_ICON = document.getElementById("close-edit-link-form");
let editGroupSelectorInitialized = false;
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
        alert(`Group successfully created!`);
        utils.GROUPS.push(data.group);
        resetGroupForm();
        utils.toggleElementVisibility("group-form-modal");
    } catch (error) {
        alert("An error occurred creating the group");
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
            resetGroupForm();
            utils.toggleElementVisibility("group-form-modal");
        }
    }
}

/**
 * Resets all values in the `group form modal`
 */
function resetGroupForm() {
    GROUP_NAME_INPUT.value = "";
    if (!GROUP_FORM_ERRORS.classList.contains("hidden")) {
        GROUP_FORM_ERRORS.classList.add("hidden");
    }
    GROUP_FORM_ERRORS.innerHTML = "";
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
LINK_FORM.addEventListener("submit", async (e) => {
    e.preventDefault();
    const url = LINK_FORM.action
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
function validateLinkForm(name, url) {
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

/**
 * Deletes the provided Link
 * @param link Link to delete
 * @param linkCard Link's DOM element to remove
 * @returns {Promise<void>}
 */
export async function deleteLinkAPI(link, linkCard) {
    const url = `/api/links/${link.id}/`
    const csrfToken = utils.getCSRFToken();
    try {
        const response = await fetch(url, {
            method: "DELETE",
            headers: {"X-CSRFToken": csrfToken},
        })
        // handle error response
        if (!response.ok) {
            alert(`Error occurred deleting the link`);
            return;
        }
        utils.deleteLinkFromList(link.id);
        linkCard.remove();
        alert(`Link successfully deleted!`);
    } catch (error) {
        console.log(`Error deleting link: ${link}`);
    }
}


EDIT_LINK_FORM.addEventListener("submit", async function (e) {
    e.preventDefault();
    // retrieve the updated values

    const currentLinkID = document.getElementById("edit-link-id").value;
    const link = utils.getLink(currentLinkID);
    const newLinkName = EDIT_LINK_NAME.value;
    const newLinkURL = EDIT_LINK_URL.value;
    const newLinkGroupID = EDIT_LINK_GROUP_ID.value;

    // validate the form
    const validationResult = validateEditLink(link, newLinkName, newLinkURL, newLinkGroupID);
    if (validationResult) {
        showEditLinkError(validationResult);
        return;
    }
    // form is valid by now
    hideEditLinkErrors()
    const payload = {
        "id": link.id,
        "link_name": newLinkName,
        "link_url": newLinkURL,
        "group_id": Number(newLinkGroupID),
        "for_clicked": false,
    };
    const url = `/api/links/${link.id}/`;
    const csrfToken = utils.getCSRFToken();
    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {"Content-Type": "application/json", "X-CSRFToken": csrfToken},
            body: JSON.stringify(payload),
        })
        const data = await response.json();
        if (!response.ok) {
            showEditLinkError(data.detail);
            return;
        }
        const updateResult = utils.replaceLink(data.link.id, data.link);
        console.log(updateResult)
        if (!updateResult) {
            showEditLinkError("Error occurred updating the link");
            return;
        }
        utils.updateLinkCard(data.link)
        alert(`Link successfully updated!`);
        resetEditLinkForm();
        utils.toggleElementVisibility("edit-link-modal")
    } catch (error) {
        console.log(`Error updating link: ${link}`);
    }


})

function validateEditLink(linkObj, newLinkName, newLinkURL, newLinkGroupID) {
    if (!newLinkGroupID) {
        // handle ""
        return "Group not found";
    }
    // check for changes
    if (linkObj.name === newLinkName && linkObj.url === newLinkURL && linkObj.group_id === Number(newLinkGroupID)) {
        return "No changes detected"
    }
    // validate the new name and url
    const nameAndUrlResult = validateLinkForm(newLinkName, newLinkURL);
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
            ? utils.GROUPS.filter(g => g.name.toLowerCase().includes(term))
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
            option.className = "px-4 py-2 text-[#E0E0E0] cursor-pointer hover:bg-[#2A2A2A]";
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
        if (!EDIT_LINK_GROUP_DROPDOWN.contains(e.target) && e.target !== EDIT_LINK_GROUP_INPUT) {
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
export function setUpEditLinkCloseHandlers(initialName, initialURL, initialGroupId) {
    const closeHandler = () => {
        if (EDIT_LINK_NAME.value !== initialName ||
            EDIT_LINK_URL.value !== initialURL ||
            EDIT_LINK_GROUP_ID.value !== initialGroupId) {

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
    }
    // set up event listeners
    EDIT_LINK_CANCEL_BUTTON.addEventListener("click", closeHandler);
    EDIT_LINK_CANCEL_ICON.addEventListener("click", closeHandler);
}


/**
 * Resets all values in the `edit-link-modal`
 */
export function resetEditLinkForm() {
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