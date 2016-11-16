const program = require('commander');
const export = require('./controllers/export.js')
const import = require('./controllers/import.js')

program
  .version('1.0.1')
  .option('-C, --chdir <path>', 'change the working directory')
  .option('-c, --config <path>', 'set config path. defaults to ./deploy.conf')
  .option('-T, --no-tests', 'ignore test hook')

program
  .command('export <CLOUD_SEARCH_ENDPOINT>')
  .description('Export data from CloudSearch to file')
  .action(function(cmd, options) {
    console.log('exporting data from "%s"', cmd);
  }).on('--help', function() {
    console.log('  Examples:');
    console.log();
    console.log('    $ deploy exec sequential');
    console.log('    $ deploy exec async');
    console.log();
  });

program.parse(process.argv);
