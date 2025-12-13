/*
This javascript file handles updating the link when it's clicked
 */

import * as utils from "./utils.js";

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Updates the `click_count` and related stats of a provided link
 * @param link Link to update
 * @returns link Updated link
 */
export async function updateLinkStats(link) {
    const csrfToken = utils.getCSRFToken();
    const url = `/api/links/${link.id}/`;
    const groupID = link.group || link.group_id;
    const payload = { group_id: groupID, for_clicked: true };
    // alert the server of the link being clicked
    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken,
            },
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        utils.replaceLink(data.link.id, data.link);
        return utils.getLink(data.link.id);
    } catch (error) {
        console.log(`Error updating link stats: ${error.message}`);
    }
}
