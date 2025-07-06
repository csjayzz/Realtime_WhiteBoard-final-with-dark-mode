let isMouseDown = false;
let currentStroke = [];
let lastEmit = 0;
const throttleDelay = 10;

board.addEventListener("mousedown", function (e) {
  isMouseDown = true;
  currentStroke = [];

  let top = getLocation();
  const point = {
    x: e.clientX,
    y: e.clientY - top,
    identifier: "mousedown",
    color: ctx.strokeStyle,
    width: ctx.lineWidth
  };

  ctx.beginPath();
  ctx.moveTo(point.x, point.y);
  currentStroke.push(point);
  socket.emit("mousedown", point);
});

board.addEventListener("mousemove", function (e) {
  if (!isMouseDown) return;

  const now = Date.now();
  if (now - lastEmit < throttleDelay) return;
  lastEmit = now;

  let top = getLocation();
  const point = {
    x: e.clientX,
    y: e.clientY - top,
    identifier: "mousemove",
    color: ctx.strokeStyle,
    width: ctx.lineWidth
  };

  ctx.lineTo(point.x, point.y);
  ctx.stroke();
  currentStroke.push(point);
  socket.emit("mousemove", point);
});

board.addEventListener("mouseup", function () {
  isMouseDown = false;
  if (currentStroke.length > 1) {
    undoStack.push([...currentStroke]); // push stroke after it's complete
    redoStack = []; // clear redo on new stroke

    socket.emit("mouseup", currentStroke); // send entire stroke to other users

  }
});

// ------------------- TOUCH SUPPORT -------------------

board.addEventListener("touchstart", function (e) {
  e.preventDefault();
  isMouseDown = true;
  currentStroke = [];

  const touch = e.touches[0];
  let top = getLocation();

  const point = {
    x: touch.clientX,
    y: touch.clientY - top,
    identifier: "mousedown",
    color: ctx.strokeStyle,
    width: ctx.lineWidth
  };

  ctx.beginPath();
  ctx.moveTo(point.x, point.y);
  currentStroke.push(point);
  socket.emit("mousedown", point);
});

board.addEventListener("touchmove", function (e) {
  if (!isMouseDown) return;
  e.preventDefault();

  const now = Date.now();
  if (now - lastEmit < throttleDelay) return;
  lastEmit = now;

  const touch = e.touches[0];
  let top = getLocation();

  const point = {
    x: touch.clientX,
    y: touch.clientY - top,
    identifier: "mousemove",
    color: ctx.strokeStyle,
    width: ctx.lineWidth
  };

  ctx.lineTo(point.x, point.y);
  ctx.stroke();
  currentStroke.push(point);
  socket.emit("mousemove", point);
});

board.addEventListener("touchend", function (e) {
  isMouseDown = false;
  if (currentStroke.length > 1) {
    undoStack.push([...currentStroke]);
    redoStack = [];
    socket.emit("mouseup", currentStroke);
  }
});


const undo = document.querySelector(".undo");
const redo = document.querySelector(".redo");

undo.addEventListener("click", function () {
  if (undoMaker()) socket.emit("undo");
});
redo.addEventListener("click", function () {
  if (redoMaker()) socket.emit("redo");
});

function redraw() {
  ctx.clearRect(0, 0, board.width, board.height);

  for (let stroke of undoStack) {
    if (!Array.isArray(stroke)) continue;
    for (let i = 0; i < stroke.length; i++) {
      const point = stroke[i];
      ctx.strokeStyle = point.color;
      ctx.lineWidth = point.width;
      if (point.identifier === "mousedown") {
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
      } else if (point.identifier === "mousemove") {
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      }
    }
  }
}

function getLocation() {
  const { top } = board.getBoundingClientRect();
  return top;
}
