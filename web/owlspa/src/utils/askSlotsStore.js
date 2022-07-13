export default function askSlotsStore() {
	const r = window.prompt('Enter a slot number from 1 to 40', this.props.owlState.nextAvailableSlot);

	const s = parseInt(r);

	if (!(typeof s === 'number' && s > 0 && s < 41)) {
		window.alert('slot must be a number from 1 to 40');
		return;
	}

	const t = this.props.owlState.presets.find(p => p.slot === s);

	if (!t || (t && window.confirm(`Slot ${s} is already taken by '${t.name}'. Overwrite?`)))
		this.props.storePatchInDeviceSlot(this.props.patch, s);
};
