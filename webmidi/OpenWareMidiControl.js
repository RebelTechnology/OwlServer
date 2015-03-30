
var MIDI_SYSEX_MANUFACTURER        = 0x7d;     /* Educational or development use only */
var MIDI_SYSEX_DEVICE              = 0x52;     /* OWL Open Ware Laboratory */
var MIDI_SYSEX_VERSION             = 0x03;     /* Revision */
var MIDI_MAX_MESSAGE_SIZE          = 0x0f;

var OpenWareMidiSysexCommand = {
  SYSEX_PRESET_NAME_COMMAND       : 0x01,
  SYSEX_PARAMETER_NAME_COMMAND    : 0x02,
  SYSEX_DFU_COMMAND               : 0x7e,
  SYSEX_FIRMWARE_VERSION          : 0x20,
  SYSEX_DEVICE_ID                 : 0x21,
  SYSEX_SELFTEST                  : 0x22
};

var OpenWareMidiControl = {
  PATCH_PARAMETER_A      : 20, /* Parameter A */
  PATCH_PARAMETER_B      : 21, /* Parameter B */
  PATCH_PARAMETER_C      : 22, /* Parameter C */
  PATCH_PARAMETER_D      : 23, /* Parameter D */
  PATCH_PARAMETER_E      : 24, /* Expression pedal / input */
  PATCH_BUTTON           : 25, /* LED Pushbutton: 0=not pressed, 127=pressed */
  PATCH_CONTROL          : 26, /* Remote control: 0=local, 127=MIDI */
  PATCH_MODE             : 27, /* 0-31 : single,
				* 32-63 : dual,
				* 64-95 : series,
				* 96-127 : parallel
				*/
  PATCH_SLOT_GREEN       : 28, /* load patch into green slot */
  PATCH_SLOT_RED         : 29, /* load patch into red slot */

  LED                    : 30, /* set/get LED value: 
				* 0-41 : off
				* 42-83 : green
				* 84-127 : red 
				*/
  ACTIVE_SLOT            : 31, /* currently active slot: 0 for green slot, 127 for red */

  LEFT_INPUT_GAIN        : 32, /* left channel input gain, -34.5dB to +12dB (92 : 0dB) */
  RIGHT_INPUT_GAIN       : 33,
  LEFT_OUTPUT_GAIN       : 34, /* left channel output gain, -73dB to +6dB (121 : 0dB) */
  RIGHT_OUTPUT_GAIN      : 35,
  LEFT_INPUT_MUTE        : 36, /* mute left input (127=muted) */
  RIGHT_INPUT_MUTE       : 37,
  LEFT_OUTPUT_MUTE       : 38, /* mute left output (127=muted) */
  RIGHT_OUTPUT_MUTE      : 39,
  BYPASS                 : 40, /* codec bypass mode (127=bypass) */

  CODEC_MASTER           : 41, /* codec mode, slave or master:
				* 0-63 : slave
				* 64-127 : master
				*/
  CODEC_PROTOCOL         : 42, /* codec protocol: 
				* 0-63 : I2S Philips
				* 64-127 : MSB
				*/
  SAMPLING_RATE          : 60, /* sampling rate
				* 0-31 : 8kHz
				* 32-63 : 32kHz
				* 64-95 : 48kHz
				* 96-127 : 96kHz
				*/
  SAMPLING_BITS          : 61, /* sampling bits
				* 0-41 : 16bit
				* 42-83 : 24bit
				* 84-127 : 32bit
				*/
  SAMPLING_SIZE          : 62, /* block size in samples */

  LEFT_RIGHT_SWAP        : 63, /* swap left/right channels */

  REQUEST_SETTINGS       : 67, /* load settings from device (127=all settings) (30 for LED) (more to come) */
  SAVE_SETTINGS          : 68, /* save settings to device */
  DEVICE_FIRMWARE_UPDATE : 69, /* enter Device Firmware Upgrade mode */
  FACTORY_RESET          : 70  /* reset all settings */
};
