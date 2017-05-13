var mongo = require('mongodb').MongoClient
var url = process.env.MONGOLAB_URI;
var randomstring = require("randomstring")

var express = require("express")
var app = express();
var port = process.env.PORT || 8080
if (process.env.NODE_ENV = "test"){
   var host = "http://localhost:" + port + "/";
}else{
    "https://fcc-url-shortener-karen.heroku.com/" 
}
var col = "urlShortener";


module.exports = app;

app.listen(port, function(){
    console.log("listening on port %s", port);
})

function get_short_code(url){

    return randomstring.generate(8);
}

app.get("/:urlcode(\\w+)", function(req, res){
    var short_code = req.params.urlcode;
    mongo.connect(url, function(err, db) {
        if (err) throw err;
        collection =  db.collection(col);
        
        collection.find({code: short_code}).limit(1).toArray( function(err, data){
            if (err) {
                res.send(err)
            }
            db.close();
            console.log(data);
            res.redirect("https://" + data[0].url);
        })
    })
})
function handle_url(original_url, res){
    short_code = get_short_code(original_url);
    mongo.connect(url, function(err, db) {
        if (err) throw err;
        collection =  db.collection(col);
        
        collection.findAndModify(
              { url: original_url },
              [],
              { $setOnInsert: { code: short_code } },
              {new : true, upsert:true},
        function(err, doc){
            if (err) throw err;
            console.log(doc);
            short_url = host  + doc.value.code;
            db.close(); 
            res.send({
                "original_url": original_url,
                "short_url": short_url
            });
        })
    
    })
}

app.get("/", function(req, res){
    res.send("please give me a url.");
})

app.get("*", function(req, res){
    var url = req.url.substring(1);
    if (url.startsWith("http://")){
        url = url.substring(7);
    }
    if (url.startsWith("https://")){
        url = url.substring(8);
    }
    handle_url(url, res);
})



