const AWS = require('aws-sdk');
const Stream = require('stream');

class CloudSearchStream extends Stream.Readable {

  constructor(options) {
    super(options);

    this._connection = options.connection;
    this._step = options.step || 500;
    this._processed = 0;

    this.fetch('initial', err => {
      if (err) {
        return process.nextTick(() => this.emit('error', err));
      }

      this.push(null);
    });
  }

  _read(size) {
    //
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
  fetch(cursor, done) {
    let params = {
      query: '*',
      cursor: cursor,
      queryParser: 'lucene',
      size: this._step
    };

    this._connection.search(params, (err, data) => {
      if (err) return done(err);

      const total = data.hits.found;
      const documents = data.hits.hit;

      this._process(documents, total);

      if (this._allDocumentsProcessed(total)) {
        return done(null);
      }

      this.fetch(data.hits.cursor, done);
    });
  }

  _process(documents, total) {
    this._processed += documents.length;

    this.push(JSON.stringify({
      documents: documents,
      processed: this._processed,
      total: total
    }));
  }

  _allDocumentsProcessed(total) {
    return this._processed >= total;
  }

}

module.exports = CloudSearchStream;
