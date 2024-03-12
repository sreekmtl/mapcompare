import Map from 'ol/Map.js';
import View from 'ol/View.js';
import OSM from 'ol/source/OSM.JS';
import BingMaps from 'ol/source/BingMaps.js';
import TileLayer from 'ol/layer/Tile.js';
import MapEvent from 'ol/MapEvent.js'
import Keys from './keys.js';
import '../styles/myStyles.css'
import 'ol/ol.css';
import { getContours, getCannyEdge, watershed } from './cvOps.js';
import { colorCompare } from './pixmatch.js';
import { colorFromPixel, extractChannel, getChannels } from './utils.js';
import Image from 'image-js';
import modFilter from './modeFilter.js';
import { colorInRange } from './yiqRange.js';
import { contourToPolygon } from './pixelToSpatial.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import GeoJSON from 'ol/format/GeoJSON.js';


const keys= new Keys();
let bingMapKey= keys.getKeys().BingMapKey;



const canvas1= document.getElementById('imgCanvas1');
const canvas2= document.getElementById('imgCanvas2');

const canvasCtx1= canvas1.getContext('2d',  { willReadFrequently: true });
const canvasCtx2= canvas2.getContext('2d',  { willReadFrequently: true });

var mCanvas1= document.createElement('canvas');
var mCanvas2= document.createElement('canvas');

var mCtx1= mCanvas1.getContext('2d');
var mCtx2= mCanvas2.getContext('2d');



var img1= new Image();
var img2= new Image();

const processBtn= document.getElementById('mapToCanvasBtn');
const downloadBtn= document.getElementById('downloadVector');

let featureSelected= false; //Whether user selected feature from map or not
let vectorFilePresent= false;
let contourData;
let vectorData;

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
    let diffImg= colorInRange(imgData, colorFromPixel(e.pixel, imgData.data, 300, 300), 0);
    canvasCtx1.putImageData(diffImg,0,0);
    featureSelected=true;
    
  });
  
  

}

function addGeoJSONLayer(data){

    const vectorSource= new VectorSource({
      features:new GeoJSON({dataProjection:'EPSG:3857'}).readFeatures(data),
    });

  const vectorLayer= new VectorLayer({
      source:vectorSource,
    });

    map1.addLayer(vectorLayer);
  

}

function download(file, text){
  var element = document.createElement('a');
                element.setAttribute('href',
                'data:application/json;charset=utf-8, '
                + encodeURIComponent(text));
                element.setAttribute('download', file);
                document.body.appendChild(element);
                element.click();
 
                document.body.removeChild(element);
}


processBtn.addEventListener('click',(e)=>{
  
  let imgData1= canvasCtx1.getImageData(0,0,canvas1.width,canvas1.height);
  let extent= map1.getView().calculateExtent(map1.getSize());
  getCannyEdge(imgData1,canvas1);
  contourData= getContours(imgData1, canvas1);
  vectorData=contourToPolygon(contourData, canvas1.width, canvas1.height, extent);
  vectorFilePresent=true;
  addGeoJSONLayer(vectorData);


  let img_2= Image.fromCanvas(canvas2);
  //let m= img_2.medianFilter({channels:3, radius:1, border:'copy'});
  let m= modFilter(img_2, {channels:3, radius:2, border:'copy'});
  
  let img_22= new ImageData(canvas2.width, canvas2.height);

  for (let i=0; i<m.data.length; i+=4){

    img_22.data[i]= m.data[i];
    img_22.data[i+1]= m.data[i+1];
    img_22.data[i+2]= m.data[i+2];
    img_22.data[i+3]= m.data[i+3];

  }

  canvasCtx2.putImageData(img_22,0,0);
  

});

downloadBtn.addEventListener('click',(e)=>{

  if (vectorFilePresent===true){

    let text= JSON.stringify(vectorData);
    var filename = "layer.geojson";
 
    download(filename, text);

  }else{
    alert('Generate vector file before downloading');
  }


});



init();



