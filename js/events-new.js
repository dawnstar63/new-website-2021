// /js/events.js
document.addEventListener("DOMContentLoaded", () => {
  const GOOGLE_CALENDAR_ID = "a7ad7aa1d1b94d6a1db67fb73916f55c4e8a1b603ddba7a6babe94a334606b0a@group.calendar.google.com";
  const API_KEY = "AIzaSyBimHbgE5Pab3tG2GdiecyMSa6fd_i1I-E";

  const GALLERY_IMAGES = [
    "/img/gallery/01-elena-ariza-portrait-tapestry.jpeg",
    "/img/gallery/03-elena-ariza-gazing-bush.jpeg",
    "/img/gallery/04-elena-ariza-leaning-bush.jpg",
    "/img/gallery/05-Elena-Ariza-black-and-white-small-by-Anastasia Chernyavsky.jpg",
    "/img/gallery/08-elena-ariza-leaning-against-wall-edited-min.jpg",
    "/img/gallery/09-Elena-Ariza-colorful-leaves-edited.jpg",
  ];

  const spinner      = document.getElementById("loading-spinner");
  const upcomingBody = document.getElementById("upcoming-events");
  const pastBody     = document.getElementById("past-events");
  const previewBody  = document.getElementById("upcoming-preview");

  // simple djb2 string → integer hash
  function hashString(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
    }
    return Math.abs(hash);
  }

  // format full date
  function formatDate(d) {
    return d.toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric"
    });
  }

  // ← NEW: wraps *any* URL in your lazy‑image structure
  function makeLazyImage(url, linkUrl) {
    const abs = url.startsWith("http")
      ? url
      : "https://elenaariza.com" + url;
    const proxy = `//images.weserv.nl/?url=${encodeURIComponent(abs)}&w=25&fit=cover&output=png`;

    const inner = `
      <div class="lazy-image event-lazy" 
           data-large="${abs}">
        <img src="${proxy}" class="img-small loaded">
      </div>`.trim();

    // wrap in <a> if there's a custom link
    return linkUrl
      ? `<a href="${linkUrl}" target="_blank">${inner}</a>`
      : inner;
  }

  function parseLocalDate(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day); // Month is 0-indexed
  }

  function subtractOneDay(dateStr) {
    const d = parseLocalDate(dateStr);
    d.setDate(d.getDate() - 1);
    return d;
  }

  function makeRow(ev, isPast) {
    const rawDesc = ev.description || "";

    // pull out custom tokens
    const mImg     = rawDesc.match(/img:\s*(?:<[^>]*>)?([^<\n]+)(?:<\/[^>\n]*>)?(?:\s*(?:\n|$))/i);
    const mLink    = rawDesc.match(/link:\s*(?:<[^>]*>)?([^<\n]+)(?:<\/[^>\n]*>)?(?:\s*(?:\n|$))/i);
    const mDetails = rawDesc.match(/(?:^|\n)details:\s*([\s\S]+)/i);

    // stable gallery index from event.id
    const key    = ev.id || ev.summary;
    const idx    = hashString(key) % GALLERY_IMAGES.length;

    // choose image
    const imgUrl = mImg
      ? mImg[1]
      : (ev.attachments?.[0]?.fileUrl || GALLERY_IMAGES[idx]);

    // choose custom link (or null)
    const linkUrl = mLink ? mLink[1] : null;

    // choose custom details text
    const detailsText = mDetails ? mDetails[1].trim() : "";

    // parse start/end
    const start = ev.start.dateTime
      ? new Date(ev.start.dateTime)
      : parseLocalDate(ev.start.date);
    const end = ev.end?.dateTime
      ? new Date(ev.end.dateTime)
      : (ev.end?.date ? subtractOneDay(ev.end.date) : null);

    // date icon components
    const dayNum   = start.getDate().toString().padStart(2, "0");
    const monthAbv = start.toLocaleString("en-US", { month: "short" });
    const pastCls  = isPast ? "date-past" : "";
    const multiDay = end && end.toDateString() !== start.toDateString();
    const endDayNum = multiDay ? end.getDate().toString().padStart(2, "0") : "";
    const endMonthAbv = multiDay
      ? end.toLocaleString("en-US", { month: "short" })
      : "";

    // build thumbnail HTML
    const thumbHTML = makeLazyImage(imgUrl, linkUrl);

    // title HTML
    const titleHTML = linkUrl
      ? `<a href="${linkUrl}" target="_blank">${ev.summary}</a>`
      : ev.summary;

    // date cell
    let dateCell;
    if (multiDay) {
      dateCell = `${formatDate(start)} ~ ${formatDate(end)}`;
    } else {
      dateCell = formatDate(start);
    }

    // time row
    const eventTimeZone = ev.start.timeZone;
    const timeRow = ev.start.dateTime
      ? `<tr class="event-detail when time" data-original-time=${start.toISOString()}>
           <td id="clock-icon" class="material-icons md-18">schedule</td>
           <td>${start.toLocaleString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              timeZoneName: "short",
              timeZone: eventTimeZone
           })}
            <div class="timezone-note">(Your time: 
            ${start.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              timeZoneName: 'short'
            })})</div></td>
         </tr>`
      : "";

    // location row
    const loc = ev.location || "";
    const locRow = loc
      ? `<tr class="event-detail where location">
           <td id="location-icon" class="material-icons md-18">place</td>
           <td class="location-link">
             <a
               href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}"
               target="_blank">${loc}</a>
           </td>
         </tr>`
      : "";

    // custom link row
    const linkRow = linkUrl
      ? `<tr class="event-detail link link-container">
           <td id="link-icon" class="material-icons md-18">link</td>
           <td>
             <a class="break-words" href="${linkUrl}" target="_blank">${linkUrl}</a>
           </td>
         </tr>`
      : "";

    // custom details row
    const descRow = detailsText
      ? `<tr class="event-detail description truncated">
           <td id="link-icon" class="material-icons md-18">notes</td>
           <td class="preserve-newlines">${detailsText}</td>
         </tr>`
      : "";

    return `
      <tr class="event-row" valign="top">
        <td class="date-column thumbnail-container">
          <div class="event-thumbnail">
            ${thumbHTML}
            <div class="date-icon ${pastCls}">
              <div class="date-icon-inner">
                <div class="day-number icon-day-font">${parseInt(dayNum)}</div>
                <div class="month icon-month-font">${monthAbv}</div>
                ${multiDay
                  ? `<div class="end-date icon-month-font">to ${endMonthAbv} ${parseInt(endDayNum)}</div>`
                  : ""}
              </div>
            </div>
          </div>
        </td>
        <td class="margin-column"><div class="date-icon-margin"></div></td>
        <td class="event-details-column">
          <table class="event-details text-font">
            <tr>
              <td class="event-title" colspan="2">${titleHTML}</td>
            </tr>
            <tr class="event-detail when date">
              <td id="date-icon" class="material-icons md-18">
                ${end && end.getTime()!==start.getTime() ? "date_range" : "event"}
              </td>
              <td>${dateCell}</td>
            </tr>
            ${timeRow}
            ${locRow}
            ${linkRow}
            ${descRow}
          </table>
        </td>
      </tr>`;
  }

  function getSkeletonRows(count) {
    let rows = "";
    for (let i = 0; i < count; i++) {
      rows += `
        <tr class="event-row skeleton-row" valign="top">
          <td class="date-column thumbnail-container">
            <div class="event-thumbnail skeleton-thumbnail"></div>
          </td>
          <td class="margin-column"><div class="date-icon-margin"></div></td>
          <td class="event-details-column">
            <table class="event-details text-font"><tbody>
              <tr>
                <td class="event-title" colspan="2">
                  <div class="skeleton-line" style="width: 70%;"></div>
                </td>
              </tr>
              <tr class="event-detail when date">
                <td id="date-icon" class="material-icons md-18">event</td>
                <td><div class="skeleton-line" style="width: 50%;"></div></td>
              </tr>
              <tr class="event-detail when time">
                <td id="clock-icon" class="material-icons md-18">schedule</td>
                <td><div class="skeleton-line" style="width: 30%;"></div></td>
              </tr>
              <tr class="event-detail where location">
                <td id="location-icon" class="material-icons md-18">place</td>
                <td><div class="skeleton-line" style="width: 60%;"></div></td>
              </tr>
            </tbody></table>
          </td>
        </tr>`;
    }
    return rows;
  }

  async function loadEvents() {
    if (!upcomingBody &&
        !pastBody &&
        !previewBody) {
      // No relevant containers — exit early
      console.log("No events table containers found on this page.");
      return;
    }

    if (upcomingBody) upcomingBody.innerHTML = getSkeletonRows(3);
    if (pastBody)     pastBody    .innerHTML = getSkeletonRows(3);
    if (previewBody)  previewBody .innerHTML = getSkeletonRows(3);

    if (spinner) spinner.style.display = "";
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    const url = [
      `https://www.googleapis.com/calendar/v3/calendars/`,
      encodeURIComponent(GOOGLE_CALENDAR_ID),
      `/events?key=${API_KEY}`,
      `&singleEvents=true&orderBy=startTime`,
      `&timeMin=${twoYearsAgo.toISOString()}`,
      `&maxResults=250`
    ].join("");

    try {
      const res  = await fetch(url);
      const data = await res.json();
      const now  = new Date();

      const upcoming = [], past = [];
      (data.items || []).forEach(ev => {
        const evEnd = ev.end.dateTime
          ? new Date(ev.end.dateTime)
          : new Date(ev.end.date || ev.start.date);
        (evEnd > now ? upcoming : past).push(ev);
      });

      upcoming.sort((a,b) => new Date(a.start.dateTime||a.start.date)
                               - new Date(b.start.dateTime||b.start.date));
      past    .sort((a,b) => new Date(b.start.dateTime||b.start.date)
                               - new Date(a.start.dateTime||a.start.date));

      // grabs 3 upcoming events
      const preview = upcoming.slice(0, 3);

      if (upcomingBody) {
        upcomingBody.innerHTML = upcoming
        .map(ev => makeRow(ev, false))
        .join("") || `<tr><td colspan="3">No upcoming events.</td></tr>`;
      }

      if (pastBody) {
        pastBody.innerHTML = past
        .map(ev => makeRow(ev, true))
        .join("") || `<tr><td colspan="3">No recent events.</td></tr>`;
      }

      if (previewBody) {
        previewBody.innerHTML = preview
        .map(ev => makeRow(ev, false))
        .join("") || `<tr><td colspan="3">No upcoming events.</td></tr>`;
      }
    } catch (err) {
      console.error(err);
      if (spinner) spinner.innerHTML = "<p>Failed to load events.</p>";
    } finally {
      if (spinner) spinner.style.display = "none";
    }
  }

  loadEvents();
});