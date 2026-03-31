const CALENDAR_ID = Session.getEffectiveUser().getEmail();
const LOOKBACK_HOURS = 2;
const LOOKAHEAD_DAYS = 30;

/**
 * Main entry: run on time-based trigger.
 */
function syncContactsFromCalendar() {
  const now = new Date();
  const timeMin = new Date(now.getTime() - LOOKBACK_HOURS * 60 * 60 * 1000);
  const timeMax = new Date(now.getTime() + LOOKAHEAD_DAYS * 24 * 60 * 60 * 1000);

  const calendar = CalendarApp.getCalendarById(CALENDAR_ID);
  const events = calendar.getEvents(timeMin, timeMax);

  // Warmup cache
  People.People.searchContacts({query: "", readMask: "names,emailAddresses,phoneNumbers"});

  events.forEach(event => {
    processEvent(event);
  });
}

/**
 * Process one event: extract name, phone, email, then create Person if phone not found.
 */
function processEvent(event) {
  const title = event.getTitle() || '';
  const description = event.getDescription() || '';

  const rawName = extractNameFromTitle(title);
  if (!rawName) {
    // Not our “first visit” event, ignore
    return;
  }

  const phone = extractPhoneFromDescription(description);
  const email = extractClientEmail(event);  // we still read email

  if (!phone) {
    Logger.log('Skipping event "%s" – no phone found.', title);
    return;
  }

  // Build name with first-visit date suffix: "Jan Kowalski (2026-03-02)"
  const eventDateStr = formatDateYMD(event.getStartTime());
  const name = rawName + ' (' + eventDateStr + ')';

  Logger.log('Processing event: "%s", name=%s, phone=%s, email=%s',
             title, name, phone, email);

  // Search ONLY by phone
  const existingPerson = findPersonByPhone(phone);

  if (existingPerson) {
    Logger.log(
      'Contact with phone %s already exists (resourceName=%s). Not creating or updating.',
      phone,
      existingPerson.resourceName
    );
    return;
  }

  Logger.log('Creating NEW contact for phone: %s, email: %s', phone, email);
  createPerson({ name, phone, email });  // email is used if present
}


/**
 * Extract name from title "Akupunktura - pierwsza wizyta (Jan Kowalski)".
 */
function extractNameFromTitle(title) {
  const PREFIX = 'Akupunktura - pierwsza wizyta (';

  if (!title.startsWith(PREFIX)) {
    // Title not in expected format – skip
    return null;
  }

  // Match text inside the FIRST pair of parentheses
  const regex = /\(([^)]+)\)/;
  const match = title.match(regex);
  if (!match) return null;

  return match[1].trim();
}


/**
 * Extract phone from description line "Telefon klienta: +48509837800".
 */
function extractPhoneFromDescription(desc) {
  if (!desc) return null;
  const lines = desc.split(/\r?\n/);
  const prefix = 'Telefon klienta:';

  for (let line of lines) {
    line = line.trim();
    if (line.startsWith(prefix)) {
      let phone = line.substring(prefix.length).trim();
      // clean phone a bit
      phone = phone.replace(/[^\d+]/g, '');
      return phone || null;
    }
  }
  return null;
}

/**
 * Get client email: attendee email that is not the calendar owner and not a resource.
 */
function extractClientEmail(event) {
  const myEmail = Session.getActiveUser().getEmail(); // or hardcode your email

  const guests = event.getGuestList(true); // include owner
  for (const guest of guests) {
    const email = guest.getEmail();
    // skip your own email / organizer email if you want
    if (email && email.toLowerCase() !== myEmail.toLowerCase()) {
      return email;
    }
  }
  return null;
}

/**
 * Find contact by phone using People API searchContacts.
 */
function findPersonByPhone(phone) {
  const request = {
    query: phone,
    pageSize: 10,
    readMask: 'names,emailAddresses,phoneNumbers'
  };
  const response = People.People.searchContacts(request);
  const results = response.results || [];
  for (const r of results) {
    const person = r.person;
    if (!person.phoneNumbers) continue;
    const hasPhone = person.phoneNumbers.some(p => normalizePhone(p.value) === normalizePhone(phone));
    if (hasPhone) return person;
  }
  return null;
}

/**
 * Create new contact using People API.
 * Uses name+date, phone, and email if present.
 */
function createPerson({ name, phone, email }) {
  Logger.log('createPerson: name=%s, phone=%s, email=%s', name, phone, email);  
  const person = {};

  if (name) {
    person.names = [{
      displayName: name,
      givenName: name.split(' ')[0],
      familyName: name.split(' ').slice(1).join(' ') || ''
    }];
  }

  if (phone) {
    person.phoneNumbers = [{
      value: phone,
      type: 'mobile'
    }];
  }

  if (email) {
    person.emailAddresses = [{
      value: email
    }];
  }

  People.People.createContact(person);
}

/**
 * Normalize phone numbers for comparison.
 */
function normalizePhone(phone) {
  if (!phone) return '';
  return phone.replace(/[^\d+]/g, '');
}

/**
 * Format Date to "YYYY-MM-DD" in the script's timezone.
 */
function formatDateYMD(date) {
  return Utilities.formatDate(
    date,
    Session.getScriptTimeZone(),
    'yyyy-MM-dd'
  );
}
