const API = "https://swapshop-production.up.railway.app";

function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
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
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();

            if (!email || !password) {
                alert("Please fill all fields");
                return;
            }

            try {
                const res = await fetch(`${API}/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();

                if (data.token) {
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user", JSON.stringify(data.user));
                    localStorage.setItem("currentUser", JSON.stringify(data.user));
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
                const res = await fetch(`${API}/auth/register`, {
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

    // LOGOUT
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("currentUser");
            window.location.href = "login.html";
        });
    }

});