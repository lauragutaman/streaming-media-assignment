const fs = require('fs');
const path = require('path');


// GENERIC FUNCTION TO STREAM 
const streamFile = (request, response, filePath, contentType) => {

    fs.stat(filePath, (err, stats) => {
        if (err) {
            if (err.code === 'ENOENT') {
                response.writeHead(404);
            }
            return response.end();
        }

        let { range } = request.headers;

        if (!range) {
            range = 'bytes=0-';
        }

        const position = range.replace(/bytes=/, '').split('-');

        let start = parseInt(position[0], 10);

        const total = stats.size;
        const end = position[1] ? parseInt(position[1], 10) : total - 1;

        if (start > end) {
            start = end - 1;
        }

        const chunksize = (end - start) + 1;

        response.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${total}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': contentType,
        });

        const stream = fs.createReadStream(filePath, { start, end });

        stream.on('open', () => {
            stream.pipe(response);
        });

        stream.on('error', (streamErr) => {
            console.log(streamErr);
            response.end()
        });

        return stream;


    });

};

const getParty = (request, response) => {

    const filePath = path.resolve(__dirname, '../client/party.mp4');
    streamFile(request, response, filePath, 'video/mp4');



};

const getBird = (request, response) => {
    const filePath = path.resolve(__dirname, '../client/bird.mp4');
    streamFile(request, response, filePath, 'video/mp4');
}

const getBling = (request, response) => {
    const filePath = path.resolve(__dirname, '../client/bling.mp3')
    streamFile(request, response, filePath, 'audio/mpeg');
}

module.exports.getParty = getParty;
module.exports.getBird = getBird;
module.exports.getBling = getBling;
module.exports.streamFile = streamFile; 