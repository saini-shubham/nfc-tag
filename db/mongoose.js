const mongoose = require('mongoose')
const validator = require('validator')
mongoose.connect('mongodb://127.0.0.1:27017/nfc-tag', {
   useNewUrlParser: true,
   //useCreateIndex: true
   //useCreateIndex: true, //make this true
   // useNewUrlParser: true,
    //useUnifiedTopology: true
})

// const Task = mongoose.model('Task', {
//     description: {
//         type: String,
//         required: true,
//         trim: true
//     },
//     completed: {
//         type: Boolean,
//         default: false
//     },
//     remarks:{
//         type:String,
//         requied:true,
//         validate(val){
//             if(val === ""){
//                 throw new Error("remarks required")
//             }
//         }
    
//     }
// })

// const task = new Task({
//     description: "creating nonsense",
//     completed:false,
//     remarks:"okkk"

// })