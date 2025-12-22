import sharp from 'sharp';

const argument = process.argv[2];
if (!argument) {
	console.log('No argument');
	process.exit(1);
}
if (!argument.startsWith('src/lib/recipes/')) {
	console.log('Invalid argument. Image path must start with "src/lib/recipes/"');
	process.exit(1);
}
let buffered = await sharp(argument).resize(15).toBuffer();
console.log(`data:image/png;base64,${buffered.toString('base64')}`);
