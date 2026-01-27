# Wedding RSVP - Google Apps Script Setup Guide

This guide will walk you through setting up your RSVP form to submit data to a Google Sheet.

## What You're Setting Up

Your wedding website's RSVP form will automatically send responses to a Google Sheet, giving you a real-time spreadsheet of all your RSVPs with:
- Guest names
- Attendance status
- Dietary restrictions
- Meal choices
- Accommodation preferences
- Song requests
- Timestamps for each submission

**Plus:** You'll get an email notification whenever someone RSVPs!

---

## Prerequisites

- A Google account
- Your wedding website code (already complete!)
- 20-30 minutes for first-time setup

---

## Step-by-Step Setup

### Part 1: Create Your RSVP Response Sheet

1. **Go to Google Sheets**
   - Visit: https://sheets.google.com
   - Sign in with your Google account

2. **Create a New Spreadsheet**
   - Click the **+ Blank** button to create a new sheet
   - Name it something like "Wedding RSVPs 2027"
   - The sheet name will be automatically saved

3. **Keep This Tab Open**
   - You'll need to paste code here in a moment

---

### Part 2: Add the Apps Script Code

4. **Open the Script Editor**
   - In your Google Sheet, click **Extensions** → **Apps Script**
   - A new tab will open with the Apps Script editor
   - You'll see a default `function myFunction() {}` - delete all of it

5. **Paste the Script Code**
   - Open the file `google-apps-script-code.gs` from your wedding site folder
   - Copy ALL the code from that file
   - Paste it into the Apps Script editor (replacing everything)

6. **Configure Your Settings**
   - Find the `CONFIG` section at the top of the script (around line 20)
   - Update these values:

   ```javascript
   const CONFIG = {
     // Your email address for RSVP notifications
     notificationEmail: 'your-email@example.com', // ← CHANGE THIS

     // Enable/disable email notifications
     sendEmailNotifications: true, // Set to false if you don't want emails

     // Sheet name where responses will be saved
     sheetName: 'RSVP Responses', // This is fine as-is

     // Timezone for timestamps
     timezone: 'Europe/London' // Change if needed
   };
   ```

   **Important:** Replace `'your-email@example.com'` with your actual email address!

7. **Save the Script**
   - Click the **Save** icon (💾) or press `Ctrl+S` (Windows) / `Cmd+S` (Mac)
   - Give your project a name (e.g., "Wedding RSVP Handler")

---

### Part 3: Test the Script (Optional but Recommended)

8. **Run the Test Function**
   - In the Apps Script editor, find the dropdown at the top that says "Select function"
   - Select **testRSVP** from the dropdown
   - Click the **Run** button (▶️)

9. **Grant Permissions**
   - The first time you run this, you'll see a dialog asking for permissions
   - Click **Review permissions**
   - Choose your Google account
   - Click **Advanced** → **Go to Wedding RSVP Handler (unsafe)**
   - Click **Allow**

   *Note: This is safe - it's your own script accessing your own sheet*

10. **Check the Results**
    - Go back to your Google Sheet tab
    - You should see a new sheet tab called "RSVP Responses" with headers
    - There should be one test entry from "John Smith"
    - If you enabled email notifications, check your inbox for a test email

11. **Delete the Test Entry** (optional)
    - Select row 2 (the John Smith test entry)
    - Right-click → Delete row
    - This keeps your sheet clean for real RSVPs

---

### Part 4: Deploy as Web App

12. **Deploy the Script**
    - In the Apps Script editor, click **Deploy** → **New deployment**
    - Click the gear icon (⚙️) next to "Select type"
    - Choose **Web app**

13. **Configure the Deployment**
    - **Description:** "Wedding RSVP Form Handler" (or whatever you like)
    - **Execute as:** Me (your email)
    - **Who has access:** Anyone

    *Note: "Anyone" means anyone with the URL can submit - this is what you want for wedding guests*

14. **Deploy**
    - Click **Deploy**
    - You may need to authorize again - click **Authorize access** and follow the prompts
    - You'll see a "Deployment successfully created" message

15. **Copy the Web App URL**
    - In the deployment dialog, you'll see **Web app URL**
    - Click **Copy** to copy this URL
    - **SAVE THIS URL** - you'll need it in the next step!

    It will look something like:
    ```
    https://script.google.com/macros/s/AKfycbz.../exec
    ```

16. **Click Done**

---

### Part 5: Connect Your Website to the Script

17. **Open script.js**
    - In your wedding site folder, open `script.js` in your code editor

18. **Find the SCRIPT_URL Line**
    - Search for: `const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';`
    - It should be around line 506

19. **Replace the Placeholder**
    - Replace `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` with your actual Web App URL

    **Before:**
    ```javascript
    const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
    ```

    **After:**
    ```javascript
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz.../exec';
    ```

