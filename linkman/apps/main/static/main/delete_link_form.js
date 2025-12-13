/*
This module stores the functionality for the `delete-btn`
 */
import * as utils from "./utils.js";

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Deletes the provided Link
 * @param link Link to delete
 * @param linkCard Link's DOM element to remove
 * @returns {Promise<void>}
 */
export async function deleteLinkAPI(link, linkCard) {
    const url = `/api/links/${link.id}/`
    const csrfToken = utils.getCSRFToken();
    try {
        const response = await fetch(url, {
            method: "DELETE",
            headers: {"X-CSRFToken": csrfToken},
        })
        // handle error response
        if (!response.ok) {
            alert(`Error occurred deleting the link`);
            return;
        }
        utils.deleteLinkFromList(link.id); // remove link from LINKS array
        linkCard.remove(); // remove link from the DOM
        alert(`Link successfully deleted!`); // alert the user
    } catch (error) {
        console.log(`Error deleting link: ${link}`);
    }
}
