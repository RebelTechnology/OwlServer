// adding new "public" field
db.patches.update({}, { $set: { public: true}}, { multi: true });