/*
This js file serves as the entry point for the logic in the `dashboard.html` page
 */

// REQUIRED VARIABLES
const GROUPS = [];
const LINKS = [];
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

// Add Group button
document.getElementById('add-group-button').addEventListener('click', function () {
    // TODO: Open modal or redirect to add group form
});

// Add Link button
document.getElementById('add-link-button').addEventListener('click', function () {
    // TODO: Open modal or redirect to add link form
});

// Edit link button
document.querySelectorAll('.edit-link-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
        e.stopPropagation(); // Prevent card click
        // TODO: Open edit modal
    });
});

// Delete link button
document.querySelectorAll('.delete-link-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
        e.stopPropagation(); // Prevent card click
        // TODO: Confirm and delete via AJAX
    });
});

/**
 * Sends a `GET` request to fetch all groups associated with the user
 *
 * Pushes all received groups into the `GROUPS` array
 */
async function getGroups() {
    try {
        const response = await fetch('/api/groups', {
            method: 'GET',
        });
        const data = await response.json();
        if (!response.ok) {
            console.log(`Unable to fetch all groups: ${data.detail}`)
            return;
        }
        data.groups.forEach((item) => {
            GROUPS.push(item);
        })
        console.log(`Data successfully retrieved: ${data.groups}`)
    } catch (error) {
        console.log(`Error occurred fetching all groups: ${error}`);
    }
}

/**
 * Sends a `GET` request to fetch all links associated with the user
 *
 * Pushes all received links into the `LINKS` array
 */
async function getLinks() {
    try {
        const response = await fetch('/api/links', {
            method: 'GET',
        })
        const data = await response.json();
        if (!response.ok) {
            console.log(`Unable to fetch links: ${data.links}`);
            return;
        }
        data.links.forEach((item) => {
            LINKS.push(item);
        })
        console.log(`Data successfully retrieved: ${data.links}`);
    } catch (error) {
        console.log(`Error occurred fetching links: ${error}`);
    }
}

function getCSRFToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]').value;
}

window.addEventListener('DOMContentLoaded', getGroups)