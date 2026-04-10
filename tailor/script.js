/**
 * Shared Navigation & Helper functions for Tailor App
 * Updated for Multi-User & Local Timezone Fix
 */

// 1. Navigation Helper
window.go = function(page) {
    window.location.href = page;
}

// 2. Local Date Helper (Fixes the UTC/Yesterday bug)
window.getLocalDate = function(offset = 0) {
    let d = new Date();
    d.setDate(d.getDate() + offset);
    let year = d.getFullYear();
    let month = String(d.getMonth() + 1).padStart(2, '0');
    let day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 3. UI Helper for Dashboard
window.updateDashboardTotal = function(amount) {
    let el = document.getElementById("liveTotal");
    if (el) {
        el.innerText = "₹" + (amount || 0).toLocaleString('en-IN');
    }
}

console.log("Tailor Navigation Script Updated & Loaded");
