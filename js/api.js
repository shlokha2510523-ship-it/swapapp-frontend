// api.js

async function apiRequest(endpoint, method = "GET", body = null) {

    // Use Mock Mode
    if (CONFIG.MODE === "mock") {
        return mockApi(endpoint, method, body);
    }

    // Use Real Backend Mode
    const token = localStorage.getItem("token");

    const options = {
        method,
        headers: {
            "Content-Type": "application/json"
        }
    };

    if (token) {
        options.headers["Authorization"] = `Bearer ${token}`;
    }

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(CONFIG.BASE_URL + endpoint, options);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
    }

    if (endpoint === "/projects" && method === "GET") {
        return (data.projects || []).map(adaptProject);
    }

    return data.projects ? { ...data, projects: data.projects.map(adaptProject) } : data;
}

function adaptProject(p) {
    return {
        id: p._id,
        title: p.title,
        description: p.description,
        type: p.category || p.itemType || "Durable",
        status: p.status === "active" ? "Open" :
                p.status === "reserved" ? "Reserved" :
                p.status === "completed" ? "Completed" : "Open",
        createdBy: p.authorId?.name || "Unknown",
        reservedBy: p.currentOwnerId?.name || null,
        completedBy: null,
        reservedAt: null,
        lat: null,
        lng: null,
        history: []
    };
}