const WIDTH = 1920;
const HEIGHT = 940;
const STATE = {
  EMPTY: 'e',
  WALL: 'w',
  START: 's',
  FINISH: 'f',
  PATH: 'p',
  VISITED: 'v'
};
Object.freeze(STATE);
const ALGORITHMS = {
  BFS: 'bfs',
  DFS: 'dfs'
};
Object.freeze(ALGORITHMS);
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

let LMBDown = false;
let RMBDown = false;
let moveStart = false;
let moveFinish = false;
let currentAlgorithm = ALGORITHMS.BFS;
let running = false;

/* Pathfinding Algorithms */

/**
 * Uses BFS algorithm to solve maze.
 * 
 * Returns the path array (if it exists)
 */
async function bfs() {
  const queue = [];
  const parent = new Map();
  let neighbours = [];
  let node = {
    row: startNode.row,
    col: startNode.col
  };
  queue.push(node);
  while (queue.length > 0) {
    node = queue.shift();
    if (nodes[node.row][node.col].state != STATE.START && nodes[node.row][node.col].state != STATE.FINISH) {
      nodes[node.row][node.col].state = STATE.VISITED;
    }
    if(node.row == finishNode.row && node.col == finishNode.col){
      drawPath(parent);
      return;
    } else {
      neighbours = findNeighbours(node);
      neighbours.forEach(newNode => {
        if(!parent.has(`${newNode.row},${newNode.col}`) && nodes[newNode.row][newNode.col].state != STATE.WALL){
          queue.push(newNode);
          parent.set(`${newNode.row},${newNode.col}`, node);

          
        }
      });
    }
    await sleep(2);
  }

  return -1;
}

function findNeighbours(curNode) {
  const neighbours = [];
  const nodeOffset = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  
  nodeOffset.forEach(offset => {
    let newNode = {
      row: curNode.row + offset[0],
      col: curNode.col + offset[1],
    }
    // check that offset node is in bounds
    if (newNode.row >= 0 && newNode.row < num_rows && newNode.col >= 0 && newNode.col < num_cols) {
        neighbours.push(newNode);
    }
  });
  return neighbours;
}

/**
 * Draws a rectangle on the canvas
 * @param {*} x 
 * @param {*} y 
 * @param {*} width 
 * @param {*} height 
 * @param {*} state 
 * @param {*} colour
 */
function drawRect(x, y, width, height, state, colour = null) {
  if(colour){
    ctx.fillStyle = colour;
  } else {
    if (state == STATE.START)
    ctx.fillStyle = "#3DD633";
    else if (state == STATE.FINISH)
      ctx.fillStyle = "#CC33D6";
    else if (state == STATE.WALL)
      ctx.fillStyle = "navy";
    else if (state == STATE.PATH)
      ctx.fillStyle = "#D6D627";
    else if (state == STATE.VISITED)
      ctx.fillStyle = "#2A867B";
    else
      ctx.fillStyle = "#CACACA";
  }

  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.closePath();
  ctx.fill();
}

/**
 * Creates a 2d grid of nodes and stores them
 * in the global nodes[] array
 */
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

function drawGrid(){
  clear();
  for(row = 0; row < num_rows; row++){
    for(col = 0; col < num_cols; col++){
      cell = nodes[row][col];
      drawRect(cell.x, cell.y, rectWidth, rectHeight, cell.state);
    }
  }
}

/* Helper Functions */
function clear() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

function sleep(ms){
  return new Promise(r => setTimeout(r, ms));
}

function getX(e){
  return e.clientX - canvas.getBoundingClientRect().left;
}

function getY(e){
  return e.clientY - canvas.getBoundingClientRect().top;
}

function getCol(x){
  return parseInt((x - (x / rectHeight)) / rectHeight); // 2nd term's numerator changes based on the constant value that separates cells in createGrid()
}

function getRow(y){
  return parseInt((y - (y / rectWidth)) / rectWidth); // 2nd term's numerator changes based on the constant value that separates cells in createGrid()
}

function resetVisitedNodes(){
  for(let row = 0; row < nodes.length; row++){
    nodes[row].forEach(node => {
      if(node.state == STATE.VISITED)
        node.state = STATE.EMPTY;
    });
  }
}
/**
 * Given an array of {row, col} tuples, this function will
 * change the state of each node to STATE.PATH
 * @param {} parent
 * @param {} timer 
 */
