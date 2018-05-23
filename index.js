const fs = require('fs');
const configs = JSON.parse(fs.readFileSync('config.json', 'utf8'));

const io = require('socket.io-client');
const socket = io(configs.socketServerURL);

const chokidar = require('chokidar');

let yolo = require('node-yolo');

let detector = new yolo('darknet-configs', 'cfg/coco.data', 'cfg/yolov3.cfg', 'yolov3.weights');

let watcher;
socket.on('connect', () =>
{
 console.log('Connected to socket server');
 socket.emit('authenticate', {username: 'yolo', password: 'yolo'});
 watcher = chokidar.watch(configs.folderToWatch, {
  ignoreInitial: true,
  awaitWriteFinish: true
 });
 watcher.on('add', (path) =>
 {
  console.log('File added');
  detector.detect(path).then(data =>
  {
   console.log(data);
   socket.emit('detection', data);
  });
 });
});

socket.on('reconnect', () =>
{
 console.log('Reconnected to socket server');
 socket.emit('authenticate', {username: 'yolo', password: 'yolo'});
});

socket.on('disconnect', () =>
{
 console.log('Disconnected from socket server');
 watcher.close();
});