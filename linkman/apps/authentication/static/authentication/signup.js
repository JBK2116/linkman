const modalContainer = document.getElementById("emailModal");
const closeModalBtn = document.getElementById("closeModal");

closeModalBtn.addEventListener("click", () => {
    modalContainer.classList.toggle("hidden"); // hide the modal
})
