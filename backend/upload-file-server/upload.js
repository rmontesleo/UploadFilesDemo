const http = require('http');
const formidable = require('formidable');
const fs = require('fs');


function defineServer(request, response) {
    let form = new formidable.IncomingForm();
    form.parse(request, function (error, fields, files) {
        console.log("---------------------");
        console.log( files.userFile);
        console.log("---------------------");
        
        const oldPath = files.userFile.filepath;
        const newPath = 'C:/upload-files-node/'+ files.userFile.originalFilename;
        fs.rename(oldPath, newPath, function () {
            response.writeHead(200, {
                "Content-Type":"text/html",
                "Access-Control-Allow-Origin":"*", // REQUIRED CORS HEADER
                "Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept" // REQUIRED CORS HEADER
            });
            response.write('Node JS File Upload Success!');
            response.end();
        });
    });
}


http
    .createServer(defineServer)
    .listen(3000);