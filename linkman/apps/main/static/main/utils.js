/*
This javascript file handles the utility functions and attributes used throughout the frontend
 */

export let GROUPS = [];
export let LINKS = [];

// ENUM for tracking current display
export const CURRENT_DISPLAY = Object.freeze({
    RECENTLY_CREATED: "recent",
    MOST_USED: "most-used",
    LAST_USED: "last-used",
    GROUP: "group",
});
export let currentDisplay = null;
export let currentGroup = null;
export let LINKS_PER_PAGE = calculateLinksPerPage();

/**
 * Sets the `currentDisplay` value
 * @param value Value to set
 */
export function setCurrentDisplay(value) {
    currentDisplay = value;
}

/**
 * Sets the `currentGroup` value
 * @param value Object of the current group
 */
export function setCurrentGroup(value) {
    currentGroup = value;
}

/**
 * Gets the `currentDisplay` value
 * @returns {null} The `currentDisplay` value
 */
export function getCurrentDisplay() {
    return currentDisplay;
}

/**
 * Gets the current group that is displayed with the filter
 * @returns {null} The current group
 */
export function getCurrentGroup() {
    return currentGroup;
}

/*
 * Sets the `LINKS_PER_PAGE` value
 * @param {value} Value of the current links per page
 */
export function setLinksPerPage(value) {
    LINKS_PER_PAGE = value;
}

/**
 * Sends a `GET` request to fetch all groups associated with the user
 *
 * Pushes all received groups into the `GROUPS` array
 */
export async function getGroups() {
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
            GROUPS.push(item);
        });
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
        const response = await fetch("/api/links", {
            method: "GET",
        });
        const data = await response.json();
        if (!response.ok) {
            console.log(`Unable to fetch links: ${data.links}`);
            return;
        }
        data.links.forEach((item) => {
            LINKS.push(item);
        });
    } catch (error) {
        console.log(`Error occurred fetching links: ${error}`);
    }
}

/**
 * Gets a csrf token embedded in the page
 * @returns {string} The csrf token
 */
export function getCSRFToken() {
    return document.querySelector("[name=csrfmiddlewaretoken]").value;
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
    return group;
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
    LINKS = LINKS.filter((l) => l.id !== Number(id));
}

/**
 * Replaces the matching group object in the `GROUPS` array with the provided group object
 * @param id ID of the link to replace
 * @param link link object to replace with
 * @returns boolean True if the update was successful, False otherwise
 */
export function replaceLink(id, link) {
    const index = LINKS.findIndex((l) => l.id === Number(id));
    if (index === -1) {
        return false;
    }
    LINKS[index] = link;
    return true;
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

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
        return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
        return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
    }

    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

/**
 * Calculates the amount of link cards to display on the current page
 *
 * @returns The number of link cards to display on the current page
 */
export function calculateLinksPerPage() {
    const viewportHeight = window.innerHeight;
    const cardHeight = 180; // Approximate height of your link card in pixels
    const buffer = 1.5; // Load 1.5x viewport for smooth scrolling

    return Math.max(8, Math.ceil((viewportHeight / cardHeight) * buffer));
}

/**
 * Debounce helper function
 *
 * @param {*} func A function to execute
 * @param {*} wait Amount of time in milliseconds to wait before executing the provided function
 */
export function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
