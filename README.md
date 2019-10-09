# node-red-contrib-mongo-client
MongoDB client for Node-RED

## install

```js
npm i node-red-contrib-mongo-client -S
```

## Usage
> Please refer to the [mongoDB node driver documentation](http://mongodb.github.io/node-mongodb-native/3.3/api) to read about each operation.


```js
// input
{
    // Any INPUT will be passed to OUTPUT
    payload,
    foo,
    ...
    // If require MongoDb's functions
    require: ['ObjectId','MongoError'],
    // callback function
    callback: function(_msg, _nextNode){
        // _msg: OUTPUT object
        // _nextNode: the MongoClient node
    }
}


// OUTPUT object
{
    // Any 'require' functions from INPUT can be accessed by `db.*()`, for example: `db.ObjectId('xxxx')`
    db,
    // If the 'collectionName' is provided...
    collection

    // Any addition value from INPUT...
    payload,
    foo,
    ...
}

```

### function node
```js
const { ObjectId, db, collection } = msg

collection
    .countDocuments()
    .then( payload => node.send({ payload }) )
    .catch( node.error )

db.collection('collectionName')
    .find({
        _id: ObjectId('5d2d8fba4e15c14483a71500')
    })
    .limit(100)
    .sort({ timestamp: -1 })
    .toArray()
    .then( payload => node.send({ payload }) )
    .catch( node.error )


```