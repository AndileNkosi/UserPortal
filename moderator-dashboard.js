const token = localStorage.getItem("token");

async function loadModeratorName() {

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

        if (response.ok) {
            document.getElementById("moderatorName").textContent =
                data.firstName;
        }

    } catch (error) {
        console.error("Could not load moderator name:", error);
    }
}

if (!token) {
    window.location.href = "login.html";
}

loadModeratorName();

async function loadUsers() {

    try {
        const response = await fetch(
            "https://andileuserportal.somee.com/api/admin/users",
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const users = await response.json();

        if (!response.ok) {
            console.error(users.message);

            if (response.status === 401 || response.status === 403) {
                window.location.href = "login.html";
            }

            return;
        }

        const usersContainer = document.getElementById("usersContainer");

        usersContainer.innerHTML = "";

        users.forEach(function (user) {


            const userDiv = document.createElement("div");

            userDiv.innerHTML = `
                <p>
                    <strong>${user.username}</strong><br>
                    Name: ${user.firstName} ${user.lastName}<br>
                    Email: ${user.email}<br>
                    Role: ${user.role}<br>
                    Status: ${user.isActive ? "Active" : "Disabled"}<br>
                    ${user.role === "User" && user.isActive
                        ? `<button class="admin-button" onclick="disableUser(${user.id})">Disable</button>`
                        : ""}

                    ${user.role === "User" && !user.isActive
                        ? `<button class="admin-button" onclick="enableUser(${user.id})">Enable</button>`
                        : ""}

                </p>

                <hr>
                    </p>
                </p>

                <hr>
            `;

            usersContainer.appendChild(userDiv);
        });

    } catch (error) {
        console.error("Could not load users:", error);
    }
}

loadUsers();

document.getElementById("logoutButton").addEventListener("click", function () {

    localStorage.removeItem("userId");
    localStorage.removeItem("token");

    sessionStorage.clear();

    window.location.href = "login.html";
});

async function disableUser(userId) {

    const confirmed = confirm(
        "Are you sure you want to disable this user?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `https://andileuserportal.somee.com/api/admin/users/${userId}/disable`,
            {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = response.headers
            .get("content-type")
            ?.includes("application/json")
            ? await response.json()
            : {};

        if (response.ok) {
            alert(data.message);
            loadUsers();

        } else if (response.status === 403) {
            alert("You cannot disable a Moderator or Admin.");

        } else {
            alert(data.message || "Failed to disable user.");
        }

    } catch (error) {
        console.error("Could not disable user:", error);
        alert("Could not connect to the server.");
    }
}

async function enableUser(userId) {

    const confirmed = confirm(
        "Are you sure you want to enable this user?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `https://andileuserportal.somee.com/api/admin/users/${userId}/enable`,
            {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = response.headers
            .get("content-type")
            ?.includes("application/json")
            ? await response.json()
            : {};

        if (response.ok) {
            alert(data.message);
            loadUsers();

        } else if (response.status === 403) {
            alert("You cannot enable a Moderator or Admin.");

        } else {
            alert(data.message || "Failed to enable user.");
        }

    } catch (error) {
        console.error("Could not enable user:", error);
        alert("Could not connect to the server.");
    }
}