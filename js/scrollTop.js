//Get the button
let mybutton = document.getElementById("btn-back-to-top");
const viewport = document.querySelector(".viewport");

// When the user scrolls down 20px from the top of the document, show the button
viewport.onscroll = function () {
  scrollFunction();
};

function scrollFunction() {
  const viewport = document.querySelector(".viewport");
  if (
    document.body.scrollTop > 20 ||
    document.documentElement.scrollTop > 20 ||
    viewport.scrollTop > 200
  ) {
    mybutton.style.opacity = 1;
    mybutton.style.visibility = "visible";
  } else {
    mybutton.style.opacity = 0;
    mybutton.style.visibility = "hidden";
  }
}
// When the user clicks on the button, scroll to the top of the document
mybutton.addEventListener("click", backToTop);

function backToTop() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
  const viewport = document.querySelector(".viewport");
  viewport.scrollTop = 0;
}