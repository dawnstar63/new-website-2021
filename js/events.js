// document.addEventListener("DOMContentLoaded", function() {
//     $('.location-link').each(function () {
//         var link = "<a href='https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent( $(this).text().trim() ) + "' target='_blank'>" + $(this).text() + "</a>";
//         $(this).html(link);
//    });
// });


// events.js
document.addEventListener("DOMContentLoaded", function() {
    const GOOGLE_CALENDAR_ID = 'f9fc4d2a996f024cbadfc1b211e756ca7f269ecbb671886533f6943cc99158e4@group.calendar.google.com';
    const API_KEY = 'AIzaSyBimHbgE5Pab3tG2GdiecyMSa6fd_i1I-E';
    const USER_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

    function formatEventTime(event, showTimezone = true) {
        const start = event.start.dateTime ? 
            new Date(event.start.dateTime) : 
            new Date(event.start.date);
        
        const options = {
            hour: 'numeric',
            minute: '2-digit',
            timeZone: event.start.timeZone || USER_TIMEZONE
        };

        if (showTimezone) {
            options.timeZoneName = 'short';
        }

        // All-day events
        if (!event.start.dateTime) {
            return start.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                timeZone: event.start.timeZone
            });
        }

        // Timed events
        const timeString = start.toLocaleTimeString('en-US', options);
        const dateString = start.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            timeZone: event.start.timeZone
        });

        // Handle multi-day events
        if (event.end.dateTime) {
            const end = new Date(event.end.dateTime);
            const endOptions = { ...options, timeZone: event.end.timeZone || event.start.timeZone };
            const endTimeString = end.toLocaleTimeString('en-US', endOptions);
            
            if (start.toDateString() !== end.toDateString()) {
                const endDateString = end.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    timeZone: event.end.timeZone
                });
                return `${dateString} ${timeString} – ${endDateString} ${endTimeString}`;
            }
            
            return `${dateString} ${timeString} – ${endTimeString}`;
        }

        return `${dateString} ${timeString}`;
    }

    function createEventElement(event) {
        const timeHTML = event.start.dateTime || event.start.date ? `
            <tr class="event-detail when time">
                <td class="material-icons md-18">schedule</td>
                <td>${formatEventTime(event)}</td>
            </tr>` : '';

        return `
        <tr class="event-row" valign="top">
            <!-- ... existing thumbnail code ... -->
            <td class="event-details-column">
                <table class="event-details text-font">
                    <!-- ... existing title code ... -->
                    ${timeHTML}
                    ${event.location ? `
                    <tr class="event-detail where location">
                        <td class="material-icons md-18">place</td>
                        <td class="location-link">${event.location}</td>
                    </tr>` : ''}
                    <!-- ... rest of existing code ... -->
                </table>
            </td>
        </tr>`;
    }

    // Modified loadEvents function
    async function loadEvents() {
        try {
            const apiUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(GOOGLE_CALENDAR_ID)}/events?key=${API_KEY}&singleEvents=true&orderBy=startTime&timeMin=${new Date().toISOString()}`;
        
            console.log('API Request URL:', apiUrl);
            
            const response1 = await fetch(apiUrl);
            const data1 = await response1.json();
            
            console.log('Raw API Response:', data1);

            const now = new Date();
            const twoYearsAgo = new Date(now);
            twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

            const response = await fetch(
                `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(GOOGLE_CALENDAR_ID)}/events` +
                `?key=${API_KEY}&singleEvents=true&orderBy=startTime` +
                `&timeMin=${twoYearsAgo.toISOString()}&maxResults=250` +
                `&fields=items(description,end,htmlLink,location,start,summary)`
            );

            const data = await response.json();

            console.log("this is the data:");
            console.log(data);

            // Process events with timezone awareness
            const processedEvents = data.items.map(event => {
                // Extract image from description
                const imgMatch = event.description?.match(/img:\s*(https?:\/\/\S+)/i);
                return {
                    ...event,
                    img: imgMatch ? imgMatch[1] : '/img/default-event.jpg',
                    sortDate: new Date(event.start.dateTime || event.start.date)
                };
            });

            // Split into upcoming/past
            const upcoming = processedEvents.filter(e => new Date(e.end.dateTime || e.end.date) > now);
            const past = processedEvents.filter(e => new Date(e.end.dateTime || e.end.date) <= now);

            // Sort events
            upcoming.sort((a, b) => a.sortDate - b.sortDate);
            past.sort((a, b) => b.sortDate - a.sortDate);

            // Render events
            document.getElementById('upcoming-events').innerHTML = upcoming.map(createEventElement).join('');
            document.getElementById('past-events').innerHTML = past.map(createEventElement).join('');

            // Add timezone hints for foreign events
            document.querySelectorAll('.event-detail.when.time').forEach(row => {
                const eventTime = new Date(row.dataset.originalTime);
                const localTimeString = eventTime.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    timeZoneName: 'short'
                });
                row.innerHTML += `<div class="timezone-note">(Your time: ${localTimeString})</div>`;
            });

            // Add Google Maps links
            document.querySelectorAll('.location-link').forEach(el => {
                el.innerHTML = `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(el.textContent)}" target="_blank">${el.textContent}</a>`;
            });

            // Hide loading spinner
            document.getElementById('loading-spinner').style.display = 'none';

        } catch (error) {
            console.error('Error loading events:', error);
            document.getElementById('loading-spinner').innerHTML = '<p>Error loading events. Please try again later.</p>';
        }
    }

    loadEvents();
    console.log("Google Calendar loaded events!");
});