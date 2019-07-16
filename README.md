# node-red-contrib-mongo-client
MongoDB client for Node-RED


## Usage
> Please refer to the [mongoDB node driver 'Collection' documentation](http://mongodb.github.io/node-mongodb-native/3.0/api/Collection.html) to read about each operation.


### function node
```
msg.collection
    .countDocuments()
    .then(r => node.send({ payload:r }) )

```