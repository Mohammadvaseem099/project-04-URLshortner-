const express = require("express");
const router = express.Router();
const {createUrl,getUrl}= require("../controllers/urlController");
 
//===================create api===============================>>>>>
router.post("/url/shorten",createUrl);

//=====================get api================================>>>>>
router.get("/:urlCode",getUrl);

//=====This API is used for handling any invalid Endpoints=====>>>>>
router.all("/*", async function (req, res) {
    res.status(404).send({ status: false, msg: "Page Not Found!!!" });
  });

module.exports = router;