# Map Compare

Web application for comparing web map layers. This application compares web maps and produce comparison metrices. I have created this app as the part of my MSc Thesis work names 'Development of a web map quality evaluation framework'. I have used classical computer vision and image processing techniques to extract spatial information from the raster tiles and later converted these spatial information into vector format for further spatial analysis. The application then displays the quality metrices from the spatial analysis as well as the image processing methods.

## Warning !
Read the docs before proceeding. Install Node.js on your system to build or make any changes to the app. 
Use your own API keys for Google Maps and Bing Maps, Add keys at /src/mapOperations/keys.js .

## To Build
Open the terminal, then:

```bash
git clone repo
npm install
npm run bundle
```

## To Run
Open the terminal, then:

```bash
npm run serve
```
## Screenshots

### Home Page 
User have to select the type of feature/comparison and map type from drop down menu before going further.

![alt text](https://github.com/sreekmtl/mapcompare/blob/main/preview/home.PNG)

### Polygon Feature Comparison

![alt text](https://github.com/sreekmtl/mapcompare/blob/main/preview/p4.PNG)

### Linear Feature Comparison

![alt text](https://github.com/sreekmtl/mapcompare/blob/main/preview/l7.PNG)

### Thematic Map Comparison (Nominal)

![alt text](https://github.com/sreekmtl/mapcompare/blob/main/preview/t4.PNG)


### Visualization Evaluation

![alt text](https://github.com/sreekmtl/mapcompare/blob/main/preview/v1.PNG)


