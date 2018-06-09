const fs = require('fs');
const request = require('request');
const io = require('socket.io-client');
const chokidar = require('chokidar');
let yolo = require('node-yolo');

const configs = JSON.parse(fs.readFileSync('config.json', 'utf8'));

let detector = new yolo('darknet-configs', 'cfg/coco.data', 'cfg/yolov3.cfg', 'yolov3.weights');
let watcher;

getToken().then((token) =>
{
 const socket = io(configs.server.url + ':' + configs.server.socketPort);
 socket.on('connect', () =>
 {
  console.log('Connected to socket server');
  socket.emit('authenticate', token);
  watcher = chokidar.watch(configs.folderToWatch, {
   ignoreInitial: true
  });
  watcher.on('add', (path) =>
  {
   console.log('File added');
   detector.detect(path).then(data =>
   {
    console.log(data);
    let detection = {
     objects: data,
     imgUrl: path
    };
    socket.emit('detection', detection);
   });
  });
 });
 socket.on('disconnect', () =>
 {
  console.log('Disconnected from socket server');
  watcher.close();
 });
}).catch((err) =>
{
 console.error(err);
});

function getToken()
{
 return new Promise(((resolve, reject) =>
 {
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

  request(options, function(err, res, body)
  {
   if(err)
   {
    console.error(err);
    reject();
   }
   resolve(body.token);
  });
 }));
}