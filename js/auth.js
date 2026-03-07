function checkAuth() {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
    }
}
document.addEventListener("DOMContentLoaded", () => {

    if (window.location.pathname.includes("dashboard.html")) {
    checkAuth();
}

    const loginForm = document.getElementById("loginForm");

    if (loginForm && !loginForm.dataset.listenerAdded) {

        loginForm.dataset.listenerAdded = "true";

        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();

            if (!email || !password) {
                alert("Please fill all fields");
                return;
            }

            try {
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
        });

    }

});