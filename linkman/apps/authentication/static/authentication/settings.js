// GROUP SEARCH FUNCTIONALITY

const GROUP_SEARCH_INPUT = document.getElementById("group-search-input");
const GROUP_SEARCH_DROPDOWN = document.getElementById("group-search-dropdown");
const GROUP_EDIT_FORM_CONTAINER = document.getElementById("group-edit-form-container");
const GROUP_EDIT_FORM = document.getElementById("group-edit-form");
const GROUP_EDIT_FORM_ERRORS = document.getElementById("group-edit-errors");
const GROUP_DELETE_BUTTON = document.getElementById("group-delete-btn");
const GROUP_CANCEL_BUTTON = document.getElementById("group-cancel-btn");
const GROUP_EMPTY_STATE = document.getElementById("group-empty-state");

// Form fields
const GROUP_EDIT_ID = document.getElementById("group-edit-id");
const GROUP_EDIT_NAME = document.getElementById("group-edit-name");
const GROUP_EDIT_CREATED = document.getElementById("group-edit-created");

// DELETE ACCOUNT FUNCTIONALITY
const DELETE_ACCOUNT_MODAL = document.getElementById("delete-account-modal");
const DELETE_ACCOUNT_CANCEL_BUTTON = document.getElementById("cancel-delete-account");
const DELETE_ACCOUNT_CONFIRM_BUTTON = document.getElementById("confirm-delete-account");
const DELETE_ACCOUNT_BUTTON = document.getElementById("delete-account-btn");

// VARIABLES
const ALL_GROUPS = [];
let CURRENT_SELECTED_GROUP = null;

const fuseOptions = {
    keys: ["name"],
    threshold: 0.3,
    ignoreLocation: true,
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2,
};

const debouncedSearch = debounce(() => {
    const query = GROUP_SEARCH_INPUT.value.trim();
    if (!query) {
        hideGroupDropdown();
        return;
    }
    hideEmptyGroupState();
    const fuseObj = new Fuse(ALL_GROUPS, fuseOptions);
    const results = fuseObj.search(query);

    GROUP_SEARCH_DROPDOWN.innerHTML = "";

    if (results.length > 0) {
        showGroupDropdown();
        results.forEach((result) => {
            const card = createGroupCard(result.item);
            GROUP_SEARCH_DROPDOWN.appendChild(card);
        });
    } else {
        hideGroupDropdown();
    }
}, 300);

/**
 * Debounce function that executes the provided callback after `wait` milliseconds have elapsed
 */
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

/**
 * Retrieves all the groups that belong to the logged-in user
 */
async function getAllGroups() {
    try {
        const response = await fetch("/api/groups", {
            method: "GET",
        });
        const data = await response.json();
        if (!response.ok) {
            console.log(`Unable to fetch all groups: ${data.detail}`);
            return;
        }
        data.groups.forEach((item) => {
            ALL_GROUPS.push(item);
        });
    } catch (error) {
        console.log(`Error occurred fetching all groups: ${error}`);
    }
}

/**
 * Creates a Group Card to display in the `GROUP_SEARCH_DROPDOWN`
 */
function createGroupCard(group) {
    const card = document.createElement("div");
    card.innerHTML = `
        <div
            class="group-item px-4 py-2 cursor-pointer hover:bg-[#2A2A2A] text-[#E0E0E0]"
            data-group-id="${group.id}"
            data-group-name="${group.name}"
            data-group-created="${group.created_at}"
        >
            <span class="block text-sm font-medium">${group.name}</span>
            <span class="block text-xs text-[#888888]">
                Created: ${formatTime(group.created_at)}
            </span>
        </div>
    `;

    card.addEventListener("click", (e) => {
        e.preventDefault();
        populateEditGroupForm(group);
        showEditGroupForm();
        hideGroupDropdown();
    });

    return card;
}

const options = {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
};
const locales = "en-US";

function formatTime(datetime) {
    const newDate = new Date(datetime);
    return newDate.toLocaleDateString(locales, options);
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
    GROUP_EDIT_FORM_CONTAINER.classList.remove("hidden");
    GROUP_EMPTY_STATE.classList.add("hidden");
}

/**
 * Hides the edit group form
 */
function hideEditGroupForm() {
    GROUP_EDIT_FORM_CONTAINER.classList.add("hidden");
    GROUP_EMPTY_STATE.classList.remove("hidden");
}

/**
 * Shows the `GROUP_SEARCH_DROPDOWN`
 */
function showGroupDropdown() {
    GROUP_SEARCH_DROPDOWN.classList.remove("hidden");
}

/**
 * Hides the `GROUP_SEARCH_DROPDOWN`
 */
function hideGroupDropdown() {
    GROUP_SEARCH_DROPDOWN.classList.add("hidden");
}

/**
 * Shows errors in the edit form
 */
function showEditFormErrors(message) {
    GROUP_EDIT_FORM_ERRORS.textContent = message;
    GROUP_EDIT_FORM_ERRORS.classList.remove("hidden");
}

