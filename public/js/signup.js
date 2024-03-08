document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('register-form');

    if (signupForm) {
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const pass = document.getElementById('pass').value;
            const re_pass = document.getElementById('re_pass').value;
            const agreeTermsCheckbox = document.getElementById('agree-term');

            // Validate that all fields are filled
            if (!name || !email || !pass || !re_pass || !agreeTermsCheckbox.checked) {
                displaySweetAlert('error', 'Please fill in all required fields and agree to the terms.');
                return;
            }
            // Show loading alert
            const loadingAlert = Swal.fire({
                title: 'Loading...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            }, 100);

            try {
                const response = await fetch('/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, email, pass, re_pass }),
                });

                const data = await response.json();

                if (response.ok) {
                    // Successful signup
                    loadingAlert.close(); // Close loading alert
                    displaySweetAlert('success', 'Verification code sent to your email');
                    setTimeout(() => {
                        window.location.href = `/verification?email=${email}`; // Redirect to verification page with email as query parameter
                    }, 1500);
                } else {
                    // Error in signup
                    loadingAlert.close(); // Close loading alert
                    displaySweetAlert('error', data.message);
                }
            } catch (error) {
                // General error
                loadingAlert.close(); // Close loading alert
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
