// This is "probably" IE9 compatible but will need some fallbacks for IE8
// - (event listeners, forEach loop)

// wait for the entire page to finish loading
window.addEventListener('load', function() {
	
	// setTimeout to simulate the delay from a real page load
	setTimeout(lazyLoad, 0);
	
});

function lazyLoad() {
	var lazy_images = document.querySelectorAll('.lazy-image');
	
	// loop over each card image
	lazy_images.forEach(function(lazy_image) {
		var image_url = lazy_image.getAttribute('data-image-full');
		var content_image = lazy_image.querySelector('img');
		
		// change the src of the content image to load the new high res photo
		content_image.src = image_url;
		
		// listen for load event when the new photo is finished loading
		content_image.addEventListener('load', function() {
			// swap out the visible background image with the new fully downloaded photo
			lazy_image.style.backgroundImage = 'url(' + image_url + ')';
			// add a class to remove the blur filter to smoothly transition the image change
			lazy_image.className = lazy_image.className + ' is-loaded';
		});
		
	});
	
}

