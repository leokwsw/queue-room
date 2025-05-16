const fs = require('fs');
const archiver = require('archiver');

const output = fs.createWriteStream(
  __dirname + '/queue-room-lambda-layer.zip',
);
const archive = archiver('zip', {
  zlib: { level: 9 }, // Sets the compression level.
});

archive.directory('node_modules/', 'nodejs/node_modules');

output.on('close', function () {
  console.log(archive.pointer() + ' total bytes');
  console.log(
    'archiver has been finalized and the output file descriptor has closed.',
  );
});

archive.pipe(output);

archive.finalize();