/**
 * Hides errors in the edit form
 */
function hideEditFormErrors() {
    GROUP_EDIT_FORM_ERRORS.classList.add("hidden");
    GROUP_EDIT_FORM_ERRORS.textContent = "";
}

/**
 * Shows the `GROUP_EMPTY_STAGE`
 */

/**
 * Hides the `GROUP_EMPTY_STATE`
 */
function hideEmptyGroupState() {
    if (!GROUP_EMPTY_STATE.classList.contains("hidden")) {
        GROUP_EMPTY_STATE.classList.add("hidden");
    }
}

/**
 * Resets the edit group form
 */
function resetEditGroupForm() {
    CURRENT_SELECTED_GROUP = null;
    GROUP_EDIT_FORM.reset();
    GROUP_EDIT_ID.value = "";
    GROUP_EDIT_NAME.value = "";
    GROUP_EDIT_CREATED.textContent = "-";
    hideEditFormErrors();
    hideEditGroupForm();
}

/**
 * Updates a group via API
 */
async function updateGroup(groupId, groupName) {
    try {
        const response = await fetch(`/api/groups/${groupId}/`, {
            method: "PATCH", headers: {
                "Content-Type": "application/json", "X-CSRFToken": getCSRFToken(),
            }, body: JSON.stringify({name: groupName}),
        });
        // handle invalid responses
        const data = await response.json();
        if (!response.ok) {
            showEditFormErrors(data.detail || "Failed to update group");
            return null;
        }
        // Update local GROUPS array
        const groupIndex = ALL_GROUPS.findIndex((g) => g.id === data.group.id);
        if (groupIndex !== -1) {
            ALL_GROUPS[groupIndex] = data.group;
        }
        alert("Group updated");
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
            method: "DELETE", headers: {
                "X-CSRFToken": getCSRFToken(),
            },
        });
        // handle invalid responses
        if (!response.ok) {
            const data = await response.json();
            showEditFormErrors(data.detail || "Failed to delete group");
            return false;
        }
        // Remove from local GROUPS array
        const groupIndex = ALL_GROUPS.findIndex((g) => g.id === Number(groupId));
        if (groupIndex !== -1) {
            ALL_GROUPS.splice(groupIndex, 1);
        }
        // reset the dropdown
        GROUP_SEARCH_DROPDOWN.innerHTML = "";
        hideGroupDropdown();
        alert("Group deleted");
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
    return document.querySelector("[name=csrfmiddlewaretoken]").value;
}

// EVENT LISTENERS

GROUP_SEARCH_INPUT.addEventListener("input", debouncedSearch);

// Save group changes
GROUP_EDIT_FORM.addEventListener("submit", async (e) => {
    e.preventDefault();

    const groupId = GROUP_EDIT_ID.value;
    const groupName = GROUP_EDIT_NAME.value.trim();

    if (!groupName) {
        showEditFormErrors("Group name cannot be empty");
        return;
    }

    const updatedGroup = await updateGroup(groupId, groupName);

    if (updatedGroup) {
        resetEditGroupForm();
        GROUP_SEARCH_INPUT.value = "";
    }
});

// Delete group
GROUP_DELETE_BUTTON.addEventListener("click", async (e) => {
    e.preventDefault();

    if (!confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
        return;
    }

    const groupId = GROUP_EDIT_ID.value;
    const success = await deleteGroup(groupId);

    if (success) {
        resetEditGroupForm();
        GROUP_SEARCH_INPUT.value = "";
    }
});

// Cancel edit form
GROUP_CANCEL_BUTTON.addEventListener("click", (e) => {
    e.preventDefault();
    resetEditGroupForm();
    GROUP_SEARCH_INPUT.value = "";
});

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
    if (!GROUP_SEARCH_INPUT.contains(e.target) && !GROUP_SEARCH_DROPDOWN.contains(e.target)) {
        hideGroupDropdown();
    }
});
// DELETE ACCOUNT MODAL
DELETE_ACCOUNT_BUTTON.addEventListener("click", () => {
    DELETE_ACCOUNT_MODAL.classList.toggle("hidden"); // show the modal
})

DELETE_ACCOUNT_CANCEL_BUTTON.addEventListener("click", () => {
    DELETE_ACCOUNT_MODAL.classList.toggle("hidden"); // hide the modal
})

DELETE_ACCOUNT_CONFIRM_BUTTON.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
        const url = `/api/users/me/`;
        const response = await fetch(url, {
            method: "DELETE", headers: {
                "X-CSRFToken": getCSRFToken(),
            }
        })
        if (!response.ok) {
            const data = await response.json();
            alert(`Unable to delete your account: ${data.detail}`);
        }
        // redirect to login page
        window.location.href = "/login/";
    } catch (error) {
        alert("Error occurred whilst deleting the account");
    }
})


document.addEventListener("DOMContentLoaded", getAllGroups);
