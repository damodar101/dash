// ========================================
// SIMPLE DASHBOARD PASSWORD
// ========================================

const DASHBOARD_PASSWORD = "Forever2026";
const DASHBOARD_AUTH_KEY = "dateDashboardUnlocked";

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

    document.getElementById("loginForm").addEventListener("submit", function(event) {
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
    if (sessionStorage.getItem(DASHBOARD_AUTH_KEY) === "true") {
        return true;
    }

    showDashboardLogin();
    return false;
}

if (!checkDashboardPassword()) {
    // The login screen is already displayed.
} else {
// ========================================
// OUR DATE DASHBOARD
// ========================================

const SUPABASE_URL = "https://gysuspjdcogxedetcjnl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_p9a_Z3oe4clvu2O-LZjmBA_IeHi7BfQ";

let supabaseClient = null;

function initSupabase() {
    if (!window.supabase) {
        throw new Error("Supabase library did not load.");
    }

    supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );
}

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

function setStatus(message, isError = false) {
    const status = document.getElementById("status");
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

    body.innerHTML = "";

    if (!rows || rows.length === 0) {
        emptyState.hidden = false;
        return;
    }

    emptyState.hidden = true;

    rows.forEach(row => {
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

function renderLatest(row) {
    const latestActivity = document.getElementById("latestActivity");
    const latestTime = document.getElementById("latestTime");
    const totalResponses = document.getElementById("totalResponses");
    const latestTitle = document.getElementById("latestTitle");
    const latestDetails = document.getElementById("latestDetails");

    if (!row) {
        totalResponses.textContent = "0";
        latestActivity.textContent = "—";
        latestTime.textContent = "—";
        latestTitle.textContent = "Waiting for a response...";
        latestDetails.textContent =
            "When a date is chosen, it will appear here.";
        return;
    }

    latestActivity.textContent = row.activity || "—";
    latestTime.textContent = row.selected_time || "—";
    latestTitle.textContent = row.activity || "A date was chosen ❤️";

    latestDetails.textContent =
        `${formatDate(row.selected_date)} • ${row.selected_time || "Time not selected"} • Submitted ${formatSubmitted(row.submitted_at)}`;
}

async function loadResponses() {
    setLoading(true);
    setStatus("Loading responses...");

    try {
        if (!supabaseClient) {
            initSupabase();
        }

        const { data, error } = await supabaseClient
            .from("date_responses")
            .select("id, activity, selected_date, selected_time, submitted_at")
            .order("submitted_at", { ascending: false });

        if (error) {
            console.error("Supabase dashboard error:", error);
            throw error;
        }

        const rows = data || [];

        document.getElementById("totalResponses").textContent = rows.length;
        renderResponses(rows);
        renderLatest(rows[0] || null);

        setStatus(
            rows.length
                ? `Last updated ${formatSubmitted(new Date().toISOString())}`
                : "No responses yet."
        );
    } catch (error) {
        console.error(error);

        document.getElementById("responsesBody").innerHTML = "";
        document.getElementById("emptyState").hidden = true;

        setStatus(
            `Could not load responses: ${error.message || "Unknown error"}`,
            true
        );
    } finally {
        setLoading(false);
    }
}

window.addEventListener("DOMContentLoaded", () => {
    loadResponses();

    // Check for a new response every 30 seconds.
    setInterval(loadResponses, 30000);
});

}
