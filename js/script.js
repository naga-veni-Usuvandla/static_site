// ===========================
// DOM Ready
// ===========================
document.addEventListener("DOMContentLoaded", () => {

    // ---------------------------
    // Sidebar & Submenu
    // ---------------------------
    const menuToggle = document.querySelector('.menu-toggle');
    const sideMenu = document.querySelector('.mobile-sidebar');
    const overlay = document.querySelector('.menu-overlay');
    const closeMenuBtn = document.querySelector('.close-menu');
    const submenuToggles = document.querySelectorAll('.submenu-toggle');

    menuToggle.addEventListener('click', () => {
        sideMenu.classList.add('open');
        overlay.classList.add('active');
        menuToggle.setAttribute('aria-expanded', 'true');
    });

    const closeSidebar = () => {
        sideMenu.classList.remove('open');
        overlay.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
    };

    overlay.addEventListener('click', closeSidebar);
    closeMenuBtn.addEventListener('click', closeSidebar);

    submenuToggles.forEach(btn => {
        btn.addEventListener('click', () => {
            const parent = btn.parentElement;
            parent.classList.toggle('open');
            const expanded = btn.getAttribute('aria-expanded') === 'true';
            btn.setAttribute('aria-expanded', !expanded);
        });
    });



    // ============================
    // Banner Section - Pickup & Dropoff with Calendar
    // ============================
    // JS - Place at the end of body or inside DOMContentLoaded
    const pickupDate = document.getElementById("pickupDate");
    const dropoffDate = document.getElementById("dropoffDate");
    const pickupTimeSelect = document.getElementById("pickupTime");
    const dropoffTimeSelect = document.getElementById("dropoffTime");
    const editCancelLink = document.getElementById("editCancelLink");

    if (!pickupDate || !dropoffDate || !pickupTimeSelect || !dropoffTimeSelect) return;

    // Default today
    const today = new Date();
    const todayISO = today.toISOString().split("T")[0];
    pickupDate.value = todayISO;
    dropoffDate.value = todayISO;
    pickupDate.min = todayISO;
    dropoffDate.min = todayISO;

    // Populate time dropdown
    function populateTime(selectElement) {
        selectElement.innerHTML = "";
        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += 30) {
                const hh = String(h).padStart(2, "0");
                const mm = String(m).padStart(2, "0");
                const option = document.createElement("option");
                option.value = `${hh}:${mm}`;
                option.textContent = `${hh}:${mm}`;
                selectElement.appendChild(option);
            }
        }
    }

    populateTime(pickupTimeSelect);
    populateTime(dropoffTimeSelect);

    const roundedMinutes = today.getMinutes() < 30 ? "00" : "30";
    const roundedHour = String(today.getHours()).padStart(2, "0");
    pickupTimeSelect.value = `${roundedHour}:${roundedMinutes}`;
    dropoffTimeSelect.value = `${roundedHour}:${roundedMinutes}`;

    // Ensure drop-off >= pickup
    pickupDate.addEventListener("change", () => {
        if (dropoffDate.value < pickupDate.value) dropoffDate.value = pickupDate.value;
        dropoffDate.min = pickupDate.value;
    });

    // Edit / Cancel toggle
    if (editCancelLink) {
        editCancelLink.addEventListener("click", (e) => {
            e.preventDefault();
            const formSummary = document.getElementById("formSummary");
            if (formSummary) {
                formSummary.style.display =
                    formSummary.style.display === "none" ? "block" : "none";
            }
            alert("View / Edit / Cancel clicked!");
        });
    }





    document.getElementById("bookingForm").addEventListener("submit", function (e) {
        e.preventDefault(); // prevent real submit

        // 👉 redirect user to vehicles cards page
        window.location.href = "vehicle.html";
    });

    //date and time in the banner form 





























    // ---------------------------
    // Booking Form + Vehicles + Price
    // ---------------------------
    // ============================
    // Vehicle Booking & Price Calculation
    // ============================

    // Grab elements safely
    const vehiclesSection = document.querySelector(".vehicles-section");
    const vehicleForm = document.getElementById("vehicleForm");
    const bookingForm = document.getElementById("bookingForm");

    // Create price display element
    const priceDisplay = document.createElement("p");
    if (vehicleForm) vehicleForm.appendChild(priceDisplay);

    // Object to store booking info
    let bookingData = {};

    // ---------------------------
    // Step 1: Booking Form Submission (Pickup/Drop-off Info)
    if (bookingForm) {
        bookingForm.addEventListener("submit", (e) => {
            e.preventDefault();

            // Collect pickup/drop-off info safely
            bookingData = {
                pickupLocation: document.getElementById("pickupLocation")?.value || "",
                dropoffLocation: document.getElementById("dropoffLocation")?.value || "",
                pickupDate: document.getElementById("pickupDate")?.value || "",
                pickupTime: document.getElementById("pickupTime")?.value || "",
                dropoffDate: document.getElementById("dropoffDate")?.value || "",
                dropoffTime: document.getElementById("dropoffTime")?.value || ""
            };

            // Show vehicle selection section if available
            if (vehiclesSection) vehiclesSection.classList.add("active");
        });
    }

    // ---------------------------
    // Step 2: Vehicle Selection & Price Calculation
    if (vehicleForm) {
        vehicleForm.addEventListener("change", (e) => {
            if (e.target.name === "vehicle") {

                // Ensure booking info exists
                if (!bookingData.pickupDate || !bookingData.dropoffDate) {
                    console.warn("Pickup/Dropoff info missing.");
                    return;
                }

                const rate = parseInt(e.target.dataset.rate, 10) || 0;
                const start = new Date(`${bookingData.pickupDate} ${bookingData.pickupTime}`);
                const end = new Date(`${bookingData.dropoffDate} ${bookingData.dropoffTime}`);
                const hours = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60)));
                const totalPrice = rate * hours;

                // Save selected vehicle & price info
                bookingData.vehicle = e.target.value;
                bookingData.price = totalPrice;
                bookingData.duration = hours;

                // Update UI
                priceDisplay.textContent = `✅ Total Price: Rs ${totalPrice} (${hours} hours)`;

                // Store in sessionStorage for details page
                sessionStorage.setItem("finalBooking", JSON.stringify(bookingData));
            }
        });

        // ---------------------------
        // Step 3: Vehicle Form Submission (Go to Booking Details)
        vehicleForm.addEventListener("submit", (e) => {
            e.preventDefault();
            sessionStorage.setItem("bookingData", JSON.stringify(bookingData));
            window.location.href = "booking-details.html";
        });
    }

    // ---------------------------
    // Step 4: Booking Details Page Display
    const finalBooking = JSON.parse(sessionStorage.getItem("finalBooking"));
    const summaryEl = document.getElementById("summary");
    if (finalBooking && summaryEl) {
        summaryEl.innerHTML = `
        <p><b>Pickup:</b> ${finalBooking.pickupDate} ${finalBooking.pickupTime} at ${finalBooking.pickupLocation}</p>
        <p><b>Drop-off:</b> ${finalBooking.dropoffDate} ${finalBooking.dropoffTime} at ${finalBooking.dropoffLocation}</p>
        <p><b>Vehicle:</b> ${finalBooking.vehicle}</p>
        <p><b>Total Price:</b> Rs ${finalBooking.price}</p>
    `;
    }



    // ---------------------------
    // Pay Now Error Message
    // ---------------------------
    const payNowBtn = document.getElementById("payNowBtn");
    const errorAlert = document.getElementById("errorAlert");
    if (payNowBtn && errorAlert) {
        payNowBtn.addEventListener("click", (e) => {
            e.preventDefault();
            errorAlert.style.display = "block";
            setTimeout(() => errorAlert.style.display = "none", 3000);
        });
    }

});
