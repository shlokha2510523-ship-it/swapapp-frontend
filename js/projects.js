let currentFilter = "All";
let currentSearch = "";


document.addEventListener("DOMContentLoaded", () => {

    setInterval(() => {

        if (window.loadProjects) {
            window.loadProjects();
        }

    }, 3000);

    const searchInput = document.getElementById("searchInput");

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            currentSearch = e.target.value.toLowerCase();
            loadProjects();
        });
    }

    const projectForm = document.getElementById("projectForm");

    loadProjects();

    if (projectForm) {
        projectForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const title = document.getElementById("title").value.trim();
            const description = document.getElementById("description").value.trim();
            const type = document.getElementById("type").value;

            if (!title || !description) {
                alert("Fill all fields");
                return;
            }

            try {
                const user = JSON.parse(localStorage.getItem("currentUser")) || { name: "User" };

                await apiRequest("/projects", "POST", {
                    title: title,
                    description: description,
                    type: type,
                    status: "Open",
                    lat: 20 + Math.random()*10,
                    lng: 75 + Math.random()*10,
                    createdBy: user.name,
                    reservedBy: null,
                    completedBy: null,
                    reservedAt: null,
                    history: [
                        {
                            action: "Created",
                            user: user.name,
                            time: Date.now()
                        }
                    ]
                });

                projectForm.reset();
                loadProjects();

            } catch (error) {
                alert(error.message);
            }
        });
    }

});

window.loadProjects = async function () {

    // 1. Fetch first
    const projects = await apiRequest("/projects", "GET");

    // 2. Expiry check
    projects.forEach(project => {

        if (
            project.status === "Reserved" &&
            project.reservedAt &&
            Date.now() - project.reservedAt > 10000
        ) {
            project.status = "Open";
            project.reservedAt = null;
        }

    });

    localStorage.setItem("mockProjects", JSON.stringify(projects));

    // 3. Update counters BEFORE the early return
    updateMetrics(projects);

    // 4. Check DOM element
    const projectList = document.getElementById("projectList");
    if (!projectList) return;

    // 5. Safe to use now
    projectList.innerHTML = "";

    // FILTER
    let filteredProjects = projects;

    if (currentFilter !== "All") {
        filteredProjects = filteredProjects.filter(
            p => p.status === currentFilter
        );
    }

    // SEARCH
    if (currentSearch) {
        filteredProjects = filteredProjects.filter(
            p => p.title.toLowerCase().includes(currentSearch)
        );
    }

    if (filteredProjects.length === 0) {

        projectList.innerHTML = `
            <div class="text-center p-10 text-gray-500">
                <p class="text-lg">No projects found</p>
                <p class="text-sm">Create a new project to get started.</p>
            </div>
        `;

        return;

    }

    filteredProjects.forEach(project => {

        const card = document.createElement("div");

        card.className =
            "bg-white p-4 rounded-lg shadow-md transition transform hover:scale-105";

        card.innerHTML = `
            <h3 class="text-lg font-bold">${project.title}</h3>
            <p class="text-sm text-gray-600">${project.description}</p>
            <p class="mt-2 text-sm">Type: ${project.type}</p>
            <p class="text-xs text-gray-500">
            Created by: ${project.createdBy || "Unknown"}
            </p>

            ${project.reservedBy ? `
            <p class="text-xs text-gray-500">
            Reserved by: ${project.reservedBy}
            </p>
            ` : ""}
            <p class="text-sm font-medium mt-2">
                Status: 
                <span class="${getStatusColor(project.status)} px-2 py-1 rounded text-xs">
                 ${project.status} ${getRemainingTime(project)}
                </span>
            </p>
            <div class="mt-3 space-x-2">

                ${getActionButtons(project)}

                <button onclick="viewProject(${project.id})"
                    class="bg-blue-200 hover:bg-blue-300 px-3 py-1 rounded text-sm">
                    View
                </button>

                <button onclick="deleteProject(${project.id})"
                    class="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm">
                    Delete
                </button>

            </div>
        `;

        projectList.appendChild(card);

    });

};

