const Listing = require("../models/listing.js");
const axios = require('axios');


module.exports.index = async(req, res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
};


module.exports.renderNewForm = (req, res)=>{
    res.render("listings/new.ejs");
};


module.exports.createListing = async(req, res, next)=>{
        let url = req.file.path;
        let filename = req.file.filename;
        const newListing = new Listing(req.body.listing);


        let place = newListing.location;

        try{
            let result = await axios.get(`https://nominatim.openstreetmap.org/search?q=${place}&format=json`,
        {
            headers : {
                "User-agent" : "wanderlust/1.0",
            }
        })


        if(result.data.length === 0){
            req.flash("error", "Location not found");
            return res.redirect("/listings/new");
        }

        let location = result.data[0];
        let lat = Number(location.lat);
        let lon = Number(location.lon);


        newListing.geometry = {
            type : "Point",
            coordinates : [lon, lat],
        }
    

        newListing.owner = req.user._id;
        newListing.image = {url, filename}
        

        await newListing.save();
        req.flash("success", "New Listing Created !");
        res.redirect("/listings");

        }catch(err){
         if(err.response && err.response.status === 429){
            req.flash("error", "Location service is temporarily unavailable. Please try again !");
            return res.redirect("/listings/new");
         }
         next(err);   
        }

        
};
        


module.exports.showListing = async(req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path : "reviews", populate : {path : "author"}}).populate("owner");
    
    if(!listing){
        req.flash("error", "Listing does not exist");
        res.redirect("/listings");
    }else{
        res.render("listings/show.ejs", {listing});
    }

};


module.exports.renderEditForm = async(req, res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);

    if(!listing){
        req.flash("error", "Listing does not exist");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250")
   res.render("listings/edit.ejs", {listing, originalImageUrl});
};


module.exports.updateListing = async(req, res)=>{
    let {id} = req.params;



    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing}, {new : true});
    
    //if user doesn't upload image 
    if(typeof req.file !== "undefined"){
            let url = req.file.path;
            let filename = req.file.filename;
            listing.image = {url, filename};

            await listing.save();
        }

    //changing map position according to location

    let place = listing.location;
    let result = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json`,
        {
            headers : {
                "User-Agent" : "wanderlust/1.0",
            }
        }
    )

    if(result.data.length === 0){
        req.flash("error", "Location not found !");
        return res.redirect(`/listings/${id}/edit`);
    }

    let location = result.data[0];
    let lat = Number(location.lat);
    let lon = Number(location.lon);

    listing.geometry = {
        type : "Point",
        coordinates : [lon, lat],
    };

    await listing.save();


    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
};


module.exports.destroyListing = async(req, res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted")
    res.redirect("/listings");
};