/*
This js file serves as the entry point for the logic in the `dashboard.html` page
 */
import './add_group_form.js';
import './add_link_form.js';
import './edit_link_form.js';
import './delete_link_form.js';
import * as display_utils from './display_utils.js';
import * as utils from './utils.js';

// Filter select change handler
document
    .getElementById('filter-select')
    .addEventListener('change', function () {
        const filterType = this.value;
        if (filterType === utils.CURRENT_DISPLAY.RECENTLY_CREATED) {
            display_utils.displayRecentlyCreated();
        } else if (filterType === utils.CURRENT_DISPLAY.LAST_USED) {
            display_utils.displayLastUsed();
        } else if (filterType === utils.CURRENT_DISPLAY.MOST_USED) {
            display_utils.displayMostUsed();
        } else if (filterType === utils.CURRENT_DISPLAY.GROUP) {
            display_utils.showGroupFilter();
        } else {
            console.log('No display accessed');
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
    utils.GROUPS.forEach((group) => {
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

// Clear search on Escape key
document
    .getElementById('search-input')
    .addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            this.value = '';
            this.dispatchEvent(new Event('input'));
        }
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
