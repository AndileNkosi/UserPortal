const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

async function loadUser() {
    try {
        const response = await fetch(
            "https://andileuserportal.somee.com/api/auth/user",
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error(data.message);

            if (response.status === 401) {
                localStorage.removeItem("token");
                window.location.href = "login.html";
            }

            return;
        }

        document.getElementById("username").textContent = data.username;
        document.getElementById("firstName").textContent = data.firstName;
        document.getElementById("lastName").textContent = data.lastName;
        document.getElementById("email").textContent = data.email;

        document.getElementById("createdAt").textContent =
            new Date(data.createdAt).toLocaleDateString();

    } catch (error) {
        console.error("Could not load user:", error);
    }
}

loadUser();

document.getElementById("logoutButton").addEventListener("click", function () {
    localStorage.removeItem("userId");
    localStorage.removeItem("token");

    sessionStorage.clear();

    window.location.href = "login.html";
});