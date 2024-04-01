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
import { createChart } from './results/chart.js';
import { junctionExtract } from './spatialOperations/imageToLine.js';
import Sources from './mapOperations/mapSources.js';
import { mapToImg } from './mapOperations/mapToImg.js';
import { clearChilds, lineProcesses, polygonProcesses } from './uiElements.js';
import { growRegion } from './algorithms/regionGrowing.js';
import { junctionExtract1 } from './dumpyard.js';
import { addGeoJSONLayer } from './mapOperations/vectorLyrSrc.js';
import { apply } from 'ol-mapbox-style';



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

const imgProcessBtn= document.getElementById('processImgBtn');
const imgVectorizeBtn= document.getElementById('vectorizeBtn');
const compareBtn= document.getElementById('compareBtn')
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
let imgProcessed1= false;
let imgProcessed2= false;
let vectorFilePresent1= false;
let vectorFilePresent2=false;
let bothMapSelected=false;
let processOptionsEnabled= false;
let contourData1, contourData2, erodeCannyData1, erodeCannyData2, vectorData1, vectorData2 ;
let lp;

let map1, map2;


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

  //let url=`https://basemapstyles-api.arcgis.com/arcgis/rest/services/styles/v2/styles/arcgis/streets?token=AAPK3890bdd7605a4e3d9adb68f5790780eczWSlc-Uyepn0n8XMnNwNaiymNVrEy4ihJruVsf2PVK_lD086faryQVtQkssjkq84`
  //apply(map2, url)
  
  extentBox.textContent="Extent: "+map1.getView().calculateExtent(map1.getSize());
  zoomLevelBox.textContent="Zoom Level: "+map1.getView().getZoom();
  
  map1.on('moveend',(e)=>{
    mapToImg(map1, canvas1, canvasCtx1);
    
    if (vectorFilePresent1===true){
      contourData1=undefined;
      vectorData1=undefined;
      vectorFilePresent1=false;
      

    }

    extentBox.textContent="Extent: "+map1.getView().calculateExtent(map1.getSize());
    zoomLevelBox.textContent="Zoom Level: "+map1.getView().getZoom();
  });
  
  map2.on('moveend',(e)=>{
    mapToImg(map2, canvas2, canvasCtx2);
    
    if (vectorFilePresent2===true){
      contourData2=undefined;
      vectorData2=undefined;
      vectorFilePresent2=false;
    }
  });
 let coord; 
  map1.on('click',(e)=>{
    let imgData= canvasCtx1.getImageData(0,0,canvas1.width,canvas1.height);
    console.log(colorFromPixel(e.pixel, imgData.data, 300, 300));
    let diffImg= colorInRange(imgData, colorFromPixel(e.pixel, imgData.data, 300, 300), 0);
    canvasCtx1.putImageData(diffImg,0,0);
    map1Selected=true;
    //let op= growRegion(imgData, {delta:20,pixel:e.pixel});
    //let opimg= new ImageData(op.data,300,300);
   //canvasCtx1.putImageData(opimg,0,0);
   //console.log({delta:20,pixel:e.pixel});
  
    
  });

  map2.on('click',(e)=>{
    let imgData= canvasCtx2.getImageData(0,0,canvas2.width,canvas2.height);
    //console.log(colorFromPixel(e.pixel, imgData.data, 300, 300));
    let diffImg= colorInRange(imgData, colorFromPixel(e.pixel, imgData.data, 300, 300), 0);
    canvasCtx2.putImageData(diffImg,0,0);
    map2Selected=true;
  })
  

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
    clearChilds(inner);
  }else if (featureDropDown.value==='2'){ 
    clearChilds(inner);
    polygonProcesses(inner);
  }else if (featureDropDown.value==='3'){ 
    clearChilds(inner);
    lineProcesses(inner);
  }

});

imgProcessBtn.addEventListener('click',(e)=>{

  if (featureDropDown.value==='1'){

    alert('Choose a feature type from drop down');

  }else if (featureDropDown.value==='2'){

    //polygon feature

    if (map1Selected===true){

      let imgData1= canvasCtx1.getImageData(0,0,canvas1.width,canvas1.height);
      contourData1= getContours(imgData1, canvas1);
      imgProcessed1=true;
  
    }
  
    if (map2Selected===true){
      let imgData2= canvasCtx2.getImageData(0,0,canvas2.width,canvas2.height);
      contourData2= getContours(imgData2, canvas2);
      imgProcessed2=true;
    }
    

  }else if (featureDropDown.value==='3'){

    //Line feature
    if (map1Selected===true){

      let param1= parseInt(sessionStorage.getItem('ER_KER_SIZ_1'));
      let param2= parseInt(sessionStorage.getItem('ER_ITER_1'));

      let imgData1= canvasCtx1.getImageData(0,0,canvas1.width,canvas1.height);
      erodeCannyData1= erodePlusCanny(imgData1,param1, param2);
      imgProcessed1=true;
      canvasCtx1.putImageData(erodeCannyData1,0,0);
      
    }

    if (map2Selected===true){
      let imgData2= canvasCtx2.getImageData(0,0,canvas2.width,canvas2.height);
      

    }


  }
  

});

imgVectorizeBtn.addEventListener('click', (e)=>{

  if (featureDropDown.value==='2'){

    if (imgProcessed1===true){
      let extent1= map1.getView().calculateExtent(map1.getSize());
      vectorData1=contourToPolygon(contourData1, canvas1.width, canvas1.height, extent1);
      vectorFilePresent1=true;
      let lyr= addGeoJSONLayer(vectorData1);
      map1.addLayer(lyr);
      imgProcessed1=false;
      console.log(map1.getLayers());
    }else {
      alert('Process image from map1 before vectorizing');
    }

    if(imgProcessed2===true){
      let extent2= map2.getView().calculateExtent(map2.getSize());
      vectorData2=contourToPolygon(contourData2, canvas2.width, canvas2.height, extent2);
      vectorFilePresent2=true;
      let lyr= addGeoJSONLayer(vectorData2);
      map1.addLayer(lyr);
      imgProcessed2=false;

    }

  }else if (featureDropDown.value==='3'){

    if (imgProcessed1===true){
      let extent1= map1.getView().calculateExtent(map1.getSize());
      let redata=junctionExtract1(erodeCannyData1.data, 300, 300, extent1);
      vectorData1= redata[0];
      vectorFilePresent1=true;
      let jn= addGeoJSONLayer(vectorData1);
      let lyr= addGeoJSONLayer(redata[1]);
      map1.addLayer(jn);
      map1.addLayer(lyr);
      canvasCtx1.putImageData(redata[2],0,0);
      imgProcessed1=false;
      clearChilds(inner);
     

    }else {
      alert('Process image from map1 before vectorizing');
    }

    if (imgProcessed2===true){



    }

  }
})



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




