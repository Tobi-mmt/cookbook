export const getImagePath = (imagePath: string, width = 500) => {
	const imageName = imagePath.split('/').pop();
	return `/api/image/${imageName}?width=${width}`;
};

export const getSourceSet = (
	imagePath: string,
	imageSizes = [300, 880, 1210, 1470, 1680, 1870, 2048]
) => {
	return imageSizes.map((size) => `${getImagePath(imagePath, size)} ${size}w`).join(', ');
};
