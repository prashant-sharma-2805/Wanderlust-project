const mongoose = require("mongoose");
const Review = require("./review.js");

const listingSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true,
    },
    description : String,
    image: {
        filename: {
            type: String,
            default: "listingimage",
        },
        url: {
            type: String,
            default: "https://plus.unsplash.com/premium_photo-1687960116497-0dc41e1808a2?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YWlyYm5ifGVufDB8fDB8fHww",
            set : (v)=> v === ""? "https://plus.unsplash.com/premium_photo-1687960116497-0dc41e1808a2?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YWlyYm5ifGVufDB8fDB8fHww" : v,
        }
    },
    price : Number,
    location : String,
    country : String,

    geometry :{
            type : {
                type : String,
                enum : ["Point"],
                required : true,
            },
            coordinates : {
                type : [Number],
                required : true,
            }
        },

    reviews : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Review",
        }
    ],
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
    }
});

listingSchema.post("findOneAndDelete", async(listing)=>{
    if(listing){
        await Review.deleteMany({_id : {$in : listing.reviews}});
    }
})

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;