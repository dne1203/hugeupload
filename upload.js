const HugeUploader =require('huge-uploader');
var File = require("file-class");
var fs = require('fs')
fs.readFile('D:\\m4\\test\\3KtnQIXQ.ts', function (err, data) {
    if (err) throw err
    console.log('isBuffer: ' + Buffer.isBuffer(data)) // isBuffer: true
    console.log(data) // <Buffer 72 6f ... >

    // instanciate the module with a settings object
    const uploader = new HugeUploader({ endpoint: 'http://127.0.0.1:8888/upload/', file: new File('D:\\m4\\test\\3KtnQIXQ.ts') });

// subscribe to events
    uploader.on('error', (err) => {
        console.error('Something bad happened', err.detail);
    });

    uploader.on('progress', (progress) => {
        console.log(`The upload is at ${progress.detail}%`);
    });

    uploader.on('finish', (body) => {
        console.log('yeahhh - last response body:', body.detail);
    });
    uploader.start();
// if you want to pause/resume the upload
  //  uploader.togglePause();




})
