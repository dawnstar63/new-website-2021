const API_KEY = 'AIzaSyBimHbgE5Pab3tG2GdiecyMSa6fd_i1I-E';
const CALENDAR_ID = 'f9fc4d2a996f024cbadfc1b211e756ca7f269ecbb671886533f6943cc99158e4@group.calendar.google.com';

function initClient() {
gapi.client.init({
  apiKey: API_KEY
}).then(() => {
  return gapi.client.request({
    path: `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events`,
    params: {
      timeMin: new Date().toISOString(),
      showDeleted: false,
      singleEvents: true,
      maxResults: 10,
      orderBy: 'startTime'
    }
  });
}).then(response => {
  const events = response.result.items;
  const container = document.getElementById('calendar-events');

  if (!events || events.length === 0) {
    container.innerHTML = '<p>No upcoming events found.</p>';
    return;
  }

  container.innerHTML = events.map(event => {
    const start = event.start.dateTime || event.start.date;
    return `
      <div class="event">
        <h3>${event.summary}</h3>
        <p>${new Date(start).toLocaleString()}</p>
        ${event.description ? `<p>${event.description}</p>` : ''}
      </div>
    `;
  }).join('');
}, err => {
  console.error("Error fetching events", err);
});
}

function start() {
gapi.load('client', initClient);
}

start();