'use strict';
var formidable= require('formidable');
module.exports = function(app) {
    app.get('/', function(req, res) {
        res.render('pages/index');
    });

    app.post('/save',function(req,res){
        var form = new formidable.IncomingForm();
        form.parse(req);
        console.log(__dirname)
        form.on('fileBegin', function (name, file){
            file.path = 'files/' + file.name;
        });
        var nameList= new Array();
        form.on('file', function (name, file){
            console.log('Uploaded ' + file.name);
            nameList.push(file.name);
        });
    
       setTimeout(() => {
        res.send(nameList);
       }, 500);
        
     
    })

    app.get('/about', function(req, res) {
        res.render('pages/about');
    });
};