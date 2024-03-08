document.addEventListener('DOMContentLoaded', () => {
    const verificationForm = document.getElementById('login-form');

    if (verificationForm) {
        verificationForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const verificationCode = document.getElementById('verificationCode').value;

            // Show loading alert
            const loadingAlert = Swal.fire({
                title: 'Loading...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            try {
                // Send verification request
                const response = await fetch('/verify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, verificationCode }),
                });

                const data = await response.json();

                if (response.ok) {
                    // Successful verification
                    loadingAlert.close(); // Close loading alert
                    displaySweetAlert('success', data.message);
                    setTimeout(() => {
                        window.location.href = '/login'; // Redirect to login page
                    }, 1500);
                } else {
                    // Error in verification
                    loadingAlert.close(); // Close loading alert
                    displaySweetAlert('error', data.message);
                }
            } catch (error) {
                // General error
                loadingAlert.close(); // Close loading alert
                console.log(email, verificationCode);
                console.error(error);
                displaySweetAlert('error', 'An unexpected error occurred');
            }
        });
    }
});

function displaySweetAlert(icon, message) {
    Swal.fire({
        icon,
        title: '',
        text: message,
    });
}
