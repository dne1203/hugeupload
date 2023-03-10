const http = require('http');
const uploader = require('huge-uploader-nodejs');

// you must specify a temp upload dir and a max filesize for the chunks
const tmpDir = 'D:\\m4\\';
const maxFileSize = 10;

http.createServer((req, res) => {
    if (req.url === '/upload' && req.method === 'POST') {
        // we feed the function with node's request object (here req),
        // the temp directory path and the max size for the chunks
        uploader(req, tmpDir, maxFileSize, maxChunkSize)
            .then((assembleChunks) => {
                // chunk written to disk
                res.writeHead(204, 'No Content');
                res.end();

                // on last chunk, assembleChunks function is returned
                // the response is already sent to the browser because it can take some time if the file is huge
                if (assembleChunks) {
                    // so you call the promise, it assembles all the pieces together and cleans the temporary files
                    assembleChunks()
                        // when it's done, it returns an object with the path to the file and additional post parameters if any
                        .then(data => console.log(data)) // { filePath: 'tmp/1528932277257', postParams: { email: 'upload@corp.com', name: 'Mr Smith' } }
                        // errors if any are triggered by the file system (disk is full…)
                        .catch(err => console.log(err));
                }
            })
            .catch((err) => {
                if (err.message === 'Missing header(s)') {
                    res.writeHead(400, 'Bad Request', { 'Content-Type': 'text/plain' });
                    res.end('Missing uploader-* header');
                    return;
                }

                if (err.message === 'Missing Content-Type') {
                    res.writeHead(400, 'Bad Request', { 'Content-Type': 'text/plain' });
                    res.end('Missing Content-Type');
                    return;
                }

                if (err.message.includes('Unsupported content type')) {
                    res.writeHead(400, 'Bad Request', { 'Content-Type': 'text/plain' });
                    res.end('Unsupported content type');
                    return;
                }

                if (err.message === 'Chunk is out of range') {
                    res.writeHead(400, 'Bad Request', { 'Content-Type': 'text/plain' });
                    res.end('Chunk number must be between 0 and total chunks - 1 (0 indexed)');
                    return;
                }

                if (err.message === 'File is above size limit') {
                    res.writeHead(413, 'Payload Too Large', { 'Content-Type': 'text/plain' });
                    res.end(`File is too large. Max fileSize is: ${maxFileSize}MB`);
                    return;
                }

                if (err.message === 'Chunk is above size limit') {
                    res.writeHead(413, 'Payload Too Large', { 'Content-Type': 'text/plain' });
                    res.end(`Chunk is too large. Max chunkSize is: ${maxChunkSize}MB`);
                    return;
                }

                // this error is triggered if a chunk with uploader-chunk-number header != 0
                // is sent and there is no corresponding temp dir.
                // It means that the upload dir has been deleted in the meantime.
                // Although uploads should be resumable, you can't keep partial uploads for days on your server
                if (err && err.message === 'Upload has expired') {
                    res.writeHead(410, 'Gone', { 'Content-Type': 'text/plain' });
                    res.end(err.message);
                    return;
                }

                // other FS errors
                res.writeHead(500, 'Internal Server Error'); // potentially saturated disk
                res.end();
            });
    }

    // unknown route
    else {
        res.writeHead(404, 'Resource Not Found', { 'Content-Type': 'text/plain' });
        res.end('Resource Not Found');
    }
})
    .listen(8888, () => {
        console.log('Listening for requests');
    });