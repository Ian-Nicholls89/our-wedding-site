// ============================================
// WEDDING CONFIGURATION - Single source of truth
// ============================================
const WEDDING_CONFIG = {
    date: new Date('2027-06-19'),
    rsvpOpen: true,
    rsvpCloseDaysBeforeWedding: 42  // 6 weeks
};

// ============================================
// STATE HELPERS - Determine what to show/hide
// ============================================

// Returns current state: 'AFTER_WEDDING', 'RSVP_CLOSED', 'RSVP_OPEN', or 'RSVP_NOT_YET_OPEN'
function getWeddingState() {
    const now = new Date();
    const rsvpCloseDate = new Date(WEDDING_CONFIG.date);
    rsvpCloseDate.setDate(rsvpCloseDate.getDate() - WEDDING_CONFIG.rsvpCloseDaysBeforeWedding);

    if (now >= WEDDING_CONFIG.date) return 'AFTER_WEDDING';
    if (now >= rsvpCloseDate) return 'RSVP_CLOSED';
    if (WEDDING_CONFIG.rsvpOpen) return 'RSVP_OPEN';
    return 'RSVP_NOT_YET_OPEN';
}

// Returns visibility flags for all sections
function getVisibility() {
    const state = getWeddingState();
    return {
        state: state,
        showRsvpNav: state === 'RSVP_OPEN',
        showRsvpForm: state === 'RSVP_OPEN',
        showPhotosNav: state === 'AFTER_WEDDING',
        showPhotosSection: state === 'AFTER_WEDDING'
    };
}

// ============================================
// PAGE FUNCTIONS
// ============================================

// Open location in native maps app
function openInMaps() {
    const address = "Larmer Tree Gardens, Tollard Royal, Salisbury SP5 5PY, UK";
    const encodedAddress = encodeURIComponent(address);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    if (isIOS) {
        // Apple Maps
        window.location.href = `maps://maps.apple.com/?daddr=${encodedAddress}`;
    } else if (isAndroid) {
        // Google Maps app or fallback to browser
        window.location.href = `geo:0,0?q=${encodedAddress}`;
    } else {
        // Desktop or other - open Google Maps in new tab
        window.open(`https://maps.app.goo.gl/KDg1wauDmnFXBdUB7`, '_blank');
    }
}

// Save the date - generates and downloads ICS file
function generateWeddingICS() {
    const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Marilyn and Ian Wedding//EN",
        "BEGIN:VEVENT",
        "UID:wedding-2027-marilyn-ian@aramnicholls.wedding",
        "DTSTAMP:20260202T120000Z",
        "DTSTART;VALUE=DATE:20270619",
        "DTEND;VALUE=DATE:20270620",
        "SUMMARY:Wedding of Marilyn and Ian",
        "DESCRIPTION:Join us to celebrate at Larmer Tree Gardens!",
        "LOCATION:Larmer Tree Gardens, Tollard Royal, Salisbury SP5 5PY, UK",
        "BEGIN:VALARM",
        "TRIGGER:-P7D",
        "ACTION:DISPLAY",
        "DESCRIPTION:Reminder: Marilyn and Ian's wedding is in one week!",
        "END:VALARM",
        "END:VEVENT",
        "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const tempLink = document.createElement('a');
    tempLink.href = url;
    tempLink.download = "Marilyn-and-Ian-Wedding.ics";
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
    URL.revokeObjectURL(url);
}

