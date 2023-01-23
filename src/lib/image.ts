export const useSmallImage = (imagePath: string, width = 500) => {
	const imageName = imagePath.split('/').pop();
	return `/api/image/${imageName}?width=${width}`;
};
