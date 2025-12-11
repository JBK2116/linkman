/*
This javascript file handles the utility functions and attributes used throughout the frontend
 */

export let GROUPS = [];
export let LINKS = [];

/**
 * Sends a `GET` request to fetch all groups associated with the user
 *
 * Pushes all received groups into the `GROUPS` array
 */
export async function getGroups() {
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
        console.log(GROUPS);
    } catch (error) {
        console.log(`Error occurred fetching all groups: ${error}`);
    }
}

/**
 * Sends a `GET` request to fetch all links associated with the user
 *
 * Pushes all received links into the `LINKS` array
 */
export async function getLinks() {
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
        console.log(LINKS);
    } catch (error) {
        console.log(`Error occurred fetching links: ${error}`);
    }
}

/**
 * Gets a csrf token embedded in the page
 * @returns {string} The csrf token
 */
export function getCSRFToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]').value;
}

/**
 * Toggles the `hidden` class on the provided element
 * @param {string} elementID Element to toggle
 */
export function toggleElementVisibility(elementID) {
    const element = document.getElementById(elementID);
    if (element) {
        element.classList.toggle("hidden");
    }
}

/**
 * Retrieves a group object from the `GROUPS` Array
 * @param id ID of the group to retrieve
 * @returns {*|null} Group object if found, else null
 */
export function getGroup(id) {
    const group = GROUPS.find((g) => g.id === Number(id));
    if (!group) {
        return null;
    }
    return group
}

/**
 * Retrieves a link object from the `LINKS` Array
 * @param id ID of the link to retrieve
 * @returns {*|null} Link object if found, else null
 */
export function getLink(id) {
    const link = LINKS.find((l) => l.id === Number(id));
    if (!link) {
        return null;
    }
    return link;
}

/**
 * Removes the link object from the `LINKS` array with the matching ID
 * @param id ID of the link to remove
 */
export function deleteLinkFromList(id) {
    LINKS = LINKS.filter(l => l.id !== Number(id));
}

/**
 * Replaces the matching group object in the `GROUPS` array with the provided group object
 * @param id ID of the link to replace
 * @param link link object to replace with
 * @returns boolean True if the update was successful, False otherwise
 */
export function replaceLink(id, link) {
    const index = LINKS.findIndex(l => l.id === Number(id));
    if (index === -1) {
        return false;
    }
    LINKS[index] = link;
    return true;
}

export function updateLinkCard(link) {
    // TODO: Updating the card should also remove it from the display if it's group doesn't match
    const linkCard = document.querySelector(`.link-card[data-link-id="${link.id}"]`);
    linkCard.querySelector(".link-name").textContent = link.name;
    linkCard.querySelector(".link-url").textContent = link.url;
    linkCard.querySelector(".link-click-count").textContent = `Clicks: ${link.click_count || 0}`;
    linkCard.querySelector(".link-last-used").textContent = `Last used: ${formatUpdatedAt(link.updated_at) || 'Never'}`;
    linkCard.querySelector(".link-group-name").textContent = `${getGroup(link.group).name}`
}

/**
 * Formats the provided date time string and returns it in a relative time format
 *
 * @example Last 3 days
 * @example 24th November 2025
 * @param updatedAt ISO8601 Date Time String
 * @returns {string} The formatted string in a user readable format
 */
export function formatUpdatedAt(updatedAt) {
    const now = new Date();
    const date = new Date(updatedAt);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    }

    const day = date.getDate();
    const month = date.toLocaleString('en-US', {month: 'long'});
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}
