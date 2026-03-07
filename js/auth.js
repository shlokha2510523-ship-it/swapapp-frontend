const API = "https://swapshop-production.up.railway.app";

function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token || token === "swapapp-demo-token") {
        window.location.href = "login.html";
    }
}

document.addEventListener("DOMContentLoaded", () => {

    // Protect dashboard
    if (window.location.pathname.includes("dashboard.html")) {
        checkAuth();
    }

    // LOGIN
    const loginForm = document.getElementById("loginForm");
<<<<<<< HEAD
    if (loginForm) {
=======

    if (loginForm && !loginForm.dataset.listenerAdded) {

        loginForm.dataset.listenerAdded = "true";

>>>>>>> 98dac289955e2e83b7ab255a5c55733aa3c4bd8b
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();

            if (!email || !password) {
                alert("Please fill all fields");
                return;
            }

            try {
<<<<<<< HEAD
                const res = await fetch(`${API}/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();

                if (data.token) {
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user", JSON.stringify(data.user));
                    alert("Login successful!");
                    window.location.href = "dashboard.html";
                } else {
                    alert(data.message || "Login failed");
                }
            } catch (err) {
                alert("Error connecting to server");
                console.error(err);
            }
        });
    }

    // REGISTER
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();

            if (!name || !email || !password) {
                alert("Please fill all fields");
                return;
            }

            try {
                const res = await fetch(`${API}/auth/signup`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password })
                });
                const data = await res.json();

                if (res.ok) {
                    alert("Account created! Please login.");
                    window.location.href = "login.html";
                } else {
                    alert(data.message || "Registration failed");
                }
            } catch (err) {
                alert("Error connecting to server");
                console.error(err);
            }
        });
    }

    // CREATE PROJECT
    const createProjectForm = document.getElementById("createProjectForm");
    if (createProjectForm) {
        createProjectForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const token = localStorage.getItem("token");
            const title = document.getElementById("projectTitle").value.trim();
            const description = document.getElementById("projectDescription").value.trim();
            const category = document.getElementById("projectType").value;

            if (!title || !description) {
                alert("Please fill all fields");
                return;
            }

            try {
                const res = await fetch(`${API}/projects`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ title, description, category, percentComplete: 0 })
                });
                const data = await res.json();

                if (res.ok) {
                    alert("Project created successfully!");
                    window.location.href = "project.html";
                } else {
                    alert(data.message || "Failed to create project");
                }
            } catch (err) {
                alert("Error connecting to server");
                console.error(err);
            }
        });
    }

    // LOGOUT
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "login.html";
=======
                const data = await apiRequest("/auth/login", "POST", {
                    email,
                    password
                });

                localStorage.setItem("token", data.token);
                localStorage.setItem("currentUser", JSON.stringify({
                    id: data.user?.id || data.id,
                    name: data.user?.name || data.name
                }));
                window.location.href = "dashboard.html";
            } catch (error) {
                alert(error.message);
            }
>>>>>>> 98dac289955e2e83b7ab255a5c55733aa3c4bd8b
        });

    }

});