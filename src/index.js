const express = require("express");
const bodyParser = require("body-parser");
const {default: mongoose} = require("mongoose");
const route = require("../src/routes/route");
const app = express();

app.use(bodyParser.json());

let url = "mongodb+srv://project-4:9RZ8Y85bPufE9ACx@cluster0.fwqappx.mongodb.net/group58Database";
let port = process.env.PORT || 3000; 

mongoose.connect(url,{useNewUrlParser:true})
    .then(() => console.log("MongoDb is connected")) 
    .catch((err) => console.log(err));
    
app.use("/", route);

app.listen(port, function () {
    console.log(`Express is listening on ${port}`);
});


//9RZ8Y85bPufE9ACx
//mongodb+srv://project-4:9RZ8Y85bPufE9ACx@cluster0.fwqappx.mongodb.net/groupXDatabase