/*
This javascript file handles the link display functionality
 */

import * as utils from './utils.js';
import * as edit_link_form from './edit_link_form.js';
import * as delete_link_form from './delete_link_form.js';
import * as clicked_link_form from './clicked_link_form.js';

// CONSTANTS
const LINKS_CONTAINER = document.getElementById('links-container');
const NO_RESULTS_CONTAINER = document.getElementById('no-results');
export let CURRENT_FILTERED_LINKS = []; // links that are filtered when group filter is on
let CURRENT_DISPLAYED_COUNT = 0; // tracks the amount of currently displayed links

/**
 * Displays all links in the `utils.LINKS` array by recently created
 */
export function displayRecentlyCreated() {
    hideNoResults();
    LINKS_CONTAINER.innerHTML = '';
    // sort by updated_at field
    utils.LINKS.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    // handle empty links possibility
    if (handleEmptyLinksArrayDisplay()) {
        return;
    }
    CURRENT_FILTERED_LINKS = [];
    CURRENT_DISPLAYED_COUNT = 0;
    loadMoreLinks(); // load more links as necessary
    // set current state
    utils.setCurrentDisplay(utils.CURRENT_DISPLAY.RECENTLY_CREATED);
}

/**
 * Displays all links in the `utils.LINKS` array by last used
 */
export function displayLastUsed() {
    hideNoResults();
    LINKS_CONTAINER.innerHTML = '';
    // sort by last_used field
    utils.LINKS.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    // handle empty links possibility
    if (handleEmptyLinksArrayDisplay()) {
        return;
    }
    CURRENT_FILTERED_LINKS = [];
    CURRENT_DISPLAYED_COUNT = 0;
    loadMoreLinks(); // load more links as necessary
    // set current state
    utils.setCurrentDisplay(utils.CURRENT_DISPLAY.LAST_USED);
}

export function displayMostUsed() {
    hideNoResults();
    LINKS_CONTAINER.innerHTML = '';
    // sort by click_count field
    utils.LINKS.sort((a, b) => b.click_count - a.click_count);
    // handle empty links possibility
    if (handleEmptyLinksArrayDisplay()) {
        return;
    }
    CURRENT_FILTERED_LINKS = [];
    CURRENT_DISPLAYED_COUNT = 0;
    loadMoreLinks(); // load more links as necessary
    // set current state
    utils.setCurrentDisplay(utils.CURRENT_DISPLAY.MOST_USED);
}

/**
 * Displays all links that match to the provided group
 * @param groupID ID of the group to filter by
 */
export function displayByGroup(groupID) {
    LINKS_CONTAINER.innerHTML = '';
    hideNoResults();
    // get the current group object
    const group = utils.getGroup(groupID);
    // only display current group
    CURRENT_FILTERED_LINKS = utils.LINKS.filter(
        (link) => link.group_id === group.id || link.group === group.id,
    );
    // handle empty links display
    if (CURRENT_FILTERED_LINKS.length <= 0) {
        utils.setCurrentDisplay(utils.CURRENT_DISPLAY.GROUP);
        utils.setCurrentGroup(group);
        showNoResults();
        return;
    }
    // showcase group links
    CURRENT_DISPLAYED_COUNT = 0;
    loadMoreLinks();
    // update display
    utils.setCurrentDisplay(utils.CURRENT_DISPLAY.GROUP);
    utils.setCurrentGroup(group);
}

/**
 * Creates link card div
 * @param link Link object to use in the card
 * @returns {HTMLDivElement} Created link card div
 */
