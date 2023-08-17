const fs = require('fs');
const server = require('http').createServer();

server.on('request', (req, res) => {
	// Solution one
	// fs.readFile(`${__dirname}/test-file.txt`, (err, data) => {
	// 	if (err) console.log(err);
	// 	res.end(data);
	// });
	// Solution two
	// const readable = fs.createReadStream(`${__dirname}/test-file.txt`);
	// readable.on('data', (chunk) => {
	// 	res.write(chunk);
	// });
	// readable.on('end', () => {
	// 	res.end();
	// });
	// readable.on('error', (err) => {
	// 	console.log(err);
	// 	res.statusCode = 500;
	// 	res.end('File not found');
	// });
	// Solution 3 - readableSource.pipe(writeableDestination)
	const readable = fs.createReadStream(`${__dirname}/test-file.txt`);
	readable.pipe(res);
});

server.listen(8000, '127.0.0.1', () => {
	console.log('Listening...');
});
