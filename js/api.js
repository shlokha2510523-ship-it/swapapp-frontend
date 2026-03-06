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

    return data;
}