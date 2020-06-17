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
  DFS: 'dfs',
  GREEDY: 'greedy',
  ASTAR: 'astar'
};
Object.freeze(ALGORITHMS);
const rectWidth = 25;
const rectHeight = 25;
const num_rows = Math.floor((screen.height - 70)/rectWidth);
const num_cols = Math.floor(screen.width/rectHeight) - 1;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const nodes = [];
const startNode = {
  row: 14,
  col: 7
};
const finishNode = {
  row: 14,
  col: num_cols-7
};
const startBtn = document.getElementById('startBtn');

let LMBDown = false;
let RMBDown = false;
let moveStart = false;
let moveFinish = false;
let currentAlgorithm = ALGORITHMS.BFS;
let running = false;
let speed = 1; // sleep time in ms between each iteration in algos

/* Pathfinding Algorithms */
async function astar(){
  const frontier = [];
  const parent = new Map();
  let neighbours = [];
  let node = {
    row: startNode.row,
    col: startNode.col,
    heuristic: manhattan(startNode.row, startNode.col),
    cost: 0
  };
  
  frontier.push(node);
  while (frontier.length > 0 && running) {
    node = frontier.shift();
    // if node is not start/end node, mark as visited
    if (nodes[node.row][node.col].state != STATE.START && nodes[node.row][node.col].state != STATE.FINISH) {
      nodes[node.row][node.col].state = STATE.VISITED;
    }
    // if found, draw its path and return
    if(node.row == finishNode.row && node.col == finishNode.col){
      await drawPath(parent);
      return;
    } else {
      neighbours = findNeighbours(node);
      neighbours.forEach(newNode => {
        // check if node already exists in frontier
        let found = -1;
        for(let i = 0; i < frontier.length; i++) {
          if (frontier[i].row == newNode.row && frontier[i].col == newNode.col) {
            found = i;
            break;
          }
        }

        // if not in frontier / visited nodes, add it
        newNode.cost = node.cost + 1;
        newNode.heuristic = manhattan(newNode.row, newNode.col) + newNode.cost;
        if(found == -1 && !parent.has(`${newNode.row},${newNode.col}`)){
          frontier.push(newNode);
          parent.set(`${newNode.row},${newNode.col}`, node);
        } else if (found >= 0) { // decrease key otherwise
          if (newNode.heuristic < frontier[found].heuristic) {
            parent.set(`${newNode.row},${newNode.col}`, node);
            frontier[found] = newNode;
          }
        }
      });
      frontier.sort((a, b) => a.heuristic - b.heuristic);
    }
    await sleep(speed);
  }

  if (running)
    return -1;
  else
    return -2;
}

async function greedy(){
  const frontier = [];
  const parent = new Map();
  let neighbours = [];
  let node = {
    row: startNode.row,
    col: startNode.col,
    heuristic: manhattan(startNode.row, startNode.col)
  };
  
  frontier.push(node);
  while (frontier.length > 0 && running) {
    node = frontier.shift();
    // if node is not start/end node, mark as visited
    if (nodes[node.row][node.col].state != STATE.START && nodes[node.row][node.col].state != STATE.FINISH) {
      nodes[node.row][node.col].state = STATE.VISITED;
    }
    // if found, draw its path and return
    if(node.row == finishNode.row && node.col == finishNode.col){
      await drawPath(parent);
      return;
    } else {
      neighbours = findNeighbours(node);
      neighbours.forEach(newNode => {
        // check if node already exists in frontier
        let found = -1;
        for(let i = 0; i < frontier.length; i++) {
          if (frontier[i].row == newNode.row && frontier[i].col == newNode.col) {
            found = i;
            break;
          }
        }

        newNode.heuristic = manhattan(newNode.row, newNode.col);
        // if not in frontier / visited nodes, add it
        if(found == -1 && !parent.has(`${newNode.row},${newNode.col}`)){
          frontier.push(newNode);
          parent.set(`${newNode.row},${newNode.col}`, node);
        } else if (found >= 0) { // decrease key otherwise
          if (newNode.heuristic < frontier[found].heuristic) {
            parent.set(`${newNode.row},${newNode.col}`, node);
            frontier[found] = newNode;
          }
        }
      });
      frontier.sort((a, b) => a.heuristic - b.heuristic);
    }
    await sleep(speed);
  }

  if (running)
    return -1;
  else
    return -2;
}

function manhattan(row, col) {
  return Math.abs(row - finishNode.row) + Math.abs(col - finishNode.col);
}

async function dfs() {
  const stack = [];
  const parent = new Map();
  let neighbours = [];
  let node = {
    row: startNode.row,
    col: startNode.col
  };
  stack.push(node);
  while (stack.length > 0 && running) {
    node = stack.pop();
    if (nodes[node.row][node.col].state != STATE.START && nodes[node.row][node.col].state != STATE.FINISH) {
      nodes[node.row][node.col].state = STATE.VISITED;
    }
    if(node.row == finishNode.row && node.col == finishNode.col){
      await drawPath(parent);
      return;
    } else {
      neighbours = findNeighbours(node);
      neighbours.forEach(newNode => {
        if(!parent.has(`${newNode.row},${newNode.col}`)){
          stack.push(newNode);
          parent.set(`${newNode.row},${newNode.col}`, node);
        }
      });
    }
    await sleep(speed);
  }

  if (running)
    return -1;
  else
    return -2;
}

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
  while (queue.length > 0 && running) {
    node = queue.shift();
    if (nodes[node.row][node.col].state != STATE.START && nodes[node.row][node.col].state != STATE.FINISH) {
      nodes[node.row][node.col].state = STATE.VISITED;
    }
    if(node.row == finishNode.row && node.col == finishNode.col){
      await drawPath(parent);
      return;
    } else {
      neighbours = findNeighbours(node);
      neighbours.forEach(newNode => {
        if(!parent.has(`${newNode.row},${newNode.col}`)){
          queue.push(newNode);
          parent.set(`${newNode.row},${newNode.col}`, node);
        }
      });
    }
    await sleep(speed);
  }
  if (running)
    return -1;
  else
    return -2;
}

function findNeighbours(curNode) {
  const neighbours = [];
  // diagonal: [1, 1], [1, -1], [-1, -1], [-1, 1]
  const nodeOffset = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  
  nodeOffset.forEach(offset => {
    let newNode = {
      row: curNode.row + offset[0],
      col: curNode.col + offset[1],
    }
    // check that offset node is in bounds and not a wall
    if (newNode.row >= 0 && newNode.row < num_rows && newNode.col >= 0 && newNode.col < num_cols) {
      if (nodes[newNode.row][newNode.col].state != STATE.WALL)
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
    clearPath();
    let result = 0;
    running = true;
    startBtn.textContent = 'Cancel';
    startBtn.classList.toggle('btn', 'btn-danger');
    if (currentAlgorithm == ALGORITHMS.BFS)
      result = await bfs();
    else if (currentAlgorithm == ALGORITHMS.DFS)
      result = await dfs();
    else if (currentAlgorithm == ALGORITHMS.GREEDY)
      result = await greedy();
    else if (currentAlgorithm == ALGORITHMS.ASTAR)
      result = await astar();

    if(result == -1)
      alert('A path could not be found!');

    running = false;
    startBtn.textContent = 'Find Path';
  } else {
    running = false;
    startBtn.textContent = 'Find Path';
    //startBtn.classList.toggle('btn', 'btn-success');
  }
}

/**
 * Clears everything except for start and end nodes
 */
function clearPath(){
  if(!running){

    for(let row = 0; row < nodes.length; row++){
      nodes[row].forEach(node => {
        if(node.state == STATE.PATH || node.state == STATE.VISITED)
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
  // Set speed
  btn = document.getElementById('speed');
  if(btn) btn.addEventListener('input', () => speed = document.getElementById('speed').value);
  // Start search algorithm
  if(startBtn) {
    // not working
    //startBtn.classList.add('btn' ,'btn-danger');
    //startBtn.classList.add('btn', 'btn-success');
    startBtn.addEventListener('click', search, false);

  }
  // Select BFS algorithm
  btn = document.getElementById('bfs');
  if(btn) btn.addEventListener('click', () => {currentAlgorithm = ALGORITHMS.BFS; algorithmText.textContent = "Breadth-First Search"}, false);
  // Select DFS algorithm
  btn = document.getElementById('dfs');
  if(btn) btn.addEventListener('click', () => {currentAlgorithm = ALGORITHMS.DFS; algorithmText.textContent = "Depth-First Search"}, false);
  // Select Greedy Best-First Search algorithm
  btn = document.getElementById('greedy');
  if(btn) btn.addEventListener('click', () => {currentAlgorithm = ALGORITHMS.GREEDY; algorithmText.textContent = "Greedy Best-First Search"}, false);
  // Select A* Search algorithm
  btn = document.getElementById('astar');
  if(btn) btn.addEventListener('click', () => {currentAlgorithm = ALGORITHMS.ASTAR; algorithmText.textContent = "A* Search"}, false);
  
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  createGrid();
  setInterval(drawGrid, 10);

  return;
}

