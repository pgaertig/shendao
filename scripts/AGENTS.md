# Scripts

Standalone utility scripts unrelated to the website build. Deployed and run independently.

## google-script-sync-calendar-contacts.gs

Google Apps Script deployed in the clinic's Google account. Runs on an hourly time-based trigger.

**What it does:** For each Google Calendar event titled `"Akupunktura - pierwsza wizyta (Imię Nazwisko)"` in the configured time window, it extracts the client name and phone number (from the description line `Telefon klienta: …`), then creates a new Google Contact via the People API — only if no contact with that phone number already exists. The contact name is stored with a first-visit date suffix, e.g. `Jan Kowalski (2026-03-02)`.

**Deployment:** Manage this script directly in the Google Apps Script editor. It is not part of the website build.

## calendesk-tracking.html

Canonical copy of the Rybbit tracking snippet injected into the Calendesk booking page (`https://shendao.calendesk.net`), which is a Vuetify/Vue SPA we don't otherwise control.

**What it does:** Loads Rybbit (site-id `1c0b2b1f5d3e`, `data-tag="calendesk"`) and an observer that emits booking-funnel events: `click_service_<N>` (service tiles `#id_service_1`, `#id_service_2`, …), `slot_selected`, `booking_form_opened`, `booking_submit_click`, and `booking_created` / `booking_failed` (by intercepting the `POST user/bookings/create/*` XHR). Uses delegated clicks + a MutationObserver to survive Vue re-renders.

**Deployment:** Paste the two `<script>` blocks into the Calendesk panel (Settings/Tools → custom scripts, head section). Prerequisite: add `shendao.calendesk.net` as an allowed domain on Rybbit site `1c0b2b1f5d3e`. Not part of the website build.
