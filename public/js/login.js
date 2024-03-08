document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const pass = document.getElementById('pass').value;

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, pass }),
                });

                const data = await response.json();

                if (response.ok) {
                    // Successful login
                    displaySweetAlert('success', 'Logged in successfully');
                    setTimeout(() => {
                        window.location.href = '/main'; // Redirect to the home page
                    }, 1500);
                } else {
                    // Error in login
                    displaySweetAlert('error', data.message);
                }
            } catch (error) {
                // General error
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
