import mongoose from "mongoose";

const messageSchema=new mongoose.Schema({
    role:{
        type:String,
        enum:["ai","user"],
        required:true
    },
    content:{
        type:String,
        required:true
    }
},{timestamps:true})


const websiteSchema=new mongoose.Schema({

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    title:{
        type:String,
        default:"Untitled Website"
    },
    latestCode:{
        type:String,
        required:true
    },
    designSettings:{
        theme: { type: String, enum: ['light', 'dark', 'minimal', 'corporate', 'cyberpunk', 'glassmorphism'], default: 'dark' },
        colorPalette: { type: String, default: 'professional-blue' },
        customColor: { type: String, default: null },
        font: { type: String, enum: ['inter', 'poppins', 'roboto', 'montserrat', 'playfair'], default: 'inter' },
        animationPreset: { type: String, enum: ['fade-in', 'slide-up', 'hover-effects', 'parallax', 'staggered'], default: 'fade-in' },
        seoTitle: { type: String, default: "" },
        seoDescription: { type: String, default: "" }
    },
    conversation:[
        messageSchema
    ],
    deployed:{
        type:Boolean,
        default:false
    },
    deployUrl:{
        type:String,
    },
    slug:{
        type:String,
        unique:true,
        sparse: true,
    }

},{timestamps:true})

const Website=mongoose.model("Website",websiteSchema)
export default Website