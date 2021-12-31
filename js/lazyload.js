// This is "probably" IE9 compatible but will need some fallbacks for IE8
// - (event listeners, forEach loop)

// wait for the entire page to finish loading
// window.addEventListener('load', function() {
	
// 	// setTimeout to simulate the delay from a real page load
// 	setTimeout(lazyLoad, 1000);
	
// });

// function lazyLoad() {
// 	var lazy_images = document.querySelectorAll('.lazy-image');
	
// 	// loop over each card image
// 	lazy_images.forEach(function(lazy_image) {
// 		var image_url = lazy_image.getAttribute('data-image-full');
// 		var content_image = lazy_image.querySelector('img');
		
// 		// change the src of the content image to load the new high res photo
// 		content_image.src = image_url;
		
// 		// listen for load event when the new photo is finished loading
// 		content_image.addEventListener('load', function() {
			
// 			// swap out the visible background image with the new fully downloaded photo
// 			lazy_image.style.backgroundImage = 'url(' + image_url + ')';
// 			// add a class to remove the blur filter to smoothly transition the image change
// 			lazy_image.className = lazy_image.className + ' is-loaded';
			
// 		});
		
// 	});
	
// }

const golden_gate = "img/elena-ariza-golden-gate-bridge-filter-lighter-smaller.jpg";
const images_map = new Map([
	[golden_gate, 'golden-gate'],
	['/'+golden_gate, 'golden-gate']
	]);

window.onload = function() {
	
	// get all lazy image elements
	const lazy_images = document.querySelectorAll('.lazy-image');

	lazy_images.forEach(function(lazy_image) {
		// get small/lazy image
		const small = lazy_image.querySelector('.img-small');
		const imgLarge = new Image();

		if (images_map.has(lazy_image.dataset.large)) {
			lazy_image.classList.add(images_map.get(lazy_image.dataset.large));
		}

		imgLarge.src = lazy_image.dataset.large;
		imgLarge.onload = function () {
			// mark large image as loaded
			imgLarge.classList.add('loaded');
		};

		// add large image to the lazy_image element
		lazy_image.appendChild(imgLarge);
	});

}