20. **Save script.js**

---

### Part 6: Deploy to GitHub Pages

21. **Commit and Push Your Changes**
    - In your terminal/command prompt, navigate to your wedding site folder:

    ```bash
    cd C:\Users\ianni\Documents\Code\our-wedding-site
    ```

    - Add and commit your changes:

    ```bash
    git add script.js
    git commit -m "Connect RSVP form to Google Sheets"
    git push
    ```

22. **Wait for GitHub Pages to Update**
    - GitHub Pages typically updates within 1-2 minutes
    - Your site will rebuild automatically

---

### Part 7: Test the Live Form

23. **Visit Your RSVP Page**
    - Go to your live wedding site
    - Navigate to the RSVP page

24. **Submit a Test RSVP**
    - Fill out the form with test data
    - Use a different name than your actual guests
    - Click Submit

25. **Verify in Google Sheets**
    - Go back to your Google Sheet
    - You should see a new row with your test RSVP data
    - Check your email for the notification (if enabled)

26. **Delete Test Entry**
    - Delete the test row from the sheet
    - Now you're ready for real RSVPs!

---

## Viewing Your RSVPs

- **Google Sheet:** Go to your sheet anytime to see all responses in one place
- **Email Notifications:** Get notified immediately when someone RSVPs (if enabled)
- **Filtering/Sorting:** Use Google Sheets features to filter by attendance, dietary needs, etc.
- **Export:** You can download as Excel, CSV, or PDF anytime

---

## Troubleshooting

### "RSVP submission is not yet configured" Error
- You forgot to update the `SCRIPT_URL` in script.js (step 19)
- Make sure you pushed the changes to GitHub (step 21)

### Form Submits But Nothing Appears in Sheet
- Check that the Web App is deployed as "Anyone" can access (step 13)
- Make sure you copied the correct Web App URL (the one ending in `/exec`)
- Check the Apps Script execution logs: Apps Script editor → Executions tab

### Email Notifications Not Working
- Verify `notificationEmail` is set correctly in the CONFIG section
- Check your spam folder
- Make sure `sendEmailNotifications` is set to `true`

### "Script not authorized" Error
- Re-run the authorization process (steps 9-10)
- Make sure you clicked "Allow" for all permissions

### Need to Update the Script Later?
1. Edit the code in Apps Script editor
2. Save your changes
3. Click **Deploy** → **Manage deployments**
4. Click the **Edit** icon (✏️) next to your deployment
5. Change **Version** to "New version"
6. Click **Deploy**
7. You don't need to update the URL in script.js - it stays the same!

---

## Advanced Customization

### Change Email Notification Format
- Edit the `sendNotificationEmail()` function in the Apps Script
- Customize the `subject` and `body` variables

### Add More Columns to the Sheet
- Edit the `headers` array in `getOrCreateSheet()` function
- Add corresponding data in `processRSVPData()` function

### Change Timezone
- Update `CONFIG.timezone` with your timezone from this list:
  https://en.wikipedia.org/wiki/List_of_tz_database_time_zones

### Disable Email Notifications Temporarily
- Change `sendEmailNotifications: true` to `sendEmailNotifications: false`
- Save and redeploy (see "Need to Update the Script Later?" above)

---

## Data Privacy Note

- Your RSVP data is stored in your Google account only
- The data passes through Google's servers (Apps Script)
- No third-party services have access to your data
- You can delete the sheet/script at any time

---

## Questions or Issues?

If you run into problems:
1. Check the Troubleshooting section above
2. Look at the Apps Script logs: Apps Script editor → **Executions** tab
3. Check your browser's console for JavaScript errors (F12 → Console tab)

---

## Summary

✅ Created Google Sheet for RSVP responses
✅ Added Apps Script code
✅ Configured email notifications
✅ Tested the script
✅ Deployed as web app
✅ Connected website to script
✅ Pushed changes to GitHub
✅ Tested live form

**You're all set!** RSVPs will now automatically appear in your Google Sheet. 🎉

---

## Optional: Print This Checklist

When setting up, use this quick checklist:

- [ ] Create Google Sheet
- [ ] Open Apps Script editor
- [ ] Paste code from `google-apps-script-code.gs`
- [ ] Update `notificationEmail` in CONFIG
- [ ] Save script
- [ ] Run `testRSVP` function
- [ ] Grant permissions
- [ ] Deploy as web app (Execute as: Me, Who has access: Anyone)
- [ ] Copy Web App URL
- [ ] Paste URL into `script.js` line 506
- [ ] Save script.js
- [ ] Git commit and push
- [ ] Test live form
- [ ] Delete test entries

Done! 🎊
