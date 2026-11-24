const alertBox = document.getElementById("alertBox");

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideMessage(alertBox);
    showMessage(alertBox, "Logging in...", "info");

    try {
      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value;
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      if (data?.token) {
        setToken(data.token);
      }
      window.location.href = "dashboard.html";
    } catch (err) {
      showMessage(alertBox, err.message, "error");
    }
  });
}

const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideMessage(alertBox);
    showMessage(alertBox, "Creating account...", "info");

    try {
      const name = document.getElementById("regName").value.trim();
      const email = document.getElementById("regEmail").value.trim();
      const password = document.getElementById("regPassword").value;
      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password })
      });
      showMessage(alertBox, "Account registered! Now log in above.", "info");
      registerForm.reset();
    } catch (err) {
      showMessage(alertBox, err.message, "error");
    }
  });
}