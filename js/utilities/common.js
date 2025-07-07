// to create createBox for image ,sticky
function createBox(){
  const stickyPad = document.createElement("div");
  const navBar = document.createElement("div");
  const writingPad = document.createElement("div");
  const minimize = document.createElement("div");
  const close = document.createElement("div");
  stickyPad.setAttribute("class", "sticky-pad");
  navBar.setAttribute("class", "nav");
  writingPad.setAttribute("class", "writing-pad");
  close.setAttribute("class", "close");
  minimize.setAttribute("class", "minimize");
  navBar.appendChild(minimize);
  navBar.appendChild(close);
  stickyPad.appendChild(navBar);
  stickyPad.appendChild(writingPad);
  body.appendChild(stickyPad);
  // create sticky
  close.addEventListener("click", function() {
    stickyPad.remove();
  });

  let isMinimized = false;
  minimize.addEventListener("click", function() {
    isMinimized == false
      ? (writingPad.style.display = "none")
      : (writingPad.style.display = "block");
    isMinimized = !isMinimized;
  });
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

navBar.addEventListener("mousedown", (e) => {
  isDragging = true;

  const rect = stickyPad.getBoundingClientRect();
  dragOffsetX = e.clientX - rect.left;
  dragOffsetY = e.clientY - rect.top;

  // Ensure sticky starts at pixel values
  stickyPad.style.left = rect.left + "px";
  stickyPad.style.top = rect.top + "px";
  stickyPad.style.transform = "none";
  stickyPad.style.position = "absolute";
  stickyPad.style.zIndex = Date.now(); // bring to top
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  stickyPad.style.left = (e.clientX - dragOffsetX) + "px";
  stickyPad.style.top = (e.clientY - dragOffsetY) + "px";
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

// TOUCH EVENTS
navBar.addEventListener("touchstart", (e) => {
  isDragging = true;
  const rect = stickyPad.getBoundingClientRect();
  dragOffsetX = e.touches[0].clientX - rect.left;
  dragOffsetY = e.touches[0].clientY - rect.top;

  stickyPad.style.left = rect.left + "px";
  stickyPad.style.top = rect.top + "px";
  stickyPad.style.transform = "none";
  stickyPad.style.position = "absolute";
  stickyPad.style.zIndex = Date.now();
});

document.addEventListener("touchmove", (e) => {
  if (!isDragging) return;
  stickyPad.style.left = (e.touches[0].clientX - dragOffsetX) + "px";
  stickyPad.style.top = (e.touches[0].clientY - dragOffsetY) + "px";
});

document.addEventListener("touchend", () => {
  isDragging = false;
});

// Remove this line entirely (causes unwanted early mouseup):
// navBar.addEventListener("mouseleave", function() {
//   isStickyDown = false;
// });

   body.appendChild(stickyPad);

  // FIX: force pixel position to avoid % jumpiness
  const rect = stickyPad.getBoundingClientRect();
  stickyPad.style.left = rect.left + "px";
  stickyPad.style.top = rect.top + "px";

  return writingPad;


}

// utility fn to handle handleHamburger icon
let isActive = true;
function handleHamburger() {
  if (isActive == true) {
    hamburger.classList.remove("is-active");
    toolPanel.classList.remove("add-animation");
  } else {
    hamburger.classList.add("is-active");
    toolPanel.classList.add("add-animation");
  }

  isActive = !isActive;
}





// utility fn to handle tool change
let Activetool = "pencil";

const pencilOptions = document.querySelector(".tool-options.pencil");
const eraserOptions = document.querySelector(".tool-options.eraser");
const tools = document.querySelectorAll(".tool");
const inputs = document.querySelectorAll("input[type=range]");
// console.log(tool);
const ImageInput = document.querySelector(".upload-img");
function handleToolChange(tool) {
  if (tool == "pencil") {
    if (Activetool == "pencil") {
      // show options
      pencilOptions.classList.add("show");
    } else {
      Activetool = "pencil";
      eraserOptions.classList.remove("show");
      tools[1].classList.remove("active");
      tools[0].classList.add("active");
      ctx.strokeStyle = "blue";
      ctx.lineWidth = inputs[0].value;
      ctx.globalCompositeOperation = "source-over";
    }
  } else if (tool == "eraser") {
    if (Activetool == "eraser") {
      // show options
      eraserOptions.classList.add("show");
    } else {
      Activetool = "eraser";
      // console.log(tool[1].classList);
      tools[0].classList.remove("active");
      tools[1].classList.add("active");
      pencilOptions.classList.remove("show");
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = inputs[0].value;

      // remove other options
      // set yourself active
      // change style
    }
  } else if (tool == "sticky") {
    createSticky();
  }
}

let undoStack = [];
let redoStack = [];

//***********Undo stack****** */
function undoMaker() {
  if (undoStack.length > 0) {
    const lastStroke = undoStack.pop();
    redoStack.push(lastStroke);
    redraw();
    return true;
  }
  return false;
}

function redoMaker() {
  if (redoStack.length > 0) {
    const stroke = redoStack.pop();
    undoStack.push(stroke);
    redraw();
    return true;
  }
  return false;
}

