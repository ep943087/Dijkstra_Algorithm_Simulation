import {Transformations, getCircle} from '../transformations/transforms.js';

class Node{
  constructor(position, name){
    this.position = position;
    this.name = name;
    this.neighbors = [];
    this.previous = null;
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
    this.setButtons();
    this.setConnectionTypesButtons();
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

  /*************************
   * CONNECTION TYPES
   *************************/
  // INITIALIZE CONNECTION TYPES BUTTONS
  setConnectionTypesButtons(){
    const buttons = ['connection-close', 'clear-connections','clear-nodes'];
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
      }
    });
  }

  // CLEAR NODES
  clearNodes(){
    this.nodes = [];
  }

  // CLEAR CONNECTIONS
  clearConnections(){
    this.nodes.forEach(node=>node.clearNeighbors());
  }

  // CONNECTION CLOSE
  connectionsClose(){
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
    this.currentNode = null;
    this.currentNode2 = null;
    this.nodes = [];
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
  setState(name){
    this.state = name;
    if(name === "move-around"){
      this.transforms.setIsStatic(false);
    } else{
      this.transforms.setIsStatic(true);
    }
    this.setButtonActive(name);
  }

  // SET BUTTONS CLASS TO ACTIVE
  setButtonActive(name){
    for(const key in this.buttons){
      this.buttons[key].classList.remove('active');
      if(key === name)
        this.buttons[key].classList.add('active');
    }
  }

  // DRAWING LOGIC BELOW
  drawConnections = (node) => {
    node.neighbors.forEach(node2=>{
      const line = [node.position, node2.position];
      this.transforms.drawLine(line,'red');
    });
  }

  drawNode = (node) => {
    const circle = getCircle(node.position.x,node.position.y,this.nodeRadius);
    const color = node === this.currentNode || node === this.currentNode2? "blue" : "white";
    this.transforms.drawShape(circle,color,1);
  }

  drawNodes(){
    this.nodes.forEach(this.drawConnections);
    this.nodes.forEach(this.drawNode);
  }
}