/*
This javascript file handles the utility functions and attributes used throughout the frontend
 */

export const GROUPS = [];
export const LINKS = [];

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