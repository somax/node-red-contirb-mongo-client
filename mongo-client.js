/**
 * MaXiaojun <somaxj@163.com>
**/

module.exports = function (RED) {
  "use strict";

  const mongodb = require('mongodb');

  RED.nodes.registerType("mongo-client", function MongoConfigNode(n) {
    RED.nodes.createNode(this, n);
    this.uri = '' + n.uri;
    if (this.credentials.user || this.credentials.password) {
      this.uri = this.uri.replace(/^mongodb:\/\//, 'mongodb://' + encodeURIComponent(this.credentials.user) + ':' + encodeURIComponent(this.credentials.password) + '@');
    }
    this.name = n.name;
    this.parallelism = n.parallelism * 1;
    if (!!n.options) {
      try {
        this.options = JSON.parse(n.options);
      } catch (err) {
        this.error("Failed to parse options: " + err);
      }
    }
    this.deploymentId = (1 + Math.random() * 0xffffffff).toString(16).replace('.', '');
  }, {
      "credentials": {
        "user": {
          "type": "text"
        },
        "password": {
          "type": "password"
        }
      }
    });


  const mongoPool = {};

  function getClient(config) {
    console.log('=====',{config});
    let poolCell = mongoPool['#' + config.deploymentId];
    if (!poolCell) {
      mongoPool['#' + config.deploymentId] = poolCell = {
        "instances": 0,
        // es6-promise. A client will be called only once.
        "promise": mongodb.MongoClient.connect(config.uri, config.options || {}).then(function (client) {
          const dbName = decodeURIComponent((config.uri.match(/^.*\/([^?]*)\??.*$/) || [])[1] || '');
          const db = client.db(dbName);
          return {
            "client": client,
            "db": db
          };
        })
      };
    }
    poolCell.instances++;
    return poolCell.promise;
  }

  function closeClient(config) {
    const poolCell = mongoPool['#' + config.deploymentId];
    if (!poolCell) {
      return;
    }
    poolCell.instances--;
    if (poolCell.instances === 0) {
      delete mongoPool['#' + config.deploymentId];
      poolCell.promise.then(function (client) {
        client.client.close().catch(function (err) {
          node.error("Error while closing client: " + err);
        });
      }, function () { // ignore error
        // db-client was not created in the first place.
      });
    }
  }

  RED.nodes.registerType("mongo-client in", function MongoInputNode(n) {
    console.log({n});
    RED.nodes.createNode(this, n);
    this.configNode = n.configNode;
    this.collection = n.collection;

    this.config = RED.nodes.getNode(this.configNode);

    if (!this.config || !this.config.uri) {
      this.error("missing mongo-client configuration");
      return;
    }
    const node = this;
    getClient(node.config).then(function (client) {
      let nodeCollection;
      if (node.collection) {
        nodeCollection = client.db.collection(node.collection);
      }

      node.on('input', function (msg) {
        if(nodeCollection){
          node.send({collection: nodeCollection})
        }else{
          node.send(client);
        }


      });

    }, function (err) {
      // Failed to create db client
      node.error(err);
    });

    node.on('close', function () {
      if (node.config) {
        closeClient(node.config);
      }

    });
  });
};
