/*
This javascript file handles the link display functionality
 */

import * as utils from "./utils.js";
import * as form_utils from "./forms.js";
// CONSTANTS
const LINKS_CONTAINER = document.getElementById("links-container");
const NO_RESULTS_CONTAINER = document.getElementById("no-results");

/**
 * Displays all links in the `utils.LINKS` array
 *
 * Shows the `no-results` container if no links are found
 */
export function displayAllLinks() {
    // show the no links found if there are no links
    if (utils.LINKS.length <= 0) {
        showNoResults();
        return;
    }
    // show available links
    hideNoResults();
    for (const link of utils.LINKS) {
        const card = createLinkCard(link);
        LINKS_CONTAINER.appendChild(card);
    }

}

/**
 * Creates link card div
 * @param link Link object to use in the card
 * @returns {HTMLDivElement} Created link card div
 */
export function createLinkCard(link) {
    const card = document.createElement('div');
    card.className = 'link-card bg-[#1E1E1E] border border-[#444444] rounded-lg p-4 hover:border-[#888888] transition-colors cursor-pointer';
    card.dataset.linkId = link.id;

    card.innerHTML = `
        <h3 class="text-[#E0E0E0] font-semibold text-lg mb-2 truncate link-name">${link.name}</h3>
        <p class="text-[#888888] text-sm mb-3 truncate link-url">${link.url}</p>
        <div class="flex items-center justify-between text-[#B0B0B0] text-xs">
            <span class="link-click-count">Clicks: ${link.click_count || 0}</span>
            <span class="link-last-used">Last used: ${utils.formatUpdatedAt(link.updated_at) || 'Never'}</span>
        </div>
        <div class="mt-2 pt-2 border-t border-[#444444] flex items-center justify-between">
            <span class="text-[#888888] text-xs link-group-name">${utils.getGroup(link.group_id).name || 'Default'}</span>
            <div class="flex gap-2">
                <button class="edit-link-btn text-[#B0B0B0] hover:text-[#E0E0E0] transition-colors" title="Edit">
                    <svg class="w-4 h-4" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
                    </svg>
                </button>
                <button class="delete-link-btn text-[#B0B0B0] hover:text-[#E0E0E0] transition-colors" title="Delete">
                    <svg class="w-4 h-4" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
    // DELETE LINK FUNCTIONALITY
    const deleteBtn = card.querySelector(".delete-link-btn");
    deleteBtn.addEventListener("click", async function (e) {
        e.stopPropagation();
        await form_utils.deleteLinkAPI(link, card)
    })

    // EDIT LINK FUNCTIONALITY
    const editBtn = card.querySelector(".edit-link-btn");
    editBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        // update the edit link form to store the id of this link card
        document.getElementById("edit-link-id").value = link.id;
        // initialize the starting values
        const currentLinkObj = utils.getLink(link.id)

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
        groupInput.value = utils.getGroup(initialGroupId).name

        // setup close event handlers
        form_utils.setUpEditLinkCloseHandlers(initialName, initialURL, initialGroupId);

        // setup change group dropdown functionality
        form_utils.setUpEditGroupSelector()

        // show the edit link form
        utils.toggleElementVisibility("edit-link-modal");
    })

    return card;
}


/**
 * Shows the `no-results` container
 */
export function showNoResults() {
    if (NO_RESULTS_CONTAINER.classList.contains("hidden")) {
        NO_RESULTS_CONTAINER.classList.remove("hidden");
    }
}

/**
 * Hides the `no-results` container
 */
export function hideNoResults() {
    if (!NO_RESULTS_CONTAINER.classList.contains("hidden")) {
        NO_RESULTS_CONTAINER.classList.add("hidden");
    }
}