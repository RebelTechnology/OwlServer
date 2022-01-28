export default function formatBytes(v, decimals = 2) {
  v = +v;

  if (v === 0 || isNaN(v))
    return {
      amount: 0,
      unit: "Bytes",
      string: "0 Bytes",
    };

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