function getStatusColor(status) {
    if (status === "Open") return "bg-accent";
    if (status === "Reserved") return "bg-primaryDark";
    if (status === "Completed") return "bg-secondaryDark";
}

function getActionButtons(project) {

    if (project.status === "Open") {
        return `<button onclick="updateStatus(${project.id}, 'Reserved')" 
                class="bg-green-300 hover:bg-green-400 text-gray-800 px-3 py-1 rounded text-sm transition">
                Reserve
                </button>`;
    }

    if (project.status === "Reserved") {
        return `<button onclick="updateStatus(${project.id}, 'Completed')" 
                class="bg-red-300 hover:bg-red-400 text-gray-800 px-3 py-1 rounded text-sm transition">
                Complete
                </button>`;
    }

    return "";
}

async function updateStatus(id, newStatus) {

    try {

        const projects = await apiRequest("/projects", "GET");

        const project = projects.find(p => p.id == id);

        if (!project.history) {
            project.history = [];
        }

        const user = JSON.parse(localStorage.getItem("currentUser")) || { name: "Guest" };

        project.history.push({
            action: newStatus,
            user: user.name,
            time: Date.now()
        });

        await apiRequest(`/projects/${id}`, "PATCH", {
            status: newStatus,
            reservedBy: newStatus === "Reserved" ? user.name : project.reservedBy,
            completedBy: newStatus === "Completed" ? user.name : project.completedBy,
            history: project.history
        });

        loadProjects();

    } catch (error) {
        alert(error.message);
    }
}

function updateMetrics(projects) {

    const total = projects.length;
    const open = projects.filter(p => p.status === "Open").length;
    const reserved = projects.filter(p => p.status === "Reserved").length;
    const completed = projects.filter(p => p.status === "Completed").length;

    const totalEl = document.getElementById("totalCount");
    const openEl = document.getElementById("openCount");
    const reservedEl = document.getElementById("reservedCount");
    const completedEl = document.getElementById("completedCount");

    if (totalEl) totalEl.innerText = total;
    if (openEl) openEl.innerText = open;
    if (reservedEl) reservedEl.innerText = reserved;
    if (completedEl) completedEl.innerText = completed;
}

function setFilter(status) {
    currentFilter = status;
    loadProjects();
}

async function deleteProject(id) {

    if (!confirm("Delete this project?")) return;

    try {

        const projects = await apiRequest("/projects", "GET");

        const project = projects.find(p => p.id == id);

        if (project.history) {
            project.history.push({
                action: "Deleted",
                time: Date.now()
            });
        }

        await apiRequest(`/projects/${id}`, "DELETE");

        loadProjects();

    } catch (error) {
        alert(error.message);
    }
}

function getRemainingTime(project) {

    if (!project.reservedAt) return "";

    const remaining = 10 - Math.floor((Date.now() - project.reservedAt) / 1000);

    if (remaining <= 0) return "";

    return `⏳ ${remaining}s`;

}

function viewProject(id) {

    window.location.href = `project-details.html?id=${id}`;

}

async function loadProjectDetails() {
    const container = document.getElementById("projectDetails");

    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    const projects = await apiRequest("/projects", "GET");

    const project = projects.find(p => p.id == id);

    if (!project) {
        container.innerHTML = "Project not found";
        return;
    }

    const historyHTML = project.history
        ? project.history.map(h => `
            <li class="text-sm text-gray-600">
                ${h.action} by ${h.user || "Unknown"} - ${new Date(h.time).toLocaleString()}
            </li>
        `).join("")
        : "<li>No history available</li>";

    container.innerHTML = `
    <h2 class="text-xl font-bold">${project.title}</h2>

    <p class="mt-2 text-gray-600">${project.description}</p>

    <p class="mt-4"><strong>Type:</strong> ${project.type}</p>
    <p class="mt-2"><strong>Status:</strong> ${project.status}</p>

    <p class="mt-2">
    <strong>Created By:</strong> ${project.createdBy || "Unknown"}
    </p>

    ${project.reservedBy ? `
    <p>
    <strong>Reserved By:</strong> ${project.reservedBy}
    </p>
    ` : ""}

    ${project.completedBy ? `
    <p>
    <strong>Completed By:</strong> ${project.completedBy}
    </p>
    ` : ""}

    <h3 class="mt-4 font-bold">History</h3>
    <ul class="mt-2 space-y-1">
        ${historyHTML}
    </ul>
    `;
}

document.addEventListener("DOMContentLoaded", () => {

    if (window.location.pathname.includes("project-details.html")) {
        loadProjectDetails();
    }

    if (window.location.pathname.includes("profile.html")) {
        setTimeout(loadProfile, 200);
    }

    if (window.location.pathname.includes("activity.html")) {
        loadActivity();
    }

    if (window.location.pathname.includes("map.html")) {
        loadMap();
    }

});

async function loadProfile() {

    const profileContainer = document.getElementById("profileInfo");
    const projectContainer = document.getElementById("myProjects");

    if (!profileContainer) return;

    const user = JSON.parse(localStorage.getItem("currentUser")) || { name: "User" };

    let projects = [];

    try {
        projects = await apiRequest("/projects", "GET");
    } catch {
        projects = JSON.parse(localStorage.getItem("mockProjects")) || [];
    }

    const created = projects.filter(p => (p.createdBy || "").toLowerCase() === user.name.toLowerCase());
    const reserved = projects.filter(p => (p.reservedBy || "").toLowerCase() === user.name.toLowerCase());
    const completed = projects.filter(p => (p.completedBy || "").toLowerCase() === user.name.toLowerCase());

    profileContainer.innerHTML = `
        <h2 class="text-xl font-bold">${user.name}</h2>

        <p class="mt-2">Projects Created: ${created.length}</p>
        <p>Projects Reserved: ${reserved.length}</p>
        <p>Projects Completed: ${completed.length}</p>
    `;

    projectContainer.innerHTML = "";

    created.forEach(project => {

        const card = document.createElement("div");

        card.className = "bg-white p-4 rounded-lg shadow";

        card.innerHTML = `
            <h3 class="font-bold">${project.title}</h3>
            <p class="text-sm text-gray-600">${project.description}</p>
            <p class="text-xs mt-2">Status: ${project.status}</p>
        `;

        projectContainer.appendChild(card);

    });

}

async function loadActivity() {

    const container = document.getElementById("activityList");

    if (!container) return;

    let projects = [];

    try {
        projects = await apiRequest("/projects", "GET");
    } catch {
        projects = JSON.parse(localStorage.getItem("mockProjects")) || [];
    }

    let activities = [];

    projects.forEach(project => {

        if (project.history) {

            project.history.forEach(event => {

                activities.push({
                    title: project.title,
                    action: event.action,
                    user: event.user || "Unknown",
                    time: event.time
                });

            });

        }

    });

    activities.sort((a, b) => b.time - a.time);

    container.innerHTML = "";

    activities.forEach(act => {

        const card = document.createElement("div");

        card.className = "bg-white p-4 rounded shadow";

        card.innerHTML = `
            <p class="font-semibold">${act.action}</p>
            <p class="text-sm text-gray-600">${act.title}</p>
            <p class="text-xs text-gray-500">
                by ${act.user} • ${new Date(act.time).toLocaleString()}
            </p>
        `;

        container.appendChild(card);

    });

}

function loadMap() {

    const mapContainer = document.getElementById("map");

    if (!mapContainer) return;

    const map = L.map('map').setView([20.5937, 78.9629], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);

    loadMapProjects(map);
}

async function loadMapProjects(map) {

    let projects = [];

    try {
        projects = await apiRequest("/projects", "GET");
    } catch {
        projects = JSON.parse(localStorage.getItem("mockProjects")) || [];
    }

    projects.forEach(project => {

        if (!project.lat || !project.lng) return;

        const marker = L.marker([project.lat, project.lng]).addTo(map);

        marker.bindPopup(`
            <strong>${project.title}</strong><br>
            ${project.description}<br>
            Status: ${project.status}
        `);

    });

}

