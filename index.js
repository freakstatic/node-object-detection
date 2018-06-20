const fs = require('fs');
const configs = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const axios = require('axios');
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
                    let detection = {
                        objects: data,
                        imgUrl: path,
                    };
                    if (socket.connected){
                        console.log(data);
                        socket.emit('detection', detection);
                    }else {
                        console.error('Seems that the socket has been  disconnected, this detection will be ignored');
                    }
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
            if (watcher){
                watcher.close();
            }
            socket.removeAllListeners('set-folder');
            socket.removeAllListeners("connect");
            socket.removeAllListeners("disconnect");
            startJob();
        });
    });
}



function getToken() {
 return new Promise(((resolve) =>
 {
  axios.post(configs.server.url + ':' + configs.server.httpPort + '/api/login',
   {
    username: configs.username,
    password: configs.password
   })
       .then(function(response)
             {
              resolve(response.data.token);
             })
       .catch(function(error)
              {
               console.error(error);
               setTimeout(() =>
                          {
                           startJob();
                           console.error('[getToken] Request fail, retrying...');
                          }, 2000);
              });
 }));
}