export function createLinkCard(link) {
    const card = document.createElement('div');
    card.className =
        'link-card bg-[#1E1E1E] border border-[#444444] rounded-lg p-4 hover:border-[#888888] transition-colors cursor-pointer';
    card.dataset.linkId = link.id;

    card.innerHTML = `
        <h3 class="text-[#E0E0E0] font-semibold text-lg mb-2 truncate link-name">${link.name}</h3>
        <p class="text-[#888888] text-sm mb-3 truncate link-url">${link.url}</p>
        <div class="flex items-center justify-between text-[#B0B0B0] text-xs">
            <span class="link-click-count">Clicks: ${link.click_count || 0}</span>
            <span class="link-last-used">Last used: ${utils.formatUpdatedAt(link.updated_at) || 'Never'}</span>
        </div>
        <div class="mt-2 pt-2 border-t border-[#444444] flex items-center justify-between">
            <span class="text-[#888888] text-xs link-group-name">${utils.getGroup(link.group_id || link.group).name || 'Default'}</span>
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
    const deleteBtn = card.querySelector('.delete-link-btn');
    deleteBtn.addEventListener('click', async function (e) {
        e.stopPropagation();
        await delete_link_form.deleteLinkAPI(link, card);
        if (utils.getLinksCount() <= 0) {
            showNoResults(); // there are no more links to display
        }
    });

    // EDIT LINK FUNCTIONALITY
    const editBtn = card.querySelector('.edit-link-btn');
    editBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        edit_link_form.setUpEditLinkForm(link);
    });

    // CARD UPDATE FUNCTIONALITY
    card.addEventListener('click', async function (e) {
        e.stopPropagation();
        const updated_link_object =
            await clicked_link_form.updateLinkStats(link);
        updateLinkCard(updated_link_object);
        window.open(link.url, '_blank'); // redirect the user to the specified links url
    });

    return card;
}

/**
 * Updates the visual link card statistics
 * @param link Link to update with
 */
export function updateLinkCard(link) {
    const linkCard = document.querySelector(
        `.link-card[data-link-id="${link.id}"]`,
    );
    linkCard.querySelector('.link-name').textContent = link.name;
    linkCard.querySelector('.link-url').textContent = link.url;
    linkCard.querySelector('.link-click-count').textContent =
        `Clicks: ${link.click_count || 0}`;
    linkCard.querySelector('.link-last-used').textContent =
        `Last used: ${utils.formatUpdatedAt(link.updated_at) || 'Never'}`;
    linkCard.querySelector('.link-group-name').textContent =
        `${utils.getGroup(link.group).name}`;
    // remove the link from the current display if the group doesn't match, implement it below
    const currentDisplayValue = utils.getCurrentDisplay();
    if (currentDisplayValue === utils.CURRENT_DISPLAY.GROUP) {
        const currentDisplayGroup = utils.getCurrentGroup();
        const linkGroupID = link.group_id || link.group;
        if (linkGroupID !== currentDisplayGroup) {
            linkCard.remove(); // the card no longer belongs to the currently displayed group
        }
    }
}

/**
 * Reloads the current links display
 */
export function reloadLinksDisplay() {
    const currentDisplayValue = utils.getCurrentDisplay();
    switch (currentDisplayValue) {
        case utils.CURRENT_DISPLAY.RECENTLY_CREATED: {
            displayRecentlyCreated();
            break;
        }
        case utils.CURRENT_DISPLAY.LAST_USED: {
            displayLastUsed();
            break;
        }
        case utils.CURRENT_DISPLAY.MOST_USED: {
            displayMostUsed();
            break;
        }
        case utils.CURRENT_DISPLAY.GROUP: {
            const currentDisplayedGroup = utils.getCurrentGroup();
            displayByGroup(currentDisplayedGroup.id);
            break;
        }
        default: {
            displayRecentlyCreated();
            break;
        }
    }
}

/**
 * Shows the `no-results` container
 */
export function showNoResults() {
    if (NO_RESULTS_CONTAINER.classList.contains('hidden')) {
        NO_RESULTS_CONTAINER.classList.remove('hidden');
    }
}

/**
 * Hides the `no-results` container
 */
export function hideNoResults() {
    if (!NO_RESULTS_CONTAINER.classList.contains('hidden')) {
        NO_RESULTS_CONTAINER.classList.add('hidden');
    }
}

/**
 * Handles displaying the page when there are no links
 * @returns {boolean}
 */
export function handleEmptyLinksArrayDisplay() {
    const links_count = utils.LINKS.length;
    if (links_count <= 0) {
        // show no results if there are no links
        showNoResults();
        return true;
    }
    return false;
}

// DISPLAY GROUP FUNCTIONALITY
const GROUP_FILTER_MODAL = document.getElementById('group-filter-modal');
const CLOSE_GROUP_FILTER_MODAL = document.getElementById(
    'close-group-filter-modal',
);

/**
 * Opens the group filter modal
 */
export function showGroupFilter() {
    GROUP_FILTER_MODAL.classList.remove('hidden');
}

/**
 * Closes the group filter modal
 */
function closeGroupFilterModal() {
    GROUP_FILTER_MODAL.classList.add('hidden');
}

// CLOSE MODAL
CLOSE_GROUP_FILTER_MODAL.addEventListener('click', closeGroupFilterModal);

// INFINITE SCROLL FUNCTIONALITY

/**
 * Loads the next batch of links into the display
 * @returns {boolean} True if more links are available to load, else False
 */
export function loadMoreLinks() {
    const linksToUse =
        CURRENT_FILTERED_LINKS.length > 0
            ? CURRENT_FILTERED_LINKS
            : utils.LINKS;
    const start = CURRENT_DISPLAYED_COUNT;
    const end = Math.min(start + utils.LINKS_PER_PAGE, linksToUse.length);

    for (let i = start; i < end; i++) {
        const card = createLinkCard(linksToUse[i]);
        LINKS_CONTAINER.appendChild(card);
    }

    CURRENT_DISPLAYED_COUNT = end;
    return end < linksToUse;
}
