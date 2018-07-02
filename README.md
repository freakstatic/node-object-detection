# Node Object Detection
This project uses the [node-yolo](https://github.com/rcaceiro/node-yolo), a Node.js Addon to detect objects in a picture. <br/>
Is part of the [vapi-server](https://github.com/freakstatic/vapi-server).

### Installing
```
npm install
```

## Deployment
```
npm start
```


### Config File
```
config.json
```


### Docker
You can also use the node-object-detection with Docker
#### CUDA
Build the container
```
cd docker/cuda && docker-compose build
```
Run it
```
docker run --runtime=nvidia -v <Motion output folder>:<Motion output folder> vapi/node-object-detection-cuda
```

#### CPU
Build the container image for CPU
```
cd docker/cpu && docker-compose build
```

Run it
```
docker run -v <Motion output folder>:<Motion output folder> vapi/node-object-detection
```