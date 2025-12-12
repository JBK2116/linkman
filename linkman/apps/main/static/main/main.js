/*
This js file serves as the entry point for the logic in the `dashboard.html` page
 */
import "./add_group_form.js";
import "./add_link_form.js";
import "./edit_link_form.js";
import "./delete_link_form.js";
import * as display_utils from "./display.js";
import * as utils from "./utils.js";
// Filter dropdown toggle
document.getElementById('filter-button').addEventListener('click', function () {
    document.getElementById('filter-dropdown').classList.toggle('hidden');
});


// Close dropdown when clicking outside
document.addEventListener('click', function (event) {
    const filterButton = document.getElementById('filter-button');
    const filterDropdown = document.getElementById('filter-dropdown');
    if (!filterButton.contains(event.target) && !filterDropdown.contains(event.target)) {
        filterDropdown.classList.add('hidden');
    }
});

// Filter option selection - Update label and close dropdown
document.querySelectorAll('.filter-option').forEach(option => {
    option.addEventListener('click', function () {
        const filterLabel = this.textContent;
        document.getElementById('filter-label').textContent = filterLabel;
        document.getElementById('filter-dropdown').classList.add('hidden');
        // TODO: Implement filter logic here
    });
});

// Search input handler - Add debouncing here
let searchTimeout;
document.getElementById('search-input').addEventListener('input', function (e) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const query = e.target.value;
        // TODO: Implement fuzzy search with Fuse.js here
    }, 200);
});

// Clear search on Escape key
document.getElementById('search-input').addEventListener('keydown', function (e) {
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
        // TODO: Fetch more links via AJAX here
        // After loading, set isLoading = false and hide loading indicator
    }
});

// Link card click handler
document.querySelectorAll('.link-card').forEach(card => {
    card.addEventListener('click', function () {
        // TODO: Increment click count, update last_used, redirect to URL
    });
});

/**
 * Initializes the page, including getting `user` data and connecting event listeners
 * @returns {Promise<void>}
 */
async function init() {
    // Load user data
    await utils.getGroups();
    await utils.getLinks();
    await display_utils.displayAllLinks()
}

window.addEventListener('DOMContentLoaded', init)