import Map from 'ol/Map.js';
import View from 'ol/View.js';
import OSM from 'ol/source/OSM.JS';
import BingMaps from 'ol/source/BingMaps.js';
import TileLayer from 'ol/layer/Tile.js';
import MapEvent from 'ol/MapEvent.js'
import Keys from './keys.js';
import '../styles/myStyles.css'
import 'ol/ol.css';
import { getContours, getCannyEdge } from './cvOps.js';
import { colorCompare } from './pixmatch.js';
import kmeans from './kmeans.js';
import { colorFromPixel, getChannels } from './utils.js';



const keys= new Keys();
let bingMapKey= keys.getKeys().BingMapKey;



const canvas1= document.getElementById('imgCanvas1');
const canvas2= document.getElementById('imgCanvas2');

const canvasCtx1= canvas1.getContext('2d');
const canvasCtx2= canvas2.getContext('2d');

var mCanvas1= document.createElement('canvas');
var mCanvas2= document.createElement('canvas');

var mCtx1= mCanvas1.getContext('2d');
var mCtx2= mCanvas2.getContext('2d');



var img1= new Image();
var img2= new Image();

const processBtn= document.getElementById('mapToCanvasBtn');

let map1, map2;

async function mapToImg(map,mapCanvas,canvasContext) {
  map.once('rendercomplete', function () {
    //const mapCanvas = document.getElementById('imgCanvas1');
    const size = map.getSize();
    mapCanvas.width = size[0];
    mapCanvas.height = size[1];
    const mapContext = canvasContext;
    Array.prototype.forEach.call(
      map.getViewport().querySelectorAll('.ol-layer canvas, canvas.ol-layer'),
      function (canvas) {
        if (canvas.width > 0) {
          const opacity =
            canvas.parentNode.style.opacity || canvas.style.opacity;
          mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
          let matrix;
          const transform = canvas.style.transform;
          if (transform) {
            // Get the transform parameters from the style's transform matrix
            matrix = transform
              .match(/^matrix\(([^\(]*)\)$/)[1]
              .split(',')
              .map(Number);
          } else {
            matrix = [
              parseFloat(canvas.style.width) / canvas.width,
              0,
              0,
              parseFloat(canvas.style.height) / canvas.height,
              0,
              0,
            ];
          }
          // Apply the transform to the export map context
          CanvasRenderingContext2D.prototype.setTransform.apply(
            mapContext,
            matrix
          );
          const backgroundColor = canvas.parentNode.style.backgroundColor;
          if (backgroundColor) {
            mapContext.fillStyle = backgroundColor;
            mapContext.fillRect(0, 0, canvas.width, canvas.height);
          }
          mapContext.drawImage(canvas, 0, 0);
        }
      }
    );
    mapContext.globalAlpha = 1;
    mapContext.setTransform(1, 0, 0, 1, 0, 0);
    
  });
  map.renderSync();
  
}

function init(){

const view= new View({
  center: [8687373.06, 3544749.53],
  zoom: 13,
});

map1=    new Map({
        layers: [
          new TileLayer({source: new OSM()}),
        ],
        view:view,
        target: 'map1',
      });
    
map2=    new Map({
        layers:[
            new TileLayer({source:new BingMaps({
                key:bingMapKey,
                imagerySet:'RoadOnDemand'
            })}),
        ],
        view:view,
        target:'map2',
    
    });



map1.on('moveend',(e)=>{
  mapToImg(map1, canvas1, canvasCtx1);
});

map2.on('moveend',(e)=>{
  mapToImg(map2, canvas2, canvasCtx2);
});

map1.on('click',(e)=>{
  let imgData= canvasCtx1.getImageData(0,0,canvas1.width,canvas1.height);
  console.log(colorFromPixel(e.pixel, imgData.data, 300, 300));
  
});



}


processBtn.addEventListener('click',()=>{
  //mapToImg(map1, canvas1, canvasCtx1);
  let imgData1= canvasCtx1.getImageData(0,0,canvas1.width,canvas1.height);
  getCannyEdge(imgData1, canvas1);
  //getContours(imgData1,canvas1)
  let imgData2= canvasCtx2.getImageData(0,0,canvas2.width,canvas2.height);
  //getCannyEdge(imgData2, canvas2);
  var op= colorCompare(imgData1, canvas2.width, canvas2.height);
  console.log(op, 'op');
  canvasCtx2.putImageData(op, 0, 0);

  //let data= getChannels(imgData1.data);
  //console.log(kmeans(data, 5));
  

});



init();



