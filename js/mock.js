// mock.js

let mockProjects = JSON.parse(localStorage.getItem("mockProjects")) || [];

function mockApi(endpoint, method, body) {

    return new Promise((resolve, reject) => {

        setTimeout(() => {

            // LOGIN
            if (endpoint === "/auth/login" && method === "POST") {
                if (body.email === "test@test.com" && body.password === "1234") {
                    resolve({ token: "mock-jwt-token" });
                } else {
                    reject(new Error("Invalid credentials"));
                }
            }

            // REGISTER
            else if (endpoint === "/auth/register" && method === "POST") {
                resolve({ message: "User registered successfully" });
            }

           // CREATE PROJECT
            else if (endpoint === "/projects" && method === "POST") {

                const newProject = {
                id: Date.now(),
                title: body.title,
                description: body.description,
                type: body.type,
                status: "Open",
                createdBy: body.createdBy,
                reservedBy: body.reservedBy || null,
                completedBy: body.completedBy || null,
                reservedAt: null,
                lat: body.lat,
                lng: body.lng,
                history: body.history || []
            };

                mockProjects.push(newProject);
                localStorage.setItem("mockProjects", JSON.stringify(mockProjects));
                resolve(newProject);
            }

            // GET PROJECTS
            else if (endpoint === "/projects" && method === "GET") {
                resolve(mockProjects);
            }

            // UPDATE PROJECT STATUS
            else if (endpoint.startsWith("/projects/") && method === "PATCH") {

                const id = parseInt(endpoint.split("/")[2]);

                const project = mockProjects.find(p => p.id === id);

                if (!project) {
                    reject(new Error("Project not found"));
                    return;
                }

                project.status = body.status;

                if (body.reservedBy !== undefined) project.reservedBy = body.reservedBy;
                if (body.completedBy !== undefined) project.completedBy = body.completedBy;
                if (body.history !== undefined) project.history = body.history;

                if (body.status === "Reserved") {
                    project.reservedAt = Date.now();

                    // AUTO RELEASE TIMER
                    setTimeout(() => {

                        const stored = JSON.parse(localStorage.getItem("mockProjects")) || [];

                        const target = stored.find(p => p.id === id);

                        if (target && target.status === "Reserved") {

                            target.status = "Open";
                            target.reservedAt = null;

                            localStorage.setItem("mockProjects", JSON.stringify(stored));

                            if (window.loadProjects) {
                                window.loadProjects();
                            }

                     }

                    }, 10000);

                } else {

                    project.reservedAt = null;

                }

                localStorage.setItem("mockProjects", JSON.stringify(mockProjects));

                resolve(project);

            }

            else if (endpoint.startsWith("/projects/") && method === "DELETE") {

                const id = parseInt(endpoint.split("/")[2]);

                mockProjects = mockProjects.filter(p => p.id !== id);

                localStorage.setItem("mockProjects", JSON.stringify(mockProjects));

                resolve({ message: "Project deleted" });

            }

            else {
                resolve({ message: "Mock response" });
            }

        }, 500);
    });
}