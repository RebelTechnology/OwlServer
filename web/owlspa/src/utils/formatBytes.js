export default function formatBytes(v, decimals = 2) {
	if (v === 0) return '0 Bytes';

	const sizes = ['Bytes', 'KB', 'MB', 'GB'];

	const i = Math.floor(Math.log(v) / Math.log(1024));

	const amount = parseFloat((v / Math.pow(1024, i)).toFixed(decimals));
	const unit = sizes[i];

	return {
		amount,
		unit,
		string: amount + unit,
	};
};
