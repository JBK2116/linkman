/*
This js file serves as the entry point for the logic in the `dashboard.html` page
 */
import * as group_utils from './add_group_form.js';
import * as link_utils from './add_link_form.js';
import './edit_link_form.js';
import './delete_link_form.js';
import * as display_utils from './display_utils.js';
import * as utils from './utils.js';

// Filter select change handler
const filterSelect = document.getElementById('filter-select');

filterSelect.addEventListener('change', function () {
    const filterType = this.value;

    if (filterType === utils.CURRENT_DISPLAY.RECENTLY_CREATED)
        display_utils.displayRecentlyCreated();
    else if (filterType === utils.CURRENT_DISPLAY.LAST_USED)
        display_utils.displayLastUsed();
    else if (filterType === utils.CURRENT_DISPLAY.MOST_USED)
        display_utils.displayMostUsed();
});

filterSelect.addEventListener('mousedown', function (e) {
    const option = e.target.closest('option');
    if (!option) return;

    if (option.value === utils.CURRENT_DISPLAY.GROUP) {
        e.preventDefault(); // stop dropdown locking
        display_utils.showGroupFilter();
    }
});

// Group filter modal functionality
const groupFilterModal = document.getElementById('group-filter-modal');
const groupFilterSelect = document.getElementById('group-filter-select');
const closeGroupFilterButton = document.getElementById(
    'close-group-filter-modal',
);

// Populate group filter select
function populateGroupFilterSelect() {
    groupFilterSelect.innerHTML = '<option value="">All Groups</option>';
    const ranked = [...utils.GROUPS].sort((a, b) => {
        // sort by recent usage
        if (a.updated_at && b.updated_at)
            return new Date(b.updated_at) - new Date(a.updated_at);
        if (a.updated_at) return -1;
        if (b.updated_at) return 1;
        // sort by frequency of usage
        if (a.click_count !== b.click_count)
            return b.click_count - a.click_count;
        // sort by name (fallback)
        return a.name.localeCompare(b.name);
    });

    ranked.forEach((group) => {
        const option = document.createElement('option');
        option.value = group.id;
        option.textContent = group.name;
        groupFilterSelect.appendChild(option);
    });
}

// Handle group filter selection
groupFilterSelect.addEventListener('change', function () {
    const groupId = this.value;
    if (groupId) {
        display_utils.displayByGroup(groupId);
        groupFilterModal.classList.add('hidden');
        // Keep filter select on "group"
        document.getElementById('filter-select').value = 'group';
    }
});

// Close group filter modal
closeGroupFilterButton.addEventListener('click', function () {
    groupFilterModal.classList.add('hidden');
    // Reset group select
    groupFilterSelect.value = '';
    // Reset filter select back to the actual current display
    const currentDisplay = utils.getCurrentDisplay();
    document.getElementById('filter-select').value = currentDisplay;
});

// Fuse Search input handler
const fuseOptions = {
    keys: ['name'],
    threshold: 0.3,
    ignoreLocation: true,
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2,
};
let searchTimeout;
let linksContainer = document.getElementById('links-container');
document.getElementById('search-input').addEventListener('input', function (e) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const query = e.target.value;
        if (!query) {
            // user hasn't inputted anything
            display_utils.reloadLinksDisplay();
            return;
        }
        // if we are filtering by group, use the group links, else use the standard utils.LINKS
        const dataSet =
            display_utils.CURRENT_FILTERED_LINKS.length > 0
                ? display_utils.CURRENT_FILTERED_LINKS
                : utils.LINKS;
        const fuseObj = new Fuse(dataSet, fuseOptions); // fuse object for implementing the fuzzy search
        const results = fuseObj.search(query);
        // reset the links container
        linksContainer.innerHTML = '';
        // handle no results
        if (!results.length > 0) {
            display_utils.showNoResults();
            return;
        }
        // showcase the results
        display_utils.hideNoResults();
        results.forEach((result) => {
            const card = display_utils.createLinkCard(result.item);
            linksContainer.appendChild(card);
        });
    }, 200);
});