window.onload = function() {
    updatePageVisibility();
};

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Show/hide guests field based on attendance
function toggleGuestsField() {
    const attendanceSelect = document.getElementById('attendance');
    const guestsGroup = document.getElementById('guestsGroup');
    const guestsSelect = document.getElementById('guests');
    const stayingOvernightGroup = document.getElementById('stayingOvernightGroup');
    const stayingOvernightSelect = document.getElementById('stayingOvernight');
    const accommodationGroup = document.getElementById('accommodationGroup');
    const accommodationSelect = document.getElementById('accommodation');
    const songRequestGroup = document.getElementById('songRequestGroup');
    const songRequestInput = document.getElementById('songRequest');

    if (attendanceSelect.value === 'yes') {
        guestsGroup.style.display = 'block';
        guestsSelect.required = true;
        stayingOvernightGroup.style.display = 'block';
        stayingOvernightSelect.required = true;
        songRequestGroup.style.display = 'block';
    } else {
        guestsGroup.style.display = 'none';
        guestsSelect.value = ''; // Reset guests selection
        guestsSelect.required = false;
        generateGuestNameFields(); // Update guest name fields
        generateMealSelectionGrid(); // Update meal grid

        // Hide and reset staying overnight and accommodation
        stayingOvernightGroup.style.display = 'none';
        stayingOvernightSelect.value = '';
        stayingOvernightSelect.required = false;
        accommodationGroup.style.display = 'none';
        accommodationSelect.value = '';
        accommodationSelect.required = false;

        // Hide and reset song request
        songRequestGroup.style.display = 'none';
        songRequestInput.value = '';
        songRequestInput.required = false;
    }
}

// Generate guest name text boxes
function generateGuestNameFields() {
    const guestsSelect = document.getElementById('guests');
    const guestNamesGroup = document.getElementById('guestNamesGroup');
    const guestNamesContainer = document.getElementById('guestNamesContainer');
    const numGuests = parseInt(guestsSelect.value);

    // Show guest name fields only if more than 1 attendee
    if (numGuests > 1) {
        guestNamesGroup.style.display = 'block';

        let fieldsHTML = '';
        // Generate text boxes for additional guests (excluding the main person)
        for (let i = 1; i < numGuests; i++) {
            fieldsHTML += `
                <div style="margin-bottom: 0.8rem;">
                    <input type="text"
                           id="guestName_${i}"
                           name="guestName_${i}"
                           placeholder="Guest ${i} full name"
                           style="width: 100%; padding: 0.8rem; border: 1px solid #ddd; border-radius: 5px; font-size: 1rem;"
                           required>
                </div>
            `;
        }
        guestNamesContainer.innerHTML = fieldsHTML;
    } else {
        guestNamesGroup.style.display = 'none';
        guestNamesContainer.innerHTML = '';
    }
}

// Dynamic Meal Selection Grid
function generateMealSelectionGrid() {
    const nameInput = document.getElementById('name');
    const guestsSelect = document.getElementById('guests');
    const attendanceSelect = document.getElementById('attendance');
    const mealSelectionGroup = document.getElementById('mealSelectionGroup');
    const mealSelectionTable = document.getElementById('mealSelectionTable');

    const name = nameInput.value.trim();
    const numGuests = parseInt(guestsSelect.value);
    const attendance = attendanceSelect.value;

    // Only show meal selection if attending and guests selected
    if (attendance === 'yes' && numGuests > 0 && name) {
        mealSelectionGroup.style.display = 'block';

        // Generate table
        let tableHTML = `
            <thead>
                <tr>
                    <th></th>
                    <th>Chicken (Poultry)</th>
                    <th>Beef (Red Meat)</th>
                    <th>Fish (Seafood)</th>
                    <th>Vegetarian</th>
                    <th>Vegan</th>
                </tr>
            </thead>
            <tbody>
        `;

        // First row - use the name from the name field
        tableHTML += `
            <tr>
                <td class="guest-name-cell">${name}</td>
                <td><input type="radio" name="meal_0" value="chicken" required></td>
                <td><input type="radio" name="meal_0" value="beef" required></td>
                <td><input type="radio" name="meal_0" value="fish" required></td>
                <td><input type="radio" name="meal_0" value="vegetarian" required></td>
                <td><input type="radio" name="meal_0" value="vegan" required></td>
            </tr>
        `;

        // Additional rows for guests - use names from guest name inputs
        for (let i = 1; i < numGuests; i++) {
            const guestNameInput = document.getElementById(`guestName_${i}`);
            const guestName = guestNameInput ? guestNameInput.value.trim() : '';
            const displayName = guestName || `Guest ${i}`;

            tableHTML += `
                <tr>
                    <td class="guest-name-cell">${displayName}</td>
                    <td><input type="radio" name="meal_${i}" value="chicken" required></td>
                    <td><input type="radio" name="meal_${i}" value="beef" required></td>
                    <td><input type="radio" name="meal_${i}" value="fish" required></td>
                    <td><input type="radio" name="meal_${i}" value="vegetarian" required></td>
                    <td><input type="radio" name="meal_${i}" value="vegan" required></td>
                </tr>
            `;
        }

        tableHTML += `
            </tbody>
        `;

        mealSelectionTable.innerHTML = tableHTML;
    } else {
        mealSelectionGroup.style.display = 'none';
    }
}

