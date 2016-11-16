function uploadStream() {
  const cs = new CloudSearch({
    endpoint: 'search-test-hjp7plskkkzj5zhe7taidjswkq.eu-west-1.cloudsearch.amazonaws.com',
    region: 'eu-west-1'
  });

  console.log(' -> Preparing data..');

  const $input = fs.createReadStream('./data/test.json', {encoding: 'utf-8'});
  const uploader = Uploader(cs, {maxConcurrency: 10});

  $input
    .pipe(JSONStream.parse('*'))
    .pipe(Batcher({bufferSize: 500}))
    .pipe(uploader)
    .pipe(UploadStats())
    .pipe(JSONStream.stringify())
    .pipe(fs.createWriteStream('./data/upload-results.json'));

  miss.finished(uploader, err => {
    err && console.log(err);

    console.log('\n -> Done!');
  });
}
