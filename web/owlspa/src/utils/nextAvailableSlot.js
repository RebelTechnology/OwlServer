export default function nextAvailableSlot(presets) {
	for (let i = 1; i <= 40; i++)
		if (!presets.find(p => p.slot === i)) return i;

	return undefined;
};
