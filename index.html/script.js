// ========================================
// OUR DATE DASHBOARD - MOBILE FIX
// ========================================

const DASHBOARD_PASSWORD = "Forever2026";
const DASHBOARD_AUTH_KEY = "dateDashboardUnlocked";

const SUPABASE_URL = "https://gysuspjdcogxedetcjnl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_p9a_Z3oe4clvu2O-LZjmBA_IeHi7BfQ";

let supabaseClient = null;

// ========================================
// PASSWORD SCREEN
// ========================================

function showDashboardLogin() {
    document.body.innerHTML = `
        <div class="login-page">
            <div class="login-card">
                <div class="login-heart">♥</div>
                <div class="login-label">PRIVATE DASHBOARD</div>
                <h1>Our Date <span>❤️</span></h1>
                <p>Enter the password to continue.</p>

                <form id="loginForm">
                    <input
                        id="dashboardPassword"
                        type="password"
                        placeholder="Enter password"
                        autocomplete="off"
                        autofocus
                    >

                    <button type="submit">Unlock ❤️</button>
                    <div id="loginError"></div>
                </form>
            </div>
        </div>
    `;

    const form = document.getElementById("loginForm");

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const entered = document.getElementById("dashboardPassword").value;
        const error = document.getElementById("loginError");

        if (entered === DASHBOARD_PASSWORD) {
            sessionStorage.setItem(DASHBOARD_AUTH_KEY, "true");
            window.location.reload();
            return;
        }

        error.textContent = "Wrong password. Please try again.";
        document.getElementById("dashboardPassword").select();
    });
}

function checkDashboardPassword() {
    return sessionStorage.getItem(DASHBOARD_AUTH_KEY) === "true";
}

// ========================================
// SUPABASE
// ========================================

function initSupabase() {
    if (!window.supabase) {
        throw new Error(
            "Supabase library did not load. Please check your internet connection."
        );
    }

    if (!supabaseClient) {
        supabaseClient = window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY
        );
    }

    return supabaseClient;
}

// ========================================
// FORMATTING
// ========================================

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value + "T00:00:00");

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
    });
}

function formatSubmitted(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
}

// ========================================
// UI
// ========================================

function setStatus(message, isError = false) {
    const status = document.getElementById("status");

    if (!status) return;

    status.textContent = message;
    status.classList.toggle("error", isError);
}

function setLoading(loading) {
    const button = document.getElementById("refreshBtn");

    if (!button) return;

    button.disabled = loading;

    button.innerHTML = loading
        ? "<span>↻</span> Loading..."
        : "<span>↻</span> Refresh";
}

function renderResponses(rows) {
    const body = document.getElementById("responsesBody");
    const emptyState = document.getElementById("emptyState");

    if (!body || !emptyState) return;

    body.innerHTML = "";

    if (!rows || rows.length === 0) {
        emptyState.hidden = false;
        return;
    }

    emptyState.hidden = true;

    rows.forEach(function (row) {
        const tr = document.createElement("tr");

        const activity = document.createElement("td");
        activity.textContent = row.activity || "—";

        const date = document.createElement("td");
        date.textContent = formatDate(row.selected_date);

        const time = document.createElement("td");
        time.textContent = row.selected_time || "—";

        const submitted = document.createElement("td");
        submitted.textContent = formatSubmitted(row.submitted_at);

        tr.append(activity, date, time, submitted);
        body.appendChild(tr);
    });
}

function renderLatest(row, total) {
    const latestActivity = document.getElementById("latestActivity");
    const latestTime = document.getElementById("latestTime");
    const totalResponses = document.getElementById("totalResponses");
    const latestTitle = document.getElementById("latestTitle");
    const latestDetails = document.getElementById("latestDetails");

    if (!row) {
        totalResponses.textContent = String(total || 0);
        latestActivity.textContent = "—";
        latestTime.textContent = "—";
        latestTitle.textContent = "Waiting for a response...";
        latestDetails.textContent =
            "When a date is chosen, it will appear here.";
        return;
    }

    totalResponses.textContent = String(total);
    latestActivity.textContent = row.activity || "—";
    latestTime.textContent = row.selected_time || "—";

    latestTitle.textContent =
        row.activity || "A date was chosen ❤️";

    latestDetails.textContent =
        `${formatDate(row.selected_date)} • ${row.selected_time || "Time not selected"} • Submitted ${formatSubmitted(row.submitted_at)}`;
}

// ========================================
// LOAD RESPONSES
// ========================================

async function loadResponses() {
    setLoading(true);
    setStatus("Loading responses...");

    try {
        const client = initSupabase();

        const result = await client
            .from("date_responses")
            .select("id, activity, selected_date, selected_time, submitted_at")
            .order("submitted_at", { ascending: false });

        if (result.error) {
            console.error("Supabase dashboard error:", result.error);
            throw result.error;
        }

        const rows = result.data || [];

        renderResponses(rows);
        renderLatest(rows[0] || null, rows.length);

        setStatus(
            rows.length
                ? `Last updated ${formatSubmitted(new Date().toISOString())}`
                : "No responses yet."
        );

    } catch (error) {
        console.error("Dashboard error:", error);

        const body = document.getElementById("responsesBody");
        const emptyState = document.getElementById("emptyState");

        if (body) body.innerHTML = "";
        if (emptyState) emptyState.hidden = true;

        setStatus(
            `Could not load responses: ${error.message || "Unknown error"}`,
            true
        );
    } finally {
        setLoading(false);
    }
}

// IMPORTANT:
// Make the function global so the HTML Refresh button works
// on Safari/iPhone as well as desktop browsers.
window.loadResponses = loadResponses;

// ========================================
// START DASHBOARD
// ========================================

function startDashboard() {
    loadResponses();

    // Refresh every 30 seconds.
    setInterval(loadResponses, 30000);
}

if (!checkDashboardPassword()) {
    showDashboardLogin();
} else {
    window.addEventListener("DOMContentLoaded", startDashboard);
}