async function drawPath(parent){
  clearPath();
  let path = [finishNode];
  let endNode = path[path.length - 1];
  //console.log(`endNode row: ${endNode.row} col: ${endNode.col}`);
  while(!(endNode.row == startNode.row && endNode.col == startNode.col)) {
    endNode = parent.get(`${endNode.row},${endNode.col}`);
    //console.log(`endNode row: ${endNode.row} col: ${endNode.col}`);
    path.push(endNode);
  }
  console.log('done');
  for(let i = path.length - 1; i >= 0; i--) {
    let node = path[i];
    let curNode = nodes[node.row][node.col];
    if(curNode.state != STATE.START && curNode.state != STATE.FINISH){
      curNode.state = STATE.PATH;
      await sleep(20);
    }
  }
  return;
}

/* Button Eventlisteners */

function removeDiv() {
  let div = document.getElementById('tutorial');
  div.parentNode.removeChild(div);
  return false;
}

/**
 * Calls the appropriate search algorithm to
 * solve the maze
 */
async function search() {
  if(!running){
    let result = 0;
    running = true;
    //resetVisitedNodes();
    if(currentAlgorithm == ALGORITHMS.BFS)
      result = await bfs();
    
    if(result == -1)
      alert('A path could not be found!');
    running = false;
  }
}

/**
 * Clears everything except for start and end nodes
 */
function clearPath(){
  if(!running){
    for(let row = 0; row < nodes.length; row++){
      nodes[row].forEach(node => {
        if(node.state == STATE.PATH)
          node.state = STATE.EMPTY;
      });
    }
  }
}

/**
 * Changes state of empty nodes to wall nodes
 * on left-click
 * @param {*} e 
 */
function createWall(e){
  let col = getCol(getX(e));
  let row = getRow(getY(e));
  let cell = nodes[row][col];
  if(cell.state != STATE.START && cell.state != STATE.FINISH){
    cell.state = STATE.WALL;
  }
}
/**
 * Changes state of wall nodes to empty nodes
 * on right-click
 * @param {*} e 
 */
function deleteWall(e){
  let col = getCol(getX(e));
  let row = getRow(getY(e));
  let cell = nodes[row][col];
  if(cell.state == STATE.WALL) {
    cell.state = STATE.EMPTY;
  }
}

/**
 * Sets all wall nodes in nodes[][] to STATE.EMPTY
 * @param {*} e 
 */
function clearWalls() {
  if(!running){
    for(let row = 0; row < nodes.length; row++){
      nodes[row].forEach(node => {
        if(node.state == STATE.WALL)
          node.state = STATE.EMPTY;
      });
    }
  }
}

/**
 * Moves the start node when dragged
 * @param {*} e 
 */
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

/**
 * Moves the finish node when dragged
 * @param {*} e 
 */
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



/* Canvas Eventlisteners */
canvas.onmouseup = function(e) {
  LMBDown = false;
  RMBDown = false;
  moveStart = false;
  moveFinish = false;
}

canvas.onmousedown = function(e) {
  if(running)
    return;
  if(e.button == 0) { // left click
    LMBDown = true;
  } else if (e.button == 2) { //right click
    RMBDown = true;
  }
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
    } else if (e.button == 2){
      deleteWall(e);
    }
  }
}

/**
 * Recalls the appropriate functions depending on the
 * status of the mouse and which buttons were pressed
 * @param {} e 
 */
canvas.onmousemove = function(e) {
  if (LMBDown) {
    if (moveStart) {
      moveStartNode(e);
    } else if (moveFinish) {
      moveFinishNode(e);
    } else {
      createWall(e);
    }
  } else if (RMBDown) {
    deleteWall(e)
  }
}

window.onload=function init() {
  // Creating button event listeners
  let algorithmText = document.getElementById('algorithm-text');
  // Close tutorial
  let btn = document.getElementById('tutorialBtn');
  if(btn) btn.addEventListener('click', removeDiv, false);
  // Clear walls
  btn = document.getElementById('clrWallBtn');
  if(btn) btn.addEventListener('click', clearWalls, false);
  // Clear path
  btn = document.getElementById('clrPathBtn');
  if(btn) btn.addEventListener('click', clearPath, false);
  // Start search algorithm 
  btn = document.getElementById('startBtn');
  if(btn) btn.addEventListener('click', search, false);
  // Select BFS algorithm
  btn = document.getElementById('bfs');
  if(btn) btn.addEventListener('click', () => {currentAlgorithm = ALGORITHMS.BFS; algorithmText.textContent = "Breadth-First Search"}, false);
  // Select DFS algorithm
  btn = document.getElementById('dfs');
  if(btn) btn.addEventListener('click', () => {currentAlgorithm = ALGORITHMS.DFS; algorithmText.textContent = "Depth-First Search"}, false);
  

  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  createGrid();
  setInterval(drawGrid, 10);

  return;
}