// Infinite scroll implementation
let isLoading = false;
window.addEventListener('scroll', function () {
    if (isLoading) return;

    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.documentElement.scrollHeight - 500;

    if (scrollPosition >= threshold) {
        isLoading = true;
        document.getElementById('loading-indicator').classList.remove('hidden');
        const hasMore = display_utils.loadMoreLinks();
        if (!hasMore) {
            document
                .getElementById('loading-indicator')
                .classList.add('hidden');
        }
        isLoading = false;
    }
});

/**
 * Initializes the page, including getting `user` data and connecting event listeners
 * @returns {Promise<void>}
 */
async function init() {
    // Load user data
    await utils.getGroups();
    await utils.getLinks();
    // Populate group filter select
    populateGroupFilterSelect();
    // Display initial view
    display_utils.displayRecentlyCreated();
}

window.addEventListener('DOMContentLoaded', init);

window.addEventListener(
    'resize',
    utils.debounce(() => {
        const oldValue = utils.LINKS_PER_PAGE;
        const newValue = utils.calculateLinksPerPage();
        utils.setLinksPerPage(newValue);

        // only reload if significantly different (optional optimization)
        if (Math.abs(oldValue - newValue) > 5) {
            display_utils.reloadLinksDisplay();
        }
    }, 300),
);

document.addEventListener('keydown', function (e) {
    // require Ctrl + Alt for shortcuts
    if (!(e.ctrlKey && e.altKey)) return;
    // ignore typing in inputs, textareas, or contenteditable
    const active = document.activeElement;
    if (
        active &&
        (active.tagName === 'INPUT' ||
            active.tagName === 'TEXTAREA' ||
            active.isContentEditable)
    )
        return;
    // retrieve the pressed key
    const key = e.key.toLowerCase();
    switch (key) {
        case '/':
            e.preventDefault(); // prevent default browser behavior
            document.getElementById('search-input')?.focus();
            break;
        case 'r':
            document.getElementById('filter-select').value = 'recent';
            display_utils.displayRecentlyCreated();
            break;
        case 'm':
            document.getElementById('filter-select').value = 'most-used';
            display_utils.displayMostUsed();
            break;
        case 'u':
            document.getElementById('filter-select').value = 'last-used';
            display_utils.displayLastUsed();
            break;
        case 'f':
            display_utils.showGroupFilter(); // open the modal
            const groupModal = document.getElementById('group-filter-modal');
            const groupSelect = document.getElementById('group-filter-select');

            if (
                groupModal &&
                !groupModal.classList.contains('hidden') &&
                groupSelect
            ) {
                // focus the dropdown
                groupSelect.focus();
                // open the native dropdown programmatically
                const event = new MouseEvent('mousedown', { bubbles: true });
                groupSelect.dispatchEvent(event);
            }
            break;
        case 'g': // open Add Group form
            utils.toggleElementVisibility('group-form-modal');
            break;
        case 'l': // new Add Link shortcut
            link_utils.openAddLinkForm();
            // populate the group select
            link_utils.populateGroupSelect();
            break;
    }
});

// Global Escape handler
document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;

    const searchInput = document.getElementById('search-input');
    const groupModal = document.getElementById('group-filter-modal');
    const groupFormModal = document.getElementById('group-form-modal');
    const linkFormModalWrapper = document.getElementById('link-form-modal');

    // clear and blur search input if focused
    if (document.activeElement === searchInput) {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
        searchInput.blur();
    }

    // close group filter modal if open
    if (groupModal && !groupModal.classList.contains('hidden')) {
        groupModal.classList.add('hidden');
        document.getElementById('group-filter-select').value = '';
        const currentDisplay = utils.getCurrentDisplay();
        document.getElementById('filter-select').value = currentDisplay;
    }

    // close add group form modal if open
    if (groupFormModal && !groupFormModal.classList.contains('hidden')) {
        group_utils.resetGroupForm();
        groupFormModal.classList.add('hidden');
    }
    // close add link form modal if open
    if (
        linkFormModalWrapper &&
        !linkFormModalWrapper.classList.contains('hidden')
    ) {
        link_utils.resetLinkForm();
        linkFormModalWrapper.classList.add('hidden');
    }
});
