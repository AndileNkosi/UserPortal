const registerForm = document.getElementById("registerForm");
const message = document.getElementById("message");
const notification = document.getElementById("notification");

    function showNotification(text) {
    notification.textContent = text;
    notification.style.display = "block";

    }

registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

        const userData = {
            firstName: document.getElementById("firstName").value,
            lastName: document.getElementById("lastName").value,
            email: document.getElementById("email").value,
            username: document.getElementById("username").value,
            password: document.getElementById("password").value,
            confirmPassword: document.getElementById("confirmPassword").value
        };

        if (userData.password !== userData.confirmPassword) {
            showNotification("Passwords do not match.");
            return;
        }

    try {
        const response = await fetch("https://andileuserportal.somee.com/api/auth/register", { 
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        console.log("API response:", data);

            if (response.ok) {
                message.textContent = data.message;
                registerForm.reset();
            } else if (data.errors) {
                const errors = Object.values(data.errors).flat();
                message.textContent = errors.join(" ");
                console.log(data.errors);
            } else {
                message.textContent = data.message || "Registration failed.";
        }

    } catch (error) {
        message.textContent = "Could not connect to the server.";
        console.error(error);
    }
});

document.getElementById("togglePassword").addEventListener("click", function () {
    const password = document.getElementById("password");

    if (password.type === "password") {
        password.type = "text";
    } else {
        password.type = "password";
    }
});

document.getElementById("toggleConfirmPassword").addEventListener("click", function () {
    const confirmPassword = document.getElementById("confirmPassword");

    if (confirmPassword.type === "password") {
        confirmPassword.type = "text";
    } else {
        confirmPassword.type = "password";
    }
});