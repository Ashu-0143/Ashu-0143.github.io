/**
 * Shared Navigation & Helper functions for Tailor App
 */

// 1. Navigation Helper
// Used by index.html buttons (e.g., onclick="go('daily.html')")
function go(page) {
    window.location.href = page;
}

// 2. Date Helper
// Returns YYYY-MM-DD (Handy if you want to use it for any UI labels)
function getDate(offset = 0) {
    let d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().split("T")[0];
}

// 3. Optional: Auto-Refresh Today's Total on Dashboard
// If you want to show a quick total on the main tailor/index.html
function updateDashboardTotal(amount) {
    let el = document.getElementById("todayTotal");
    if (el) el.innerText = "Today: ₹" + amount;
}

console.log("Tailor Navigation Script Loaded");
