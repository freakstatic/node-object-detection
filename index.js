const fs = require('fs');
const configs = JSON.parse(fs.readFileSync('config.json', 'utf8'));

const io = require('socket.io-client');

const chokidar = require('chokidar');
const request = require('request');

let yolo = require('node-yolo');

let detector = new yolo("darknet-configs", "cfg/coco.data", "cfg/yolov3.cfg", "yolov3.weights");

startJob();

function startJob () {
    getToken().then((token) => {
        let watcher;
        let socket = io(configs.server.url + ':' + configs.server.socketPort, {
            'reconnection': false
        });

        let processNewImages = (path) => {
            watcher = chokidar.watch(path, {
                ignoreInitial: true,
                awaitWriteFinish: true
            });
            watcher.on('add', (path) => {
                console.log('File added');
                detector.detect(path).then(data => {
                    console.log(data);
                    let detection = {
                        objects: data,
                        imgUrl: path,
                    };
                    socket.emit('detection', detection);
                });
            });
        };
        let handleSocketConnection = () => {
            console.log('Connected to socket server');
            socket.emit('authenticate', token);
            socket.on('set-folder', processNewImages);
        };

        socket.on('connect', handleSocketConnection);

        socket.on('disconnect', () => {
            console.log('Disconnected from socket server');
            watcher.close();
            socket.removeAllListeners('set-folder');
            socket.removeAllListeners("connect");
            socket.removeAllListeners("disconnect");
            startJob();
        });
    });
}



function getToken() {
    return new Promise(((resolve, reject) => {
        let options = {
            url: configs.server.url + ':' + configs.server.httpPort + '/api/login',
            'content-type': 'application/json',
            auth: {
                user: configs.username,
                password: configs.password
            },
            method: 'POST',
            json: true
        };

        request(options, function (err, res, body) {
            if (err) {
                console.error(err);
                setTimeout(() => {
                   startJob();
                   console.error('[getToken] Request fail, retrying...')
                }, 2000);
                return;
            }
            resolve(body.token);
        })

    }));

}

