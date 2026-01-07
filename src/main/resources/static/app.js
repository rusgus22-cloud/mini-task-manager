const API = "/api";
let currentUserId = null;



function loadUsers() {
    fetch(API + "/users")
        .then(r => r.json())
        .then(users => {
            const usersDiv = document.getElementById("users");
            usersDiv.innerHTML = "";

            users.forEach(user => {
                const div = document.createElement("div");
                div.className = "card user";

                div.innerHTML = `
                    <span onclick="loadTasks(${user.id})">
                        ${user.name} (${user.email})
                    </span>
                    <button class="delete" onclick="deleteUser(${user.id}); event.stopPropagation()">❌</button>
                `;

                usersDiv.appendChild(div);
            });
        });
}

function addUser() {
    const name = document.getElementById("userName").value;
    const email = document.getElementById("userEmail").value;

    if (!name || !email) {
        alert("Name and email required");
        return;
    }

    fetch(API + "/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email })
    }).then(() => {
        document.getElementById("userName").value = "";
        document.getElementById("userEmail").value = "";
        loadUsers();
    });
}

function deleteUser(userId) {
    if (!confirm("Delete user?")) return;

    fetch(API + "/users/" + userId, {
        method: "DELETE"
    }).then(() => {
        document.getElementById("tasks").innerHTML = "";
        document.getElementById("taskForm").style.display = "none";
        loadUsers();
    });
}



function loadTasks(userId) {
    currentUserId = userId;
    document.getElementById("taskForm").style.display = "block";

    fetch(API + "/users/" + userId + "/tasks")
        .then(r => r.json())
        .then(tasks => {
            const div = document.getElementById("tasks");
            div.innerHTML = "";

            if (tasks.length === 0) {
                div.innerHTML = "<i>No tasks</i>";
                return;
            }

            tasks.forEach(t => {
                const el = document.createElement("div");
                el.className = "task";
                el.innerHTML = `
                    <b>${t.title}</b>
                    <span class="status ${t.status}">${t.status}</span>
                    <br/>
                    <small>${t.description}</small>
                    <br/>
                    <select onchange="updateStatus(${t.id}, this.value)">
                        <option value="TODO" ${t.status === "TODO" ? "selected" : ""}>TODO</option>
                        <option value="IN_PROGRESS" ${t.status === "IN_PROGRESS" ? "selected" : ""}>IN_PROGRESS</option>
                        <option value="DONE" ${t.status === "DONE" ? "selected" : ""}>DONE</option>
                    </select>
                    <button onclick="deleteTask(${t.id})">🗑</button>
                `;
                div.appendChild(el);
            });
        });
}



function addTask() {
    if (!currentUserId) {
        alert("Select user first");
        return;
    }

    const title = document.getElementById("taskTitle").value;
    const description = document.getElementById("taskDesc").value;
    const status = document.getElementById("taskStatus").value;

    fetch(API + "/users/" + currentUserId + "/tasks", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title: title,
            description: description,
            status: status
        })
    })
    .then(res => {
        if (!res.ok) throw new Error("Failed to create task");
        return res.json();
    })
    .then(() => {
        loadTasks(currentUserId);
        document.getElementById("taskTitle").value = "";
        document.getElementById("taskDesc").value = "";
    })
    .catch(err => alert(err.message));
}


function updateStatus(taskId, status) {
    fetch(API + "/tasks/" + taskId + "/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(status)
    });
}

function deleteTask(taskId) {
    if (!confirm("Delete task?")) return;

    fetch(API + "/tasks/" + taskId, {
        method: "DELETE"
    }).then(() => loadTasks(currentUserId));
}



loadUsers();
