# Scripts

Standalone utility scripts unrelated to the website build. Deployed and run independently.

## google-script-sync-calendar-contacts.gs

Google Apps Script deployed in the clinic's Google account. Runs on an hourly time-based trigger.

**What it does:** For each Google Calendar event titled `"Akupunktura - pierwsza wizyta (Imię Nazwisko)"` in the configured time window, it extracts the client name and phone number (from the description line `Telefon klienta: …`), then creates a new Google Contact via the People API — only if no contact with that phone number already exists. The contact name is stored with a first-visit date suffix, e.g. `Jan Kowalski (2026-03-02)`.

**Deployment:** Manage this script directly in the Google Apps Script editor. It is not part of the website build.
