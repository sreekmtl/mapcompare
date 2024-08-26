

class Keys{

    constructor(){

        this.apikeys={
            BingMapKey:'',
            ArcGISKey:'',
            GoogleMapKey:''
        };
    }

    getKeys(){

        return this.apikeys;
    }
}

export default Keys;