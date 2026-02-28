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

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();

            if (!email || !password) {
                alert("Please fill all fields");
                return;
            }

            // Temporary mock login
            const fakeToken = "swapapp-demo-token";

            localStorage.setItem("token", fakeToken);

            alert("Login successful!");
            window.location.href = "dashboard.html";
        });
    }

});