// Dynamic Dietary Restrictions Grid
function generateDietaryRestrictionsGrid() {
    const nameInput = document.getElementById('name');
    const guestsSelect = document.getElementById('guests');
    const attendanceSelect = document.getElementById('attendance');
    const dietaryRestrictionsGroup = document.getElementById('dietaryRestrictionsGroup');
    const dietaryRestrictionsTable = document.getElementById('dietaryRestrictionsTable');

    const name = nameInput.value.trim();
    const numGuests = parseInt(guestsSelect.value);
    const attendance = attendanceSelect.value;

    // Only show dietary restrictions if attending and guests selected
    if (attendance === 'yes' && numGuests > 0 && name) {
        dietaryRestrictionsGroup.style.display = 'block';

        // Generate table
        let tableHTML = `
            <thead>
                <tr>
                    <th></th>
                    <th>None</th>
                    <th>Gluten-Free</th>
                    <th>Dairy-Free</th>
                    <th>Nut Allergy</th>
                    <th>Shellfish Allergy</th>
                    <th>Vegan</th>
                    <th>Vegetarian</th>
                    <th>Other</th>
                </tr>
            </thead>
            <tbody>
        `;

        // First row - use the name from the name field
        tableHTML += `
            <tr>
                <td class="guest-name-cell">${name}</td>
                <td><input type="checkbox" name="dietary_0_none" value="none"></td>
                <td><input type="checkbox" name="dietary_0_gluten" value="gluten-free"></td>
                <td><input type="checkbox" name="dietary_0_dairy" value="dairy-free"></td>
                <td><input type="checkbox" name="dietary_0_nut" value="nut-allergy"></td>
                <td><input type="checkbox" name="dietary_0_shellfish" value="shellfish-allergy"></td>
                <td><input type="checkbox" name="dietary_0_vegan" value="vegan"></td>
                <td><input type="checkbox" name="dietary_0_vegetarian" value="vegetarian"></td>
                <td><input type="checkbox" name="dietary_0_other" value="other"></td>
            </tr>
        `;

        // Additional rows for guests
        for (let i = 1; i < numGuests; i++) {
            const guestNameInput = document.getElementById(`guestName_${i}`);
            const guestName = guestNameInput ? guestNameInput.value.trim() : '';
            const displayName = guestName || `Guest ${i}`;

            tableHTML += `
                <tr>
                    <td class="guest-name-cell">${displayName}</td>
                    <td><input type="checkbox" name="dietary_${i}_none" value="none"></td>
                    <td><input type="checkbox" name="dietary_${i}_gluten" value="gluten-free"></td>
                    <td><input type="checkbox" name="dietary_${i}_dairy" value="dairy-free"></td>
                    <td><input type="checkbox" name="dietary_${i}_nut" value="nut-allergy"></td>
                    <td><input type="checkbox" name="dietary_${i}_shellfish" value="shellfish-allergy"></td>
                    <td><input type="checkbox" name="dietary_${i}_vegan" value="vegan"></td>
                    <td><input type="checkbox" name="dietary_${i}_vegetarian" value="vegetarian"></td>
                    <td><input type="checkbox" name="dietary_${i}_other" value="other"></td>
                </tr>
            `;
        }

        tableHTML += `
            </tbody>
        `;

        dietaryRestrictionsTable.innerHTML = tableHTML;
    } else {
        dietaryRestrictionsGroup.style.display = 'none';
    }
}

// Listen for changes to trigger meal selection grid generation
document.addEventListener('DOMContentLoaded', function() {
    const nameField = document.getElementById('name');
    const guestsField = document.getElementById('guests');
    const attendanceField = document.getElementById('attendance');
    const guestNamesContainer = document.getElementById('guestNamesContainer');
    const dietaryRestrictionsTable = document.getElementById('dietaryRestrictionsTable');
    const stayingOvernightField = document.getElementById('stayingOvernight');

    if (nameField) {
        nameField.addEventListener('input', function() {
            generateMealSelectionGrid();
            generateDietaryRestrictionsGrid();
        });
    }

    if (guestsField) {
        guestsField.addEventListener('change', function() {
            generateGuestNameFields();
            generateMealSelectionGrid();
            generateDietaryRestrictionsGrid();
        });
    }

    if (attendanceField) {
        attendanceField.addEventListener('change', function() {
            toggleGuestsField();
            generateMealSelectionGrid();
            generateDietaryRestrictionsGrid();
        });
    }

    // Listen for guest name changes to update both meal selection and dietary restrictions grids
    if (guestNamesContainer) {
        guestNamesContainer.addEventListener('input', function(e) {
            if (e.target.id && e.target.id.startsWith('guestName_')) {
                generateMealSelectionGrid();
                generateDietaryRestrictionsGrid();
            }
        });
    }

    // Listen for changes to dietary restriction checkboxes
    if (dietaryRestrictionsTable) {
        dietaryRestrictionsTable.addEventListener('change', function(e) {
            if (e.target.type === 'checkbox') {
                toggleDietaryDetails();
            }
        });
    }

    // Listen for changes to staying overnight selection
    if (stayingOvernightField) {
        stayingOvernightField.addEventListener('change', toggleAccommodationQuestion);
    }

    // RSVP Form submission
    submitForm();
});

// Show/hide dietary details textarea based on "Other" checkbox selection
function toggleDietaryDetails() {
    const dietaryDetailsGroup = document.getElementById('dietaryDetailsGroup');
    const dietaryDetailsTextarea = document.getElementById('dietaryDetails');
    const dietaryTable = document.getElementById('dietaryRestrictionsTable');

    // Check if any "Other" checkbox is checked
    const otherCheckboxes = dietaryTable.querySelectorAll('input[name*="_other"]');
    const anyOtherChecked = Array.from(otherCheckboxes).some(checkbox => checkbox.checked);

    if (anyOtherChecked) {
        dietaryDetailsGroup.style.display = 'block';
        dietaryDetailsTextarea.required = true;
    } else {
        dietaryDetailsGroup.style.display = 'none';
        dietaryDetailsTextarea.required = false;
    }
}

// Show/hide accommodation question based on staying overnight selection
function toggleAccommodationQuestion() {
    const stayingOvernightSelect = document.getElementById('stayingOvernight');
    const accommodationGroup = document.getElementById('accommodationGroup');
    const accommodationSelect = document.getElementById('accommodation');

    if (stayingOvernightSelect.value === 'yes') {
        accommodationGroup.style.display = 'block';
        accommodationSelect.required = true;
    } else {
        accommodationGroup.style.display = 'none';
        accommodationSelect.value = ''; // Reset accommodation selection
        accommodationSelect.required = false;
    }
}

// ============================================
// RSVP SUBMISSION
// ============================================

function submitForm() {
    const rsvpForm = document.getElementById('rsvpForm');
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleRsvp();
        });
    }
}

