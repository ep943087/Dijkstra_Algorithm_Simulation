import {Dijkstra_Algo} from './dijkstra_algo/dijkstra_algo.js';

const c = document.querySelector("#myCanvas");
const ctx = c.getContext('2d');


window.onload = () => draw();

const algo = new Dijkstra_Algo(c);

const draw = () => {
  requestAnimationFrame(draw);
  c.width = c.offsetWidth;
  c.height = c.offsetHeight;
  ctx.fillStyle = "#808080";
  ctx.clearRect(0,0,c.width,c.height);
  ctx.fillRect(0,0,c.width,c.height);
  algo.drawNodes();
}