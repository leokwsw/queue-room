const fs = require('fs');
const archiver = require('archiver');

const output = fs.createWriteStream(__dirname + '/queue-room-lambda.zip');
const archive = archiver('zip', {
  zlib: { level: 9 }, // Sets the compression level.
});

output.on('close', function () {
  console.log(archive.pointer() + ' total bytes');
  console.log(
    'archiver has been finalized and the output file descriptor has closed.',
  );
});

archive.pipe(output);

archive.glob('**/*', {
  dot: true,
  cwd: __dirname,
  ignore: ['node_modules/**', 'nodejs/**', '*.zip', '.git/**', '.env'],
});

archive.finalize();
