const floats = [
  20,
  21,
  22,
  23,
  24,
  1,
  12,
  13,
  75,
  76,
  77,
  78,
  79,
  80,
  81,
  82,
  83,
  84,
  85,
  86,
  87,
  88,
  89,
  90,
];

export function midi_to_param(data) {
  const o = {
    id: null,
    value: null,
  }

  const f = floats.indexOf(data[1]);
  if (f > -1) {
    o.id = f;
    o.value = data[2];
  }

  else if (data[1] === 27) {
    o.id = data[2] + 76;
    o.value = 127;
  }

  else if (data[1] === 28) {
    o.id = data[2] + 76;
    o.value = 0;
  };

  return o;
};

const availableParameterIds = {
  float: [
    { id: 0,  displayName: 'PARAMETER_A' },
    { id: 1,  displayName: 'PARAMETER_B' },
    { id: 2,  displayName: 'PARAMETER_C' },
    { id: 3,  displayName: 'PARAMETER_D' },
    { id: 4,  displayName: 'PARAMETER_E' },
    { id: 5,  displayName: 'PARAMETER_F' },
    { id: 6,  displayName: 'PARAMETER_G' },
    { id: 7,  displayName: 'PARAMETER_H' },
    { id: 8,  displayName: 'PARAMETER_AA'},
    { id: 9,  displayName: 'PARAMETER_AB'},
    { id: 10, displayName: 'PARAMETER_AC'},
    { id: 11, displayName: 'PARAMETER_AD'},
    { id: 12, displayName: 'PARAMETER_AE'},
    { id: 13, displayName: 'PARAMETER_AF'},
    { id: 14, displayName: 'PARAMETER_AG'},
    { id: 15, displayName: 'PARAMETER_AH'},
    { id: 16, displayName: 'PARAMETER_BA'},
    { id: 17, displayName: 'PARAMETER_BB'},
    { id: 18, displayName: 'PARAMETER_BC'},
    { id: 19, displayName: 'PARAMETER_BD'},
    { id: 20, displayName: 'PARAMETER_BE'},
    { id: 21, displayName: 'PARAMETER_BF'},
    { id: 22, displayName: 'PARAMETER_BG'},
    { id: 23, displayName: 'PARAMETER_BH'},
    { id: 24, displayName: 'PARAMETER_CA'},
    { id: 25, displayName: 'PARAMETER_CB'},
    { id: 26, displayName: 'PARAMETER_CC'},
    { id: 27, displayName: 'PARAMETER_CD'},
    { id: 28, displayName: 'PARAMETER_CE'},
    { id: 29, displayName: 'PARAMETER_CF'},
    { id: 30, displayName: 'PARAMETER_CG'},
    { id: 31, displayName: 'PARAMETER_CH'},
    { id: 32, displayName: 'PARAMETER_DA'},
    { id: 33, displayName: 'PARAMETER_DB'},
    { id: 34, displayName: 'PARAMETER_DC'},
    { id: 35, displayName: 'PARAMETER_DD'},
    { id: 36, displayName: 'PARAMETER_DE'},
    { id: 37, displayName: 'PARAMETER_DF'},
    { id: 38, displayName: 'PARAMETER_DG'},
    { id: 39, displayName: 'PARAMETER_DH'}
  ],
  bool: [
    { id: 80, displayName: 'BUTTON_1'},
    { id: 81, displayName: 'BUTTON_2'},
    { id: 82, displayName: 'BUTTON_3'},
    { id: 83, displayName: 'BUTTON_4'},
    { id: 84, displayName: 'BUTTON_5'},
    { id: 85, displayName: 'BUTTON_6'},
    { id: 86, displayName: 'BUTTON_7'},
    { id: 87, displayName: 'BUTTON_8'}
  ]
};

export default availableParameterIds;
