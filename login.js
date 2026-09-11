const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");
const notification = document.getElementById("notification");

function showNotification(text) {
    notification.textContent = text;
    notification.style.display = "block";
}

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const loginData = {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value
    };

    try {
        const response = await fetch("https://andileuserportal.somee.com/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(loginData)
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("userId", data.userId);
            localStorage.setItem("token", data.token);

            if (data.role === "Admin") {
                window.location.href = "admin-dashboard.html";
            } else if (data.role === "Moderator") {
                window.location.href = "moderator-dashboard.html";
            } else {
                window.location.href = "dashboard.html";
            }
        } else {
            showNotification(data.message || "Login failed.");
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