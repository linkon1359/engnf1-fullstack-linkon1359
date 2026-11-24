if (!getToken()) {
  window.location.href = "index.html";
}

const statusBox = document.getElementById("statusBox");
const resourcesBody = document.getElementById("resourcesBody");

document.getElementById("logoutBtn").addEventListener("click", () => {
  clearToken();
  window.location.href = "index.html";
});

async function loadResources() {
  hideMessage(statusBox);
  showMessage(statusBox, "Loading resources...", "info");
  resourcesBody.innerHTML = "";

  const params = new URLSearchParams();
  const search = document.getElementById("resSearch").value.trim();
  const type = document.getElementById("resType").value;
  const minCap = document.getElementById("resCapacity").value;

  if (search) params.set("search", search);
  if (type) params.set("type", type);
  if (minCap) params.set("minCapacity", minCap);

  try {
    const res = await apiRequest(`/resources?${params.toString()}`);
    const list = Array.isArray(res) ? res : (res?.data || []);
    hideMessage(statusBox);

    if (list.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 5;
      td.textContent = "No resources found.";
      tr.appendChild(td);
      resourcesBody.appendChild(tr);
      return;
    }

    list.forEach((r) => {
      const tr = document.createElement("tr");

      const tdId = document.createElement("td");
      tdId.textContent = r.id ?? "";

      const tdName = document.createElement("td");
      tdName.textContent = r.name ?? "";

      const tdType = document.createElement("td");
      tdType.textContent = r.type ?? "";

      const tdCap = document.createElement("td");
      tdCap.textContent = r.capacity ?? "";

      const tdSel = document.createElement("td");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "Use ID";
      btn.addEventListener("click", () => {
        document.getElementById("bookResourceId").value = r.id;
      });
      tdSel.appendChild(btn);

      tr.append(tdId, tdName, tdType, tdCap, tdSel);
      resourcesBody.appendChild(tr);
    });
  } catch (err) {
    showMessage(statusBox, err.message, "error");
  }
}

document.getElementById("bookingForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  hideMessage(statusBox);

  const resourceId = Number(document.getElementById("bookResourceId").value);
  const startVal = document.getElementById("bookStart").value;
  const endVal = document.getElementById("bookEnd").value;
  const purpose = document.getElementById("bookPurpose").value.trim();

  try {
    await apiRequest("/bookings", {
      method: "POST",
      body: JSON.stringify({
        resourceId,
        startTime: new Date(startVal).toISOString(),
        endTime: new Date(endVal).toISOString(),
        purpose
      })
    });
    showMessage(statusBox, "Booking request submitted.", "info");
    e.target.reset();
  } catch (err) {
    showMessage(statusBox, err.message, "error");
  }
});

document.getElementById("loadResBtn").addEventListener("click", loadResources);
loadResources();