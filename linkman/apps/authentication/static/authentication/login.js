document.addEventListener('DOMContentLoaded', () => {
    const closeVerifiedModal = document.getElementById('closeModal');
    const verifiedModalContainer = document.getElementById(
        'emailVerificationModal',
    );

    closeVerifiedModal.addEventListener('click', () => {
        verifiedModalContainer.classList.add('hidden');
    });

    const closeExpiredModal = document.getElementById('closeExpiredModal');
    const expiredModalContainer = document.getElementById(
        'verificationExpiredModal',
    );
    closeExpiredModal.addEventListener('click', () => {
        expiredModalContainer.classList.add('hidden');
    });

    const resendEmailModal = document.getElementById('resendEmailModal');
    const closeResendEmailModal = document.getElementById(
        'closeResendEmailModal',
    );
    closeResendEmailModal.addEventListener('click', () => {
        resendEmailModal.classList.add('hidden');
    });
});
