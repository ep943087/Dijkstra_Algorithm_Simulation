import {Transformations, getCircle, getAngle} from '../transformations/transforms.js';

class Node{
  constructor(position, name){
    this.position = position;
    this.name = name;
    this.neighbors = [];
    this.previous = null;
    this.distance = Infinity;
  }
  setForAlgorithm(){
    this.previous = null;
    this.distance = Infinity;
  }
  includes(node){
    return this.neighbors.some(node2=>node2 === node);
  }
  removeNeighbor(node){
    this.neighbors = this.neighbors.filter(node2=>node2 !== node);
  }
  clearNeighbors(){
    this.neighbors = [];
  }
}

export class Dijkstra_Algo{
  constructor(c){
    this.nodeRadius = 15;
    this.c = c;
    this.ctx = c.getContext('2d');
    this.transforms = new Transformations(c);
    this.transforms.setIsStatic(true);
    this.delay = null;
    this.setButtons();
    this.setConnectionTypesButtons();
    this.setSimulationButtons();
    this.reset();
    this.addEvents();
  }

  // MOUSE EVENTS
  addEvents(){
    this.c.addEventListener('mousedown',(e)=>{
      switch(this.state){
        case 'add-connection':
          this.addConnectionMouseDown(e);
          break;
        case 'move-node':
          this.moveNodeMouseDown(e);
          break;
      }
    });
    this.c.addEventListener('mousemove',(e)=>{
      switch(this.state){
        case 'add-connection':
          this.addConnectionMouseMove(e);
          break;
        case 'move-node':
          this.moveNodeMouseMove(e);
          break;
      }
    })
    this.c.addEventListener('mouseup',(e)=>{
      switch(this.state){
        case 'add-connection':
          this.addConnectionMouseUp(e);
          break;
        case 'move-node':
          this.moveNodeMouseUp(e);
          break;
      }
    })
    this.c.addEventListener('click',(e)=>{
      switch(this.state){
        case 'add-node':
          this.addNode(e);
          break;
        case 'delete-node':
          this.deleteNode(e);
          break;
        case 'choosing-start-node':
          this.chooseStartNode(e);
          break;
      }
    });
    document.addEventListener('keydown',(e)=>{
      switch(e.key){
        case 'f':
          this.setOnePath();
          break;
        case 's':
          this.chooseStartNode(this.transforms.camera, true);
          break;
      }
    });
  }

  // DISTANCE BETWEEN TWO POINTS
  distance(p1,p2){
    return Math.sqrt((p1.x-p2.x)**2 + (p1.y-p2.y)**2);
  }

  // FIND NODE IN LIST OF NODES
  searchNode(point){
    for(const node of this.nodes){
      const dist = this.distance(node.position, point);
      if(dist < this.nodeRadius)
        return node;
    }
    return null;
  }

  // MOVE NODE
  moveNodeMouseDown(e){
    const m = this.transforms.getMousePos(e);
    const world_m = this.transforms.screenToWorld(m);
    this.currentNode = this.searchNode(world_m);
  }
  moveNodeMouseMove(e){
    if(this.currentNode === null) return;
    const m = this.transforms.getMousePos(e);
    const world_m = this.transforms.screenToWorld(m);
    this.currentNode.position = world_m;
  }
  moveNodeMouseUp(e){
    this.currentNode = null;
  }

  // DELETE NODE
  deleteNode(e){
    const m = this.transforms.getMousePos(e);
    const world_m = this.transforms.screenToWorld(m);
    this.currentNode = this.searchNode(world_m);
    if(this.currentNode === null) return;
    this.currentNode.neighbors.forEach(neighbor=>{
      neighbor.removeNeighbor(this.currentNode);
    });
    this.nodes = this.nodes.filter(node=>node !== this.currentNode);
    this.currentNode = null;
  }

  // ADD CONNECTION
  addNodeConnection(node1,node2){
    if(node1.includes(node2) || node2.includes(node1)) return console.log('already connected');
    node1.neighbors.push(node2);
    node2.neighbors.push(node1);
  }
  addConnectionMouseDown(e){
    const m = this.transforms.getMousePos(e);
    const world_m = this.transforms.screenToWorld(m);
    this.currentNode = this.searchNode(world_m);
  }
  addConnectionMouseMove(e){
    if(this.currentNode === null) return;
    const m = this.transforms.getMousePos(e);
    const world_m = this.transforms.screenToWorld(m);
    this.currentNode2 = this.searchNode(world_m);
    if(this.currentNode === this.currentNode2)
      this.currentNode2 = null;
  }
  addConnectionMouseUp(e){
    if(this.currentNode !== null && this.currentNode2 !== null){
      this.addNodeConnection(this.currentNode, this.currentNode2);
    }
    this.currentNode = null;
    this.currentNode2 = null;
  }

