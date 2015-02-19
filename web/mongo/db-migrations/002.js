/*
 * Rename field bytesWithGain -> bytes
 */

db.patches.update({ bytesWithGain: { $exists: 1 }}, { $rename: { 'bytesWithGain': 'bytes' }}, { multi: true });

/*
 * Rename field armCyclesPerSample -> cycles
 */

db.patches.update({ armCyclesPerSample: { $exists: 1 }}, { $rename: { 'armCyclesPerSample': 'cycles' }}, { multi: true });