// window.onload = function() {
//   var viewPort = document.querySelector(".viewport");

//   var scrollPos = sessionStorage.getItem("viewport-scroll");
//   if (scrollPos !== null) {
//     viewPort.scrollTop = parseInt(scrollPos, 10);
//     console.log(scrollPos);
//   }

//   window.addEventListener("beforeunload", () => {
//     sessionStorage.setItem("viewport-scroll", viewPort.scrollTop);
//   });
// };