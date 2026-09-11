const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const axios = require("axios");


async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

main()
.then((res)=>{
    console.log("Connection Successful");
})
.catch((err)=>{
    console.log(err);
})


const initDB = async () => {
    await Listing.deleteMany({});

    for(let listing of initData.data){
        let place = listing.location;
        let result = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json`,
            {
                headers : {
                    "User-Agent" : "wanderlust/1.0",
                }
            }
        )

        let location = result.data[0];
        let lat = Number(location.lat);
        let lon = Number(location.lon);

        listing.geometry = {
            type : "Point",
            coordinates : [lon, lat],
        };

        listing.owner = '6a9cebfc43607c08eb6c9615';

        let newListing = new Listing(listing);
        await newListing.save();

        await new Promise(resolve=> setTimeout(resolve, 1000));
        console.log("Listing Added");
    
    }
};

initDB()
