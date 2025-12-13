/*
This javascript file handles the link display functionality
 */

import "./add_group_form.js";
import "./add_link_form.js";
import * as utils from "./utils.js";
import * as edit_link_form from "./edit_link_form.js";
import * as delete_link_form from "./delete_link_form.js";
import * as clicked_link_form from "./clicked_link_form.js";

// CONSTANTS
const LINKS_CONTAINER = document.getElementById("links-container");
const NO_RESULTS_CONTAINER = document.getElementById("no-results");
const FILTER_LABEL_CONTAINER = document.getElementById("filter-label");

/**
 * Displays all links in the `utils.LINKS` array by recently created
 */
export async function displayRecentLinks() {
    if (utils.LINKS.length <= 0) {
        // show no results if there are no links
        showNoResults();
        return;
    }
    // sort by updated_at field
    utils.LINKS.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    for (const link of utils.LINKS) {
        const card = createLinkCard(link);
        LINKS_CONTAINER.appendChild(card);
    }
    // set current state
    utils.setCurrentDisplay(utils.CURRENT_DISPLAY.RECENTLY_CREATED);
    // update filter label display
    FILTER_LABEL_CONTAINER.textContent = "Recently Created";
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
        await delete_link_form.deleteLinkAPI(link, card)
    })

    // EDIT LINK FUNCTIONALITY
    const editBtn = card.querySelector(".edit-link-btn");
    editBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        edit_link_form.setUpEditLinkForm(link)
    })

    // CARD UPDATE FUNCTIONALITY
    card.addEventListener("click", async function (e) {
        e.stopPropagation();
        const updated_link_object = await clicked_link_form.updateLinkStats(link);
        updateLinkCard(updated_link_object);
        window.open(link.url, "_blank"); // redirect the user to the specified links url
    })

    return card;
}

export function updateLinkCard(link) {
    // TODO: Updating the card should also remove it from the display if it's group doesn't match
    const linkCard = document.querySelector(`.link-card[data-link-id="${link.id}"]`);
    linkCard.querySelector(".link-name").textContent = link.name;
    linkCard.querySelector(".link-url").textContent = link.url;
    linkCard.querySelector(".link-click-count").textContent = `Clicks: ${link.click_count || 0}`;
    linkCard.querySelector(".link-last-used").textContent = `Last used: ${utils.formatUpdatedAt(link.updated_at) || 'Never'}`;
    linkCard.querySelector(".link-group-name").textContent = `${utils.getGroup(link.group).name}`
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