if (!getToken()) {
  window.location.href = "index.html";
}

const statusBox = document.getElementById("statusBox");
const bookingsBody = document.getElementById("bookingsBody");

document.getElementById("logoutBtn").addEventListener("click", () => {
  clearToken();
  window.location.href = "index.html";
});

async function loadMyBookings() {
  hideMessage(statusBox);
  showMessage(statusBox, "Loading bookings...", "info");
  bookingsBody.innerHTML = "";

  const params = new URLSearchParams();
  const st = document.getElementById("bookingStatusFilter").value;
  if (st) params.set("status", st);

  try {
    const res = await apiRequest(`/bookings/mine?${params.toString()}`);
    const list = Array.isArray(res) ? res : (res?.data || []);
    hideMessage(statusBox);

    if (list.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 5;
      td.textContent = "No bookings found.";
      tr.appendChild(td);
      bookingsBody.appendChild(tr);
      return;
    }

    list.forEach((b) => {
      const tr = document.createElement("tr");

      const tdId = document.createElement("td");
      tdId.textContent = b.id ?? "";

      const tdRes = document.createElement("td");
      tdRes.textContent = b.resourceId ?? "";

      const tdSt = document.createElement("td");
      tdSt.textContent = b.status ?? "";

      const tdPur = document.createElement("td");
      tdPur.textContent = b.purpose ?? "";

      const tdAct = document.createElement("td");
      if (b.status === "PENDING" || b.status === "APPROVED") {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = "Cancel";
        btn.addEventListener("click", () => cancelBooking(b.id));
        tdAct.appendChild(btn);
      } else {
        tdAct.textContent = "-";
      }

      tr.append(tdId, tdRes, tdSt, tdPur, tdAct);
      bookingsBody.appendChild(tr);
    });
  } catch (err) {
    showMessage(statusBox, err.message, "error");
  }
}

async function cancelBooking(id) {
  try {
    await apiRequest(`/bookings/${id}/cancel`, { method: "PATCH" });
    showMessage(statusBox, "Booking cancelled.", "info");
    await loadMyBookings();
  } catch (err) {
    showMessage(statusBox, err.message, "error");
  }
}

document.getElementById("refreshBookingsBtn").addEventListener("click", loadMyBookings);
loadMyBookings();