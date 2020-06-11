const WIDTH = 1920;
const HEIGHT = 940;
const STATE = {
  EMPTY: 'e',
  WALL: 'w',
  START: 's',
  FINISH: 'f',
};
Object.freeze(STATE);
const rectWidth = 25;
const rectHeight = 25;
const num_rows = 40;
const num_cols = 80;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const nodes = [];
const startNode = {
  row: 14,
  col: 7
};
const finishNode = {
  row: 14,
  col: 50
};
let mouseDown = false;
let moveStart = false;
let moveFinish = false;

function drawRect(x, y, width, height, state){
  if(state == STATE.START)
    ctx.fillStyle = "green";
  else if(state == STATE.FINISH)
    ctx.fillStyle = "red";
  else if(state == STATE.WALL)
    ctx.fillStyle = "navy";
  else
    ctx.fillStyle = "gray";

  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.closePath();
  ctx.fill();
}

function createGrid() {
  for(let row = 0; row < num_rows; row++) {
    nodes[row] = [];
    for(let col = 0; col < num_cols; col++) {
      nodes[row][col] = {
        x: col *(rectWidth + 1),
        y: row * (rectHeight + 1),
        state: STATE.EMPTY,
        prevState: STATE.EMPTY // used for when the start/end nodes are being moved
      };
    }
  }
  nodes[startNode.row][startNode.col].state = STATE.START;
  nodes[finishNode.row][finishNode.col].state = STATE.FINISH;
}

function clear() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

function drawGrid(){
  clear();

  for(row = 0; row < num_rows; row++){
    for(col = 0; col < num_cols; col++){
      cell = nodes[row][col];
      drawRect(cell.x, cell.y, rectWidth, rectHeight, cell.state);
    }
  }
}

function getX(e){
  return e.clientX - canvas.getBoundingClientRect().left;
}

function getY(e){
  return e.clientY - canvas.getBoundingClientRect().top;
}

function getCol(x){
  return parseInt((x - (x / rectHeight)) / rectHeight); // 2nd term's numerator changes based on the constant value that separates cells
}

function getRow(y){
  return parseInt((y - (y / rectWidth)) / rectWidth); // 2nd term's numerator changes based on the constant value that separates cells
}

function createWall(e){
  let col = getCol(getX(e));
  let row = getRow(getY(e));
  let cell = nodes[row][col];
  if(cell.state != STATE.START && cell.state != STATE.FINISH){
    cell.state = STATE.WALL;
  }
}

function deleteWall(e){
  let col = getCol(getX(e));
  let row = getRow(getY(e));
  let cell = nodes[row][col];
  if(cell.state != STATE.START && cell.state != STATE.FINISH){
    cell.state = STATE.EMPTY;
  }
}

function moveStartNode(e){
  let col = getCol(getX(e));
  let row = getRow(getY(e));
  let cell = nodes[startNode.row][startNode.col];
    cell.state = cell.prevState;
    cell.prevState = STATE.START;

    startNode.row = row;
    startNode.col = col;


    cell = nodes[startNode.row][startNode.col];
    cell.prevState = cell.state;
    cell.state = STATE.START;
  
}

function moveFinishNode(e){
  let col = getCol(getX(e));
  let row = getRow(getY(e));
  let cell = nodes[finishNode.row][finishNode.col];
  cell.state = cell.prevState;
  cell.prevState = STATE.FINISH;

  finishNode.row = row;
  finishNode.col = col;

  cell = nodes[finishNode.row][finishNode.col];
  cell.prevState = cell.state;
  cell.state = STATE.FINISH
}

canvas.onmousedown = function(e) {
  mouseDown = true;
  let col = getCol(getX(e));
  let row = getRow(getY(e));
  console.log(`row: ${row} col: ${col} state: ${nodes[row][col].state} prevState: ${nodes[row][col].prevState}`);
  if(nodes[row][col].state == STATE.START){
    moveStart = true;
    //moveStartNode(e);
  } else if (nodes[row][col].state == STATE.FINISH) {
    moveFinish = true;
  } else {
    if (e.button == 0){
      createWall(e);
    }

  }
}

canvas.onmouseup = function(e) {
  mouseDown = false;
  moveStart = false;
  moveFinish = false;
}

canvas.onmousemove = function(e) {
  if (mouseDown) {
    if (moveStart) {
      moveStartNode(e);
    } else if (moveFinish) {
      moveFinishNode(e);
    } else {
      createWall(e);
    }
  }
}

function init(){
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  createGrid();
  setInterval(drawGrid, 10);
  return;
}

init();