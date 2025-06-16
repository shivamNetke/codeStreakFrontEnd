const API_URL = 'https://codestreak.onrender.com'; // Change if hosted locally

// ----- Handle Login -----
if (document.getElementById("loginForm")) {
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const msg = document.getElementById("responseMsg");

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem("username", username);
        window.location.href = "codestreakk.html";
      } else {
        msg.textContent = data.message || 'Invalid credentials';
        msg.style.color = 'red';
      }
    } catch (err) {
      msg.textContent = 'Login failed. Try again later.';
      msg.style.color = 'red';
    }
  });
}

// ----- Handle Registration -----
if (document.getElementById("registerForm")) {
  document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("regUsername").value.trim();
    const password = document.getElementById("regPassword").value.trim();
    const msg = document.getElementById("responseMsg");

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (data.success) {
        msg.textContent = 'Registration successful! You can login now.';
        msg.style.color = 'green';
      } else {
        msg.textContent = data.message || 'Registration failed';
        msg.style.color = 'red';
      }
    } catch (err) {
      msg.textContent = 'Server error during registration.';
      msg.style.color = 'red';
    }
  });
}

// ----- codestreakk.html logic -----
if (window.location.pathname.includes("codestreakk.html")) {
  const username = localStorage.getItem("username");
  const codeArea = document.getElementById("codeArea");
  const saveBtn = document.getElementById("saveCode");
  const streakDiv = document.getElementById("streak");

  if (!username) {
    alert("Please login first");
    window.location.href = "login.html";
  }

  // Load saved code and streak
  fetch(`${API_URL}/get-codes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username })
  })
    .then(res => res.json())
    .then(result => {
      if (result.success && result.codes) {
        const entries = Object.entries(result.codes);
        entries.sort((a, b) => new Date(b[0]) - new Date(a[0]));

        // Calculate streak
        let streakCount = 0;
        const today = new Date().toISOString().slice(0, 10);
        if (result.codes[today]) {
          streakCount = 1;
          let d = new Date(today);
          while (true) {
            d.setDate(d.getDate() - 1);
            const prev = d.toISOString().slice(0, 10);
            if (result.codes[prev]) streakCount++;
            else break;
          }
        }

        streakDiv.innerHTML = `<strong>Code Streak:</strong> ${streakCount} day(s)`;

        // Load latest code
        if (entries.length > 0) {
          codeArea.value = entries[0][1];
        }
      } else {
        streakDiv.innerHTML = "No code found.";
      }
    })
    .catch(err => {
      console.error("Error loading streak:", err);
      streakDiv.innerHTML = `<span style="color:red">Failed to load streak</span>`;
    });

  // Save code
  saveBtn.addEventListener("click", async () => {
    const code = codeArea.value.trim();
    const date = new Date().toISOString().slice(0, 10);

    if (!code) return alert("Write some code!");

    const res = await fetch(`${API_URL}/submit-code`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, code, date })
    });

    const data = await res.json();
    if (data.success) {
      alert("Code saved successfully!");
      window.location.reload();
    } else {
      alert("Error saving code.");
    }
  });
}
