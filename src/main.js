import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import '../styles/myStyles.css'
import 'ol/ol.css';
import { getContours, getCannyEdge, watershed, erode, erodePlusCanny } from './imageProcessing/cvOps.js';
import { colorFromPixel, extractChannel, getChannels, imageCovariance } from './utils.js';
import Image from 'image-js';
import { colorInRange } from './imageProcessing/yiqRange.js';
import { contourToPolygon } from './spatialOperations/imageToPolygon.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import { createChart } from './chart.js';
import { junctionExtract } from './spatialOperations/imageToLine.js';
import Sources from './mapOperations/mapSources.js';



let sources= new Sources();


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
const imgCovBtn= document.getElementById('imageCov');
const extentBox= document.getElementById('extentBox');
const zoomLevelBox= document.getElementById('zoomLevel');
const featureDropDown= document.getElementById('FeatureType');
const mapdd1= document.getElementById('MapType1');
const mapdd2= document.getElementById('MapType2');
const inner= document.getElementById('processOptions');

let map1Selected= false; //Whether user selected feature from map1 or not
let map2Selected= false;
let vectorFilePresent1= false;
let vectorFilePresent2=false;
let bothMapSelected=false;
let processOptionsEnabled= false;
let contourData1, contourData2, vectorData1, vectorData2 ;

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

function init(src1, src2){

  const view= new View({
    center: [8687373.06, 3544749.53],
    zoom: 13,
    constrainResolution:true,
  });
  
  map1=    new Map({
          layers: [
            new TileLayer({source: src1}),
          ],
          view:view,
          target: 'map1',
        });
      
  map2=    new Map({
          layers:[
              new TileLayer({source: src2}),
          ],
          view:view,
          target:'map2',
      
      });
  
  extentBox.textContent="Extent: "+map1.getView().calculateExtent(map1.getSize());
  zoomLevelBox.textContent="Zoom Level: "+map1.getView().getZoom();
  
  map1.on('moveend',(e)=>{
    mapToImg(map1, canvas1, canvasCtx1);
    extentBox.textContent="Extent: "+map1.getView().calculateExtent(map1.getSize());
    zoomLevelBox.textContent="Zoom Level: "+map1.getView().getZoom();
  });
  
  map2.on('moveend',(e)=>{
    mapToImg(map2, canvas2, canvasCtx2);
  });
  
  map1.on('click',(e)=>{
    let imgData= canvasCtx1.getImageData(0,0,canvas1.width,canvas1.height);
    //console.log(colorFromPixel(e.pixel, imgData.data, 300, 300));
    let diffImg= colorInRange(imgData, colorFromPixel(e.pixel, imgData.data, 300, 300), 0);
    canvasCtx1.putImageData(diffImg,0,0);
    map1Selected=true;
    
  });

  map2.on('click',(e)=>{
    let imgData= canvasCtx2.getImageData(0,0,canvas2.width,canvas2.height);
    //console.log(colorFromPixel(e.pixel, imgData.data, 300, 300));
    let diffImg= colorInRange(imgData, colorFromPixel(e.pixel, imgData.data, 300, 300), 0);
    canvasCtx2.putImageData(diffImg,0,0);
    map2Selected=true;
  })
  

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


/**
 * All the UI events are written below
 * This includes button, slider events etc.
 */



featureDropDown.addEventListener('change',(c)=>{

  if (featureDropDown.value==='1'){

    while (inner.firstChild) {
      inner.removeChild(inner.firstChild);
    }
    processOptionsEnabled=false;

  }else if (featureDropDown.value==='2'){
  
  }else if (featureDropDown.value==='3'){

  if (processOptionsEnabled===false){
    
    let ki= document.createElement('p').textContent="Erosion Kernel Size";
    const kernelInput= document.createElement('input');
    let ii= document.createElement('p').textContent='No of Iterations';
    const itInput= document.createElement('input');
  
    inner.append(ki,kernelInput,ii,itInput);
    processOptionsEnabled=true;
  }
  
  }

});

processBtn.addEventListener('click',(e)=>{

  if (featureDropDown.value==='1'){

    alert('Choose a feature type from drop down');

  }else if (featureDropDown.value==='2'){

    //polygon feature

    if (map1Selected===true){

      let imgData1= canvasCtx1.getImageData(0,0,canvas1.width,canvas1.height);
      let extent1= map1.getView().calculateExtent(map1.getSize());
      contourData1= getContours(imgData1, canvas1);
      vectorData1=contourToPolygon(contourData1, canvas1.width, canvas1.height, extent1);
      vectorFilePresent1=true;
      addGeoJSONLayer(vectorData1);
  
    }
  
    if (map2Selected===true){
      let imgData2= canvasCtx2.getImageData(0,0,canvas2.width,canvas2.height);
      let extent2= map2.getView().calculateExtent(map2.getSize());
      contourData2= getContours(imgData2, canvas2);
      vectorData2=contourToPolygon(contourData2, canvas2.width, canvas2.height, extent2);
      vectorFilePresent2=true;
      addGeoJSONLayer(vectorData2);
    }
    

  }else if (featureDropDown.value==='3'){

    //Line feature
    if (map1Selected===true){
      let imgData1= canvasCtx1.getImageData(0,0,canvas1.width,canvas1.height);
      let erodeCannyData= erodePlusCanny(imgData1,3,3);
      let extent1= map1.getView().calculateExtent(map1.getSize());
      console.log(erodeCannyData);
      canvasCtx1.putImageData(erodeCannyData,0,0);
      vectorData1= junctionExtract(erodeCannyData.data, 300, 300, extent1);
      vectorFilePresent1=true;
      addGeoJSONLayer(vectorData1);
      console.log(vectorData1);
    }

    if (map2Selected===true){
      let imgData2= canvasCtx2.getImageData(0,0,canvas2.width,canvas2.height);
      //getCannyEdge(imgData2, canvas2,3,2);

    }


  }
  

});

downloadBtn.addEventListener('click',(e)=>{

  if (vectorFilePresent1===true){

    let text= JSON.stringify(vectorData1);
    var filename = "layer.geojson";
 
    download(filename, text);

  }else{
    alert('Generate vector file before downloading');
  }


});

imgCovBtn.addEventListener('click',(e)=>{

  if (map1Selected===true && map1Selected===true){

    let imgData1= canvasCtx1.getImageData(0,0,canvas1.width,canvas1.height);
    let imgData2= canvasCtx2.getImageData(0,0,canvas2.width,canvas2.height);

    getCannyEdge(imgData1, canvas1);
    getCannyEdge(imgData2, canvas2);

    let cannyData1= canvasCtx1.getImageData(0,0,canvas1.width,canvas1.height);
    let cannyData2= canvasCtx2.getImageData(0,0,canvas2.width,canvas2.height);

    console.log(cannyData1,cannyData2);

    let covImage= imageCovariance(cannyData1, cannyData2);


  }else {
    alert('Select features from both maps');
  }

});

let sourceMap={
  '1':sources.OSM_Standard,
  '2':sources.Bing_RoadsOnDemand,
  '3':sources.EsriXYZ,
  '4':sources.ArcGIS_sample,
  '5':sources.EsriMaps,
}

init(sourceMap['1'],sourceMap['2']);

mapdd1.addEventListener('change',(c)=>{

  //init(sourceMap[mapdd1.value], sourceMap[mapdd2.value]);
});

mapdd2.addEventListener('change', (c)=>{
  //init(sourceMap[mapdd1.value], sourceMap[mapdd2.value]);
});




