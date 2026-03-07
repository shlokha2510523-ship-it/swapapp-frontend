const API = "https://swapshop-production.up.railway.app";

async function loadComponent(id, file) {
    try {
        const response = await fetch(file);
        const content = await response.text();
        document.getElementById(id).innerHTML = content;
    } catch (err) {
        console.error("Failed to load component:", file);
    }
}

async function loadProjects() {
    const container = document.getElementById("projectsList");
    if (!container) return;

    try {
        const res = await fetch(`${API}/projects`);
        const data = await res.json();
        const projects = data.projects || data;

        if (!projects.length) {
            container.innerHTML = "<p class='text-gray-500'>No projects yet.</p>";
            return;
        }

        container.innerHTML = projects.map(p => `
            <div class="bg-white p-4 rounded-lg shadow mb-4">
                <h3 class="font-bold text-lg">${p.title}</h3>
                <p class="text-gray-600 text-sm">${p.description || ""}</p>
                <p class="text-sm mt-2">Category: ${p.category || "N/A"} | Progress: ${p.percentComplete || 0}%</p>
            </div>
        `).join("");
    } catch (err) {
        console.error("Failed to load projects:", err);
    }
}

async function loadDashboard() {
    const token = localStorage.getItem("token");
    const container = document.getElementById("dashboardStats");
    if (!container) return;

    try {
        const res = await fetch(`${API}/dashboard`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();

        container.innerHTML = `
            <div class="grid grid-cols-2 gap-4 mt-6">
                <div class="bg-white p-4 rounded-lg shadow text-center">
                    <p class="text-2xl font-bold text-accent">${data.globalImpact?.projectsCreated || 0}</p>
                    <p class="text-sm text-gray-600">Projects Created</p>
                </div>
                <div class="bg-white p-4 rounded-lg shadow text-center">
                    <p class="text-2xl font-bold text-accent">${data.globalImpact?.handoffsCompleted || 0}</p>
                    <p class="text-sm text-gray-600">Handoffs Completed</p>
                </div>
                <div class="bg-white p-4 rounded-lg shadow text-center">
                    <p class="text-2xl font-bold text-accent">${data.localImpact?.foodItemsDonated || 0}</p>
                    <p class="text-sm text-gray-600">Food Donated</p>
                </div>
                <div class="bg-white p-4 rounded-lg shadow text-center">
                    <p class="text-2xl font-bold text-accent">${data.localImpact?.foodItemsClaimed || 0}</p>
                    <p class="text-sm text-gray-600">Food Claimed</p>
                </div>
            </div>
        `;
    } catch (err) {
        console.error("Failed to load dashboard:", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadComponent("navbar", "components/navbar.html");
    loadProjects();
    loadDashboard();
});