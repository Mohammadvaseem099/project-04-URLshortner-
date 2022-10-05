const urlModel = require("../models/urlModel");
const shortid = require("shortid");
const validUrl=require('valid-url');
const redis=require('redis');

const {promisify} = require("util");

//==================Connect to redis============================>>>>>
const redisClient = redis.createClient(
  13190,
  "redis-13190.c301.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }                                       //check documents 
);
redisClient.auth("gkiOIPkytPI3ADi14jHMSWkZEo2J5TDG", function (err){
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});

//1. connect to the server
//2. use the commands :

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

//===========Create Short Url=======================>>>>>
const createUrl = async function (req, res) {
  try{
    let data = req.body;
    let {longUrl} = data;

    if(Object.keys(data).length==0){
      return res.status(400).send({ status: false, message: "Long url is mandatory"});
    }
    if(!longUrl){
      return res.status(400).send({ status: false, message: "longUrl must be present"});
    }
    if (!validUrl.isUri(longUrl)) {
      return res.status(400).send({status: false,message: "Please provide valid Url"});
    }

    let checkUrl = await urlModel.findOne({longUrl}).select({longUrl:1,shortUrl:1,urlCode:1});

    if (checkUrl){
      return res.status(200).send({ status: false, message: "Url already shorted", data: checkUrl});
    }

    let baseUrl = "http://localhost:3000";
    let urlCode = shortid.generate();
    let shortUrl = baseUrl+"/"+urlCode;

    url = new urlModel({longUrl,shortUrl,urlCode});
    
    let saveData = await urlModel.create(url);
    
    const finalUrl = {
      longUrl: saveData.longUrl,
      shortUrl: saveData.shortUrl,
      urlCode: saveData.urlCode
  }
    return res.status(201).send({status: true,message: "shortUrl has been created successfully",data: finalUrl});
  }catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//==================get api for fetching redirect url=========================>>>>>

const getUrl = async function (req, res){
try{
  let urlCode=req.params.urlCode;
  let catchedUrl=await GET_ASYNC(`${urlCode}`)
  if(!urlCode){
    return res.status(400).send({status:false, message:"url code must be present"});
  }
  if(catchedUrl){
    return res.status(302).redirect(catchedUrl);
  }
  let getUrl=await urlModel.findOne({urlCode:urlCode})
  if(getUrl){
    return res.status(302).redirect(getUrl.longUrl)
  }else{
    await SET_ASYNC(`${catchedUrl}`,JSON.stringify(getUrl))
    return res.status(400).send({status:false, msg:"shortUrl is not found"});
  }

}catch(err){
  return res.status(500).send({status:false, msg:err.message});
}
}

module.exports.createUrl=createUrl;
module.exports.getUrl=getUrl;

