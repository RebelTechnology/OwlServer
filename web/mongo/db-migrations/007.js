// adding new "published" field
db.patches.update({}, { $set: { published: true}}, { multi: true });