# node-red-contrib-mongo-client
MongoDB client for Node-RED


## Usage
> Please refer to the [mongoDB node driver 'Collection' documentation](http://mongodb.github.io/node-mongodb-native/3.0/api/Collection.html) to read about each operation.


Any INPUT will be passed to OUTPUT, and the extra will increase the following parameters:
```js
{
    ...
    client,
    collection // If the 'collectionName' is provided
}

```

### function node
```js
if(msg.collection){
    msg.collection
        .countDocuments()
        .then(r => node.send({ payload:r }) )
}

// or

msg.client.db('dbName').collection('collectionName')
    .find()
    .toArray()
    .then(...)
```