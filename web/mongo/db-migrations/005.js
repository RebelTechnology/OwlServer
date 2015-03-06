// Giving all patches an 'instructions' field
db.patches.update({ instructions: { $exists: false }}, { $set: { instructions: '' }}, { multi: true });