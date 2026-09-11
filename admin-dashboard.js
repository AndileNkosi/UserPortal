const token = localStorage.getItem("token");
const loggedInUserId = Number(localStorage.getItem("userId"));

async function loadAdminName() {

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
            console.log("Admin data:", data);

            document.getElementById("adminName").textContent =
                data.firstName;
        }

    } catch (error) {
        console.error("Could not load admin name:", error);
    }
}

if (!token) {
    window.location.href = "login.html";
}

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
                Status: ${user.isActive ? "Active" : "Disabled"}
            </p>

            ${user.role !== "Admin" || user.id === loggedInUserId
                ? `<button class="admin-button" onclick="editUser(${user.id})">Edit</button>`
                : ""}

            ${user.role !== "Admin"
                ? `<button class="admin-button" onclick="deleteUser(${user.id})">Delete</button>`
                : ""}

            ${user.role !== "Admin" && user.isActive
                ? `<button class="admin-button" onclick="disableUser(${user.id})">Disable</button>`
                : ""}

            ${user.role !== "Admin" && !user.isActive
                ? `<button class="admin-button" onclick="enableUser(${user.id})">Enable</button>`
            : ""}

            <hr>
        `;

            usersContainer.appendChild(userDiv);
        });

    } catch (error) {
        console.error("Could not load users:", error);
    }
}

loadAdminName();
loadUsers();

document.getElementById("logoutButton").addEventListener("click", function () {
    localStorage.removeItem("userId");
    localStorage.removeItem("token");

    sessionStorage.clear();

    window.location.href = "login.html";
});

let selectedUserId = null;

async function editUser(userId) {

    selectedUserId = userId;

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

        const user = users.find(function (user) {
            return user.id === userId;
        });

        if (!user) {
            alert("User not found.");
            return;
        }

        document.getElementById("editFirstName").value = user.firstName;
        document.getElementById("editLastName").value = user.lastName;
        document.getElementById("editEmail").value = user.email;
        document.getElementById("editRole").value = user.role;
        document.getElementById("editTitle").textContent = "Edit - " + user.username;

        document.getElementById("editMenu").style.display = "block";

    } catch (error) {
        console.error("Could not load user:", error);
        alert("Could not load user information.");
    }
}

    async function saveUserChanges() {

        const firstName = document.getElementById("editFirstName").value.trim();
        const lastName = document.getElementById("editLastName").value.trim();
        const email = document.getElementById("editEmail").value.trim();
        const role = document.getElementById("editRole").value;

        if (firstName === "") {
            alert("First name cannot be empty.");
            return;
        }

        if (lastName === "") {
            alert("Last name cannot be empty.");
            return;
        }

        if (email === "") {
            alert("Email cannot be empty.");
            return;
        }

        try {

const userUpdated = await updateUser({
    firstName: firstName,
    lastName: lastName,
    email: email
});

if (!userUpdated) {
    return;
}

const roleUpdated = await updateUserRole(role);

if (!roleUpdated) {
    return;
}

document.getElementById("editMenu").style.display = "none";

selectedUserId = null;

await loadUsers();

        } catch (error) {

            console.error("Could not save changes:", error);
        }
    }

async function updateUser(updateData) {

    try {
        const response = await fetch(
            `https://andileuserportal.somee.com/api/admin/users/${selectedUserId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            }
        );

        const data = await response.json();

        if (response.ok) {
            return true;

        } else if (data.errors) {
            const errors = Object.values(data.errors).flat();
            alert(errors.join(" "));
            return false;

        } else {
            alert(data.message || "Failed to update user.");
            return false;
        }

    } catch (error) {
        console.error("Could not update user:", error);
        alert("Could not connect to the server.");
        return false;
    }
}

function closeEditMenu() {

    document.getElementById("editMenu").style.display = "none";

    selectedUserId = null;

     loadUsers();
}

async function deleteUser(userId) {

    const confirmed = confirm(
        "Are you sure you want to delete this user?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `https://andileuserportal.somee.com/api/admin/users/${userId}`,
            {
                method: "DELETE",
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
            alert("You cannot delete another Admin.");
        } else {
            alert(data.message || "Failed to delete user.");
        }

    } catch (error) {
        console.error("Could not delete user:", error);
        alert("Could not connect to the server.");
    }
}

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
            alert("You cannot disable another Admin.");
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
            alert("You cannot enable another Admin.");
        } else {
            alert(data.message || "Failed to enable user.");
        }

    } catch (error) {
        console.error("Could not enable user:", error);
        alert("Could not connect to the server.");
    }
}

async function updateUserRole(role) {

    try {
        const response = await fetch(
            `https://andileuserportal.somee.com/api/admin/users/${selectedUserId}/role`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    role: role
                })
            }
        );

        const data = response.headers
            .get("content-type")
            ?.includes("application/json")
            ? await response.json()
            : {};

        if (response.ok) {
            return true;

        } else if (response.status === 403) {
            alert("You cannot change the role of an Admin.");
            return false;

        } else {
            alert(data.message || "Failed to update user role.");
            return false;
        }

    } catch (error) {
        console.error("Could not update user role:", error);
        alert("Could not connect to the server.");
        return false;
    }
}