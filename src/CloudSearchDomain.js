const AWS = require('aws-sdk');
const Promise = require('bluebird');
const Stream = require('stream');

class CloudSearchDomain {

  constructor(config) {
    if (!config.endpoint) throw new Error('Endpoint parameter is required.')
    if (!config.region) throw new Error('Region parameter is required.')

    this._connection = this._createConnection(config);
    this._log = config.log;
  }

  _createConnection(config) {
    return new AWS.CloudSearchDomain({
      endpoint: config.endpoint,
      region: config.region
    });
  }

  search(params, cb) {
    return this._connection.search(params, cb);
  }

  /**
   * Fetch all documents from CloudSearch.
   *
   * @param documents Fetched documents
   * @param cursor    Iteration cursor
   * @param step      How many documents to fetch per iteration (10k limit)
   * @param processed How many documents has alredy been processed
   *
   * @return          Promise
   */
  fetch(documentStream, cursor, step, processed, done) {
    let params = {
      query: '*',
      cursor: cursor,
      queryParser: 'lucene',
      size: step
    };

    this.search(params, (err, data) => {
      if (err) return done(err);

      let total = data.hits.found;
      documentStream.write(JSON.stringify(data.hits.hit));
      processed += step;

      console.log(`Processed ${processed} of ${total}`);

      // All the documents have been processed
      if (processed >= total) {
        return done(null, documentStream);
      }

      this.fetch(documentStream, data.hits.cursor, step, processed, done);
    });
  }

  upload(params) {
    return this._connection.uploadDocuments(params, cb);
  }

}

module.exports = CloudSearchDomain;
