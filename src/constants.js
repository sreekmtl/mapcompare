

export default class Constants{

    constructor(mapWidth, mapHeight, mapExtent){

        this.mapWidth= mapWidth;
        this.mapHeight= mapHeight;
        this.mapExtent= mapExtent;

    }

    

    get pixelWidth(){

        return (this.mapExtent[2]-this.mapExtent[0])/this.mapWidth ;
    }

    get pixelHeight(){

        return (this.mapExtent[3]-this.mapExtent[1])/this.mapHeight;
    }

    get areaPerPixel(){

        return this.pixelHeight*this.pixelWidth;
    }
}