async function handleRsvp() {
    const name       = document.getElementById('name').value;
    const attendance = document.getElementById('attendance').value;
    let numGuests, guestNames, dietaryRestrictions, mealSelections, dietaryDetails, stayingOvernight, accommodation, songRequest;

    if (attendance === "yes") {
        numGuests        = Number(document.getElementById('guests').value);
        guestNames       = Array.from(document.querySelectorAll('#guestNamesContainer input')).map(input => input.value);
        dietaryDetails   = document.getElementById('dietaryDetails').value;
        stayingOvernight = document.getElementById('stayingOvernight').value;
        accommodation    = document.getElementById('accommodation').value;
        songRequest      = document.getElementById('songRequest').value;

        const dietaryRestrictionsTable = document.getElementById('dietaryRestrictionsTable');
        const mealSelectionsTable      = document.getElementById('mealSelectionTable');
        dietaryRestrictions = [];
        mealSelections      = [];

        for (let i = 0; i < numGuests; i++) {
            let resRow  = dietaryRestrictionsTable.rows[i + 1];
            let mealRow = mealSelectionsTable.rows[i + 1];
            let restrictions = [];

            for (let r of resRow.querySelectorAll('[name*="dietary_"]')) {
                if (r.checked) {
                    restrictions.push(r.value);
                }
            }

            let res  = {};
            let meal = {};
            let choice = mealRow.querySelector('input[type="radio"]:checked');

            res[resRow.getElementsByClassName('guest-name-cell')[0].innerText]   = restrictions;
            meal[mealRow.getElementsByClassName('guest-name-cell')[0].innerText] = choice ? choice.value : '';

            dietaryRestrictions.push(res);
            mealSelections.push(meal);
        }
    }

    const send = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, attendance, numGuests, guestNames, dietaryRestrictions, dietaryDetails, mealSelections, stayingOvernight, accommodation, songRequest })
    };

    const response = await fetch("http://localhost:5000/rsvp/submit", send);
    const data = await response.json();

    if (response.status === 200) {
        document.getElementById("rsvpForm").reset();
    }

    alert(data.message);
}

// ============================================
// PAGE VISIBILITY
// ============================================

// Update page visibility based on wedding state
function updatePageVisibility() {
    const visibility = getVisibility();
    const navList = document.getElementById('navList');

    const photosSection = document.getElementById('photos');
    const rsvpSection = document.getElementById('rsvp');

    // Check if we're on the dedicated RSVP page
    const isRSVPPage = window.location.pathname.includes('/rsvp');

    // Dynamically add/remove RSVP nav link
    if (navList) {
        let navRSVP = document.getElementById('navRSVP');
        if (visibility.showRsvpNav) {
            if (!navRSVP) {
                navRSVP = document.createElement('li');
                navRSVP.id = 'navRSVP';
                navRSVP.innerHTML = '<a href="/rsvp">RSVP</a>';
                navList.appendChild(navRSVP);
            }
        } else {
            if (navRSVP) navRSVP.remove();
        }

        // Dynamically add/remove Photos nav link
        let navPhotos = document.getElementById('navPhotos');
        if (visibility.showPhotosNav) {
            if (!navPhotos) {
                navPhotos = document.createElement('li');
                navPhotos.id = 'navPhotos';
                navPhotos.innerHTML = '<a href="/photos">Photos</a>';
                navList.appendChild(navPhotos);
            }
        } else {
            if (navPhotos) navPhotos.remove();
        }
    }

    // Section visibility
    if (photosSection) {
        photosSection.classList.toggle('hidden', !visibility.showPhotosSection);
    }
    if (rsvpSection && !isRSVPPage) {
        rsvpSection.classList.toggle('hidden', !visibility.showRsvpForm);
    }
}

// ============================================
// PHOTO UPLOAD
// ============================================

function uploadPhotos() {
    const fileInput = document.getElementById('fileInput');
    const files = fileInput.files;

    if (files.length === 0) {
        alert('Please select photos to upload.');
        return;
    }

    alert(`Ready to upload ${files.length} photo(s).

In production, you would integrate this with:
- Google Photos API
- Cloudinary
- AWS S3
- Or your preferred cloud storage solution`);

    fileInput.value = '';
}

// Drag and drop functionality
document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.querySelector('.upload-area');

    if (uploadArea) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.style.background = '#dff2f1';
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.style.background = '#f7fcfc';
            }, false);
        });

        uploadArea.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            document.getElementById('fileInput').files = files;
        }, false);
    }
});

// Optional: Check every hour if someone leaves the page open
setInterval(updatePageVisibility, 3600000);