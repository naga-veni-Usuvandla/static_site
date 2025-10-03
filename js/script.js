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
    // Banner Section - Pickup & Dropoff with Calendar and time
    // ============================


    const pickupDate = document.getElementById("pickupDateDisplay");
    const pickupTime = document.getElementById("pickupTime");
    const dropoffDate = document.getElementById("dropoffDateDisplay");
    const dropoffTime = document.getElementById("dropoffTime");

    // ---------------------------
    // Default today (only if date inputs exist)
    // ---------------------------
    if (pickupDate && pickupTime && dropoffDate && dropoffTime) {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        const hh = String(now.getHours()).padStart(2, "0");
        const min = String(now.getMinutes()).padStart(2, "0");

        // set default date
        const today = `${yyyy}-${mm}-${dd}`;
        pickupDate.value = today;
        dropoffDate.value = today;

        // populate time dropdowns in 30-min intervals
        function fillTimes(select) {
            select.innerHTML = "";
            for (let h = 0; h < 24; h++) {
                for (let m = 0; m < 60; m += 30) {
                    const hour = String(h).padStart(2, "0");
                    const minute = String(m).padStart(2, "0");
                    const value = `${hour}:${minute}`;
                    const option = new Option(value, value);
                    select.add(option);
                }
            }
        }

        fillTimes(pickupTime);
        fillTimes(dropoffTime);

        // set default time to now
        pickupTime.value = `${hh}:${min}`;
        dropoffTime.value = `${hh}:${min}`;
    }


    //after clicking the viewvehicles button redirect to cards vehicles page
    document.getElementById("bookingForm")?.addEventListener("submit", function (e) {
        e.preventDefault(); // prevent actual form submission

        // Get all user input values
        const bookingData = {
            pickupLocation: document.getElementById("pickupLocation").value,
            dropoffOption: document.getElementById("dropoffSelect").value,
            pickupDate: document.getElementById("pickupDateDisplay").value,
            pickupTime: document.getElementById("pickupTime").value,
            dropoffDate: document.getElementById("dropoffDateDisplay").value,
            dropoffTime: document.getElementById("dropoffTime").value
        };

        // Save to sessionStorage
        sessionStorage.setItem("bannerBookingData", JSON.stringify(bookingData));

        // Redirect to vehicle cards page
        window.location.href = "vehicle.html";
        console.log("Booking Data:", bookingData);
    });

    // ---------------------------
    // Booking Form + Vehicles + Price
    // ---------------------------
    // ============================
    // Vehicle Booking & Price Calculation
    // ============================

    // Grab inputs and elements
    const form = document.getElementById("vehicleForm");
    const pickupInput = document.getElementById("pickupDate");
    const dropoffInput = document.getElementById("dropoffDate");
    const customerNameInput = document.getElementById("customerName");
    const phoneInput = document.getElementById("phone");
    const vehicleOptions = document.querySelectorAll(".vehicle-option input[type='radio']");
    const priceOutput = document.getElementById("priceOutput");

    // -----------------------------
    // Set default datetime-local value
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");


    const defaultDateTime = `${yyyy}-${mm}-${dd}T${hh}:${min}`; // correct format
    pickupInput.value = defaultDateTime;
    dropoffInput.value = defaultDateTime;
    pickupInput.min = defaultDateTime;
    dropoffInput.min = defaultDateTime;

    // -----------------------------
    // Calculate duration-based price
    function calculatePrice(ratePerHour) {
        const pickup = new Date(pickupInput.value);
        const dropoff = new Date(dropoffInput.value);
        if (!pickupInput.value || !dropoffInput.value || dropoff <= pickup) return null;

        const diffMs = dropoff - pickup;
        const hours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60))); // duration in hours
        const totalPrice = hours * ratePerHour;
        return { hours, totalPrice };
    }

    // Update all cards and final price
    function updatePrices() {
        vehicleOptions.forEach(option => {
            const rate = parseInt(option.dataset.rate, 10);
            const parentCard = option.closest(".vehicle-option");
            const priceDisplay = parentCard.querySelector(".card-est-price");

            const result = calculatePrice(rate);
            if (result) priceDisplay.textContent = `Est. ₹${result.totalPrice} (${result.hours} hrs)`;
            else priceDisplay.textContent = "—";
        });

        const selected = document.querySelector(".vehicle-option input[type='radio']:checked");
        if (selected) {
            const rate = parseInt(selected.dataset.rate, 10);
            const result = calculatePrice(rate);
            if (result) priceOutput.textContent = `Final Price: ₹${result.totalPrice} for ${selected.value}`;
            else priceOutput.textContent = "";
        } else priceOutput.textContent = "";
    }

    // -----------------------------
    // Event listeners
    [pickupInput, dropoffInput].forEach(input => input.addEventListener("change", updatePrices));
    vehicleOptions.forEach(option => option.addEventListener("change", updatePrices));

    updatePrices(); // initial calculation on load

    // -----------------------------
    // Form submission
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        if (!customerNameInput.value) { alert("Enter name"); return; }
        if (!/^\d{10}$/.test(phoneInput.value)) { alert("Phone must be 10 digits"); return; }

        const selected = document.querySelector("input[name='vehicle']:checked");
        if (!selected) { alert("Select a vehicle"); return; }

        const result = calculatePrice(parseInt(selected.dataset.rate, 10));
        if (!result) { alert("Invalid pickup/drop-off date or time"); return; }

        // Build booking object
        const bookingData = {
            customerName: customerNameInput.value,
            phone: phoneInput.value,
            pickupDate: pickupInput.value.split("T")[0],  // yyyy-mm-dd
            pickupTime: pickupInput.value.split("T")[1],  // hh:mm
            dropoffDate: dropoffInput.value.split("T")[0],
            dropoffTime: dropoffInput.value.split("T")[1],
            vehicle: selected.value,
            rate: parseInt(selected.dataset.rate, 10),
            hours: result.hours,
            totalPrice: result.totalPrice
        };

        // Store all booking info in sessionStorage
        sessionStorage.setItem("finalBooking", JSON.stringify(bookingData));
        sessionStorage.setItem("pickupDate", bookingData.pickupDate);
        sessionStorage.setItem("pickupTime", bookingData.pickupTime);
        sessionStorage.setItem("selectedCar", `${bookingData.vehicle} (₹${bookingData.rate}/hr)`);
        sessionStorage.setItem("duration", bookingData.hours);
        sessionStorage.setItem("totalPrice", bookingData.totalPrice);

        window.location.href = "booking-details.html";
    });




    // ---------------------------
    // Pay Now Error Message
    // ---------------------------
    const payNowBtn = document.getElementById("payNowBtn");
    const errorAlert = document.getElementById("errorAlert");

    if (payNowBtn && errorAlert) {
        payNowBtn.addEventListener("click", (e) => {
            e.preventDefault();
            errorAlert.style.display = "block";
            setTimeout(() => {
                errorAlert.style.display = "none";
            }, 3000);
        });
    }



});





