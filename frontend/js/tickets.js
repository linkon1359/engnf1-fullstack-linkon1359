if (!getToken()) {
  window.location.href = "index.html";
}

const statusBox = document.getElementById("statusBox");
const ticketsBody = document.getElementById("ticketsBody");
const detailPanel = document.getElementById("detailPanel");
let selectedTicket = null;
let currentTickets = [];

document.getElementById("logoutBtn").addEventListener("click", () => {
  clearToken();
  window.location.href = "index.html";
});

async function loadStats() {
  try {
    const stats = await apiRequest("/stats");
    setSafeText(document.getElementById("statReviewed"), stats?.reviewedCount ?? 0);
    const rate = stats?.modelAgreementRate ?? 0;
    setSafeText(document.getElementById("statAgreement"), `${rate}%`);
  } catch {
    // Keep UI usable even if stats endpoint is still being built
  }
}

async function loadTickets() {
  hideMessage(statusBox);
  showMessage(statusBox, "Loading tickets...", "info");
  ticketsBody.innerHTML = "";

  const params = new URLSearchParams();
  const q = document.getElementById("searchQ").value.trim();
  const status = document.getElementById("filterStatus").value;
  const category = document.getElementById("filterCategory").value;
  const priority = document.getElementById("filterPriority").value;

  if (q) params.set("q", q);
  if (status) params.set("status", status);
  if (category) params.set("category", category);
  if (priority) params.set("priority", priority);

  try {
    const res = await apiRequest(`/tickets?${params.toString()}`);
    const list = Array.isArray(res) ? res : (res?.data || []);
    currentTickets = list;
    hideMessage(statusBox);

    if (list.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 6;
      td.textContent = "No tickets found.";
      tr.appendChild(td);
      ticketsBody.appendChild(tr);
      return;
    }

    list.forEach((t) => {
      const tr = document.createElement("tr");

      const tdId = document.createElement("td");
      tdId.textContent = t.id ?? "";

      const tdSub = document.createElement("td");
      tdSub.textContent = t.subject ?? "";

      const tdCat = document.createElement("td");
      tdCat.textContent = t.category ?? t.autoCategory ?? "";

      const tdPri = document.createElement("td");
      tdPri.textContent = t.priority ?? "";

      const tdStat = document.createElement("td");
      tdStat.textContent = t.status ?? "";

      const tdAct = document.createElement("td");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "Inspect";
      btn.addEventListener("click", () => openTicketDetail(t));
      tdAct.appendChild(btn);

      tr.append(tdId, tdSub, tdCat, tdPri, tdStat, tdAct);
      ticketsBody.appendChild(tr);
    });
  } catch (err) {
    showMessage(statusBox, err.message, "error");
  }
}

async function openTicketDetail(ticket) {
  selectedTicket = { ...ticket };
  detailPanel.style.display = "block";
  setSafeText(document.getElementById("detailSubject"), `Subject: ${ticket.subject}`);
  setSafeText(document.getElementById("detailBody"), `Body: ${ticket.body}`);
  document.getElementById("editStatus").value = ticket.status || "OPEN";
  document.getElementById("editPriority").value = ticket.priority || "MEDIUM";

  const eventsList = document.getElementById("eventsList");
  eventsList.innerHTML = "";
  try {
    const detail = await apiRequest(`/tickets/${ticket.id}`);
    const events = detail?.events || [];
    if (events.length === 0) {
      const li = document.createElement("li");
      li.textContent = "No audit events.";
      eventsList.appendChild(li);
    } else {
      events.forEach((ev) => {
        const li = document.createElement("li");
        li.textContent = `${ev.field}: ${ev.oldValue ?? "-"} -> ${ev.newValue ?? "-"} (${ev.actor ?? "system"})`;
        eventsList.appendChild(li);
      });
    }
  } catch {
    // Ignore if detail endpoint isn't ready yet
  }
}

document.getElementById("saveTicketBtn").addEventListener("click", async () => {
  if (!selectedTicket) return;
  const prevStatus = selectedTicket.status;
  const prevPriority = selectedTicket.priority;
  const nextStatus = document.getElementById("editStatus").value;
  const nextPriority = document.getElementById("editPriority").value;

  // Optimistic UI update
  selectedTicket.status = nextStatus;
  selectedTicket.priority = nextPriority;
  hideMessage(statusBox);
  showMessage(statusBox, "Saving changes...", "info");

  try {
    await apiRequest(`/tickets/${selectedTicket.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: nextStatus, priority: nextPriority })
    });
    showMessage(statusBox, "Ticket updated.", "info");
    await loadTickets();
    await loadStats();
  } catch (err) {
    // Rollback on error
    selectedTicket.status = prevStatus;
    selectedTicket.priority = prevPriority;
    document.getElementById("editStatus").value = prevStatus;
    document.getElementById("editPriority").value = prevPriority;
    showMessage(statusBox, `Update failed, rolled back: ${err.message}`, "error");
  }
});

document.getElementById("applyFiltersBtn").addEventListener("click", loadTickets);

document.getElementById("reimportBtn").addEventListener("click", async () => {
  try {
    await apiRequest("/tickets/import", {
      method: "POST",
      body: JSON.stringify({ tickets: [] })
    });
    showMessage(statusBox, "Feed re-import triggered.", "info");
    await loadTickets();
    await loadStats();
  } catch (err) {
    showMessage(statusBox, err.message, "error");
  }
});

loadStats();
loadTickets();