  // ADD NODE
  addNode(e){
      const m = this.transforms.getMousePos(e);
      const world_m = this.transforms.screenToWorld(m);
      const node = new Node(world_m, "A");
      this.nodes.push(node);
  }
  addNodePoint(point){
      const node = new Node(point, "A");
      this.nodes.push(node);
  }

  setSelects(){
    const selects = ['select-delay'];
    for(const select of selects){

    }
  }

  /*************************
   * CONNECTION TYPES
   *************************/
  // INITIALIZE CONNECTION TYPES BUTTONS
  setConnectionTypesButtons(){
    const buttons = ['random-nodes', 'connection-close', 'clear-connections','clear-nodes'];
    buttons.forEach(name=>{
      const button = document.querySelector('.'+name);
      switch(name){
        case 'clear-nodes':
          button.addEventListener('click',()=>this.clearNodes());
          break;
        case 'clear-connections':
          button.addEventListener('click',()=>this.clearConnections());
          break;
        case 'connection-close':
          button.addEventListener('click',()=>this.connectionsClose());
          break;
        case 'random-nodes':
          button.addEventListener('click',()=>this.randomNodes());
          break;
      }
    });
  }

  // CLEAR NODES
  clearNodes(){
    this.stopAllSimulationStuff();
    this.nodes = [];
  }

  // RANDOM NODES
  randomNodes(){
    this.stopAllSimulationStuff();
    this.clearNodes();
    for(let i=0;i<17;i++){
      const x = this.c.width * Math.random();
      const y = this.c.height * Math.random();
      this.addNodePoint({x,y});
    }

  }
  // CLEAR CONNECTIONS
  clearConnections(){
    this.stopAllSimulationStuff();
    this.nodes.forEach(node=>node.clearNeighbors());
  }

  // CONNECTION CLOSE
  connectionsClose(){
    this.stopAllSimulationStuff();
    this.clearConnections();
    const distance = 200;
    for(let i=0;i<this.nodes.length;i++){
      for(let j=i+1;j<this.nodes.length;j++){
        const dist = this.distance(this.nodes[i].position, this.nodes[j].position);
        if(dist < distance){
          this.addNodeConnection(this.nodes[i], this.nodes[j]);
        }
      }
    }
  }

  // INITIALIZE
  reset(){
    this.onePathSet = false;
    this.onePath = [];
    this.onePathNode = null;
    this.finishedSim = false;
    this.currentNode = null;
    this.currentNode2 = null;
    this.startingNode = null;
    this.nodes = [];
    this.runningSim = false;
    this.setState('add-node');
    this.setButtonActive(this.state);
  }
  setButtons(){
    const buttonNames = ['delete-node', 'move-around','move-node','add-node','add-connection'];
    this.buttons = [];
    buttonNames.forEach(name=>{
      this.buttons[name] = document.querySelector('.'+name);
      this.buttons[name].addEventListener('click',(e)=>{
        this.setState(name);
      });
    });
  }
  stopAllSimulationStuff(){
    this.nodes.forEach(node=>node.setForAlgorithm());
    this.pivot = this.startingNode = null;
    this.finishedSim = false;
    this.unvisited = [];
    this.visited = [];
    this.runningSim = false;
    this.onePath = [];
    this.onePathSet = false;
    this.onePathNode = false;
  }
  setState(name){
    this.state = name;
    if(name === "move-around"){
      this.transforms.setIsStatic(false);
    } else{
      this.stopAllSimulationStuff();
      this.transforms.setIsStatic(true);
    }
    this.setButtonActive(name);
  }
  listIncludes(list,item){
    for(const items of list){
      if(items === item)
        return true;
    }
    return false;
  }
  // SET BUTTONS CLASS TO ACTIVE
  setButtonActive(name){
    for(const key in this.buttons){
      this.buttons[key].classList.remove('active');
      if(key === name)
        this.buttons[key].classList.add('active');
    }
  }

  /***********
   * SIMULATION STUFF
   ************/

  // INITIALIZE SIMULATION BUTTONS
  setSimulationButtons(){
    const buttonNames = ['start','stop'];
    buttonNames.forEach(name=>{
      const button = document.querySelector('.'+name);
      switch(name){
        case 'start':
          button.addEventListener('click',()=>this.startSimulation());
          break;
        case 'stop':
          button.addEventListener('click',()=>this.stopSimulation());
          break;
      }
    })
  }

  // START SIMULATION
  startSimulation(){
    this.setState('choosing-start-node');
  }

  chooseStartNode(e, isPoint){
    if(!isPoint){
      const m = this.transforms.getMousePos(e);
      const world_m = this.transforms.screenToWorld(m);
      this.startingNode = this.searchNode(world_m);
    } else{
      this.startingNode = this.searchNode(e);
    }
    if(this.startingNode === null) {
      return this.stopAllSimulationStuff();
    };
    this.runningSim = true;
    this.nodes.forEach(node=>node.setForAlgorithm());
    this.pivot = this.startingNode;
    this.pivot.distance = 0;
    this.visited = [];
    this.notvisited = [...this.nodes];
    this.onePath = null;
    this.onePathSet = false;
    this.onePathNode = null;
    this.setState('move-around');
    this.finishedSim = false;
    const select = document.querySelector('.select-delay');
    const selectValue = parseInt(select.value);
    this.delay = selectValue === selectValue? selectValue : null;
    if(this.delay !== null){
      this.runningSim = false;
      setTimeout(()=>this.runningSim = true, this.delay);
    } else{
      this.runningSim = true;
      while(this.runningSim){
        this.startDijkstraAlgo();
      }
    }
  }
  startDijkstraAlgo(){
    if(!this.runningSim || this.pivot === null) return;
    if(this.notvisited.length === 0){
      this.pivot = null;
      this.visited = [];
      return;
    }
    for(const neighbor of this.pivot.neighbors){
      let unvisited = true;
      for(let i=0;i<this.visited.length;i++){
        if(this.visited[i] === neighbor){
          unvisited = false;
          break;
        }
      }
      if(!unvisited) continue;
      const distance = this.distance(this.pivot.position, neighbor.position);
      const newDistance = distance + this.pivot.distance;
      if(newDistance < neighbor.distance){
        neighbor.distance = newDistance;
        neighbor.previous = this.pivot;
      }
    }
    this.notvisited = this.notvisited.filter(node=>node !== this.pivot);
    this.visited.push(this.pivot);

    if(this.notvisited.length === 0){
      this.finishedSim = true;
      this.runningSim = false;
      this.visited = [];
      return this.pivot = null;
    }

    this.pivot = this.notvisited[0];
    for(const node of this.notvisited){
      if(node.distance < this.pivot.distance)
        this.pivot = node;
    }
    if(this.delay !== null){
      this.runningSim = false;
      setTimeout(()=>this.runningSim = true, this.delay);
    }
  }

  // SET PATH FIND ONE NODE
  setOnePath(){
    if(!this.finishedSim) return;
    let node = this.searchNode(this.transforms.camera);
    if(node === null || node === this.onePathNode){
      this.onePath = [];
      this.onePathNode = null;
      this.onePathSet = false;
      return;
    }

    this.onePath = [];
    this.onePathNode = node;
    this.onePathSet = true;

    while(node !== null){
      this.onePath.push(node);
      node = node.previous;
    }
  }
  stopSimulation(){
    this.setState('move-around');
    this.runningSim = false;
  }

  // DRAWING LOGIC BELOW
  drawConnections = (node) => {
    node.neighbors.forEach(node2=>{
      const line = [node.position, node2.position];
      this.transforms.drawLine(line,'black');
    });
  }

  drawPrevious = (node) => {
    if(node.previous !== null){
      const angle = getAngle(node.position, node.previous.position);
      const initPoint = {
        x: node.position.x + this.nodeRadius*Math.cos(angle),
        y: node.position.y + this.nodeRadius*Math.sin(angle),
      };
      const point1 = {
        x: initPoint.x + this.nodeRadius*Math.cos(angle - Math.PI/4),
        y: initPoint.y + this.nodeRadius*Math.sin(angle - Math.PI/4),
      }
      const point2 = {
        x: initPoint.x + this.nodeRadius*Math.cos(angle + Math.PI/4),
        y: initPoint.y + this.nodeRadius*Math.sin(angle + Math.PI/4),
      }
      const arrow = [point1, initPoint, point2];
      this.transforms.drawLine(arrow, 'rgba(0,255,0)',3);
      const line = [node.previous.position, node.position];
      this.transforms.drawLine(line,'rgba(0,255,0)',3);
    }
  }

  drawNode = (node) => {
    const circle = getCircle(node.position.x,node.position.y,this.nodeRadius);
    let color = node === this.currentNode || node === this.currentNode2? "blue" : "white";
    if(node === this.pivot) color = "blue";
    if(node !== this.startingPivot && this.listIncludes(this.visited, node)) color = "red";
    if(node === this.startingNode) color = "rgba(0,255,0)";
    this.transforms.drawShape(circle,color,1);
  }

  drawNodes(){
    this.nodes.forEach(this.drawConnections);

    if(this.onePathSet)
      this.onePath.forEach(this.drawPrevious);
    else
      this.nodes.forEach(this.drawPrevious);

    this.nodes.forEach(this.drawNode);

    if(this.state === 'choosing-start-node'){
      this.ctx.fillStyle = "black";
      this.ctx.font = "30px Arial";
      this.ctx.textBaseline = "top";
      this.ctx.textAlign = "left";
      this.ctx.fillText('Click on the starting node', 10,10);
    }
  }
}