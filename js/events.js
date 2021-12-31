document.addEventListener("DOMContentLoaded", function() {
    $('.location-link').each(function () {
        var link = "<a href='https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent( $(this).text().trim() ) + "' target='_blank'>" + $(this).text() + "</a>";
        $(this).html(link);
   });
});