const AWS = require('aws-sdk');
const CloudSearchStream = require('./CloudSearchStream');

class CloudSearch {

  constructor(options) {
    if (!options.endpoint) throw new Error('Endpoint parameter is required.');
    if (!options.region) throw new Error('Region parameter is required.');

    this._connection = this._createConnection(options);
  }

  _createConnection(options) {
    return new AWS.CloudSearchDomain({
      endpoint: options.endpoint,
      region: options.region
    });
  }

  getStream(options) {
    return new CloudSearchStream({
      connection: this._connection,
      objectMode: options.objectMode,
      step: options.step
    })
  }

  search(options, cb) {
    return this._connection.search(options, cb);
  }

  upload(options, cb) {
    return this._connection.uploadDocuments(options, cb);
  }

}

module.exports = CloudSearch;
