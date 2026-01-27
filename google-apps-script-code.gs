/**
 * WEDDING RSVP - GOOGLE APPS SCRIPT
 *
 * This script receives RSVP form submissions from your website
 * and writes them to a Google Sheet.
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Sheet for your RSVP responses
 * 2. Open Tools > Script editor
 * 3. Delete any existing code and paste this entire file
 * 4. Update the CONFIG section below
 * 5. Save the script (File > Save)
 * 6. Deploy as web app (Deploy > New deployment)
 * 7. Copy the web app URL and update script.js
 */

// ============================================================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================================================

const CONFIG = {
  // Your email address for RSVP notifications (optional)
  notificationEmail: 'your-email@example.com', // Change this to your email

  // Enable/disable email notifications
  sendEmailNotifications: true, // Set to false to disable emails

  // Sheet name where responses will be saved
  sheetName: 'RSVP Responses',

  // Timezone for timestamps (find yours at: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
  timezone: 'Europe/London'
};

// ============================================================================
// MAIN FUNCTION - Handles form submissions
// ============================================================================

function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);

    // Get the active spreadsheet
    const sheet = getOrCreateSheet();

    // Process and save the RSVP data
    const rowData = processRSVPData(data);

    // Append to sheet
    sheet.appendRow(rowData);

    // Send email notification if enabled
    if (CONFIG.sendEmailNotifications) {
      sendNotificationEmail(data);
    }

    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: 'RSVP received successfully!'
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Log the error
    Logger.log('Error: ' + error.toString());

    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Failed to save RSVP. Please try again or contact us directly.'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================================
// GET OR CREATE SHEET
// ============================================================================

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.sheetName);

  // Create sheet if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.sheetName);

    // Add headers
    const headers = [
      'Timestamp',
      'Name',
      'Attendance',
      'Number of Guests',
      'Guest Names',
      'Dietary Restrictions',
      'Dietary Details (Other)',
      'Meal Selections',
      'Staying Overnight',
      'Accommodation Type',
      'Song Request'
    ];

    sheet.appendRow(headers);

    // Format header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#40b5ad');
    headerRange.setFontColor('#ffffff');

    // Freeze header row
    sheet.setFrozenRows(1);

    // Auto-resize columns
    for (let i = 1; i <= headers.length; i++) {
      sheet.autoResizeColumn(i);
    }
  }

  return sheet;
}

// ============================================================================
// PROCESS RSVP DATA
// ============================================================================

function processRSVPData(data) {
  // Current timestamp
  const timestamp = Utilities.formatDate(
    new Date(),
    CONFIG.timezone,
    'yyyy-MM-dd HH:mm:ss'
  );

  // Extract basic information
  const name = data.name || '';
  const attendance = data.attendance || '';
  const numGuests = data.numGuests || '';

  // Process guest names
  const guestNames = processGuestNames(data.guestNames || []);

  // Process dietary restrictions
  const dietaryInfo = processDietaryRestrictions(data.dietary || {});
  const dietaryDetails = data.dietaryDetails || '';

  // Process meal selections
  const mealSelections = processMealSelections(data.meals || {});

  // Other fields
  const stayingOvernight = data.stayingOvernight || '';
  const accommodation = data.accommodation || '';
  const songRequest = data.songRequest || '';

  // Return row data
  return [
    timestamp,
    name,
    attendance,
    numGuests,
    guestNames,
    dietaryInfo,
    dietaryDetails,
    mealSelections,
    stayingOvernight,
    accommodation,
    songRequest
  ];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function processGuestNames(guestNamesArray) {
  if (!guestNamesArray || guestNamesArray.length === 0) {
    return '';
  }
  return guestNamesArray.join(', ');
}

function processDietaryRestrictions(dietary) {
  const restrictions = [];

  for (const [guestIndex, dietaryOptions] of Object.entries(dietary)) {
    const options = [];

    for (const [restriction, value] of Object.entries(dietaryOptions)) {
      if (value === true) {
        options.push(restriction);
      }
    }

    if (options.length > 0) {
      restrictions.push(`Guest ${parseInt(guestIndex) + 1}: ${options.join(', ')}`);
    }
  }

  return restrictions.join(' | ');
}

function processMealSelections(meals) {
  const selections = [];

  for (const [guestIndex, mealChoice] of Object.entries(meals)) {
    selections.push(`Guest ${parseInt(guestIndex) + 1}: ${mealChoice}`);
  }

  return selections.join(' | ');
}

// ============================================================================
// EMAIL NOTIFICATION
// ============================================================================

function sendNotificationEmail(data) {
  try {
    const subject = `New Wedding RSVP from ${data.name}`;

    let body = `You have received a new RSVP:\n\n`;
    body += `Name: ${data.name}\n`;
    body += `Attendance: ${data.attendance}\n`;

    if (data.attendance === 'yes') {
      body += `Number of Guests: ${data.numGuests}\n`;

      if (data.guestNames && data.guestNames.length > 0) {
        body += `Guest Names: ${data.guestNames.join(', ')}\n`;
      }

      body += `\nDietary Restrictions:\n${processDietaryRestrictions(data.dietary || {})}\n`;

      if (data.dietaryDetails) {
        body += `Dietary Details: ${data.dietaryDetails}\n`;
      }

      body += `\nMeal Selections:\n${processMealSelections(data.meals || {})}\n`;
      body += `\nStaying Overnight: ${data.stayingOvernight}\n`;

      if (data.accommodation) {
        body += `Accommodation: ${data.accommodation}\n`;
      }

      if (data.songRequest) {
        body += `Song Request: ${data.songRequest}\n`;
      }
    }

    body += `\n---\n`;
    body += `Submitted: ${Utilities.formatDate(new Date(), CONFIG.timezone, 'yyyy-MM-dd HH:mm:ss')}\n`;
    body += `View all RSVPs: ${SpreadsheetApp.getActiveSpreadsheet().getUrl()}`;

    MailApp.sendEmail(CONFIG.notificationEmail, subject, body);

  } catch (error) {
    Logger.log('Email notification error: ' + error.toString());
    // Don't throw - we don't want email failures to break the RSVP submission
  }
}

// ============================================================================
// TEST FUNCTION - Use this to test the script
// ============================================================================

function testRSVP() {
  const testData = {
    name: 'John Smith',
    attendance: 'yes',
    numGuests: '2',
    guestNames: ['Jane Smith'],
    dietary: {
      '0': { 'none': true },
      '1': { 'vegetarian': true, 'gluten-free': true }
    },
    dietaryDetails: '',
    meals: {
      '0': 'chicken',
      '1': 'vegetarian'
    },
    stayingOvernight: 'yes',
    accommodation: 'yurt',
    songRequest: 'Mr. Brightside by The Killers'
  };

  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };

  const result = doPost(mockEvent);
  Logger.log(result.getContent());
}
