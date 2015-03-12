// Adding creation time to each patch
db.patches.find().forEach(function(doc) {
    doc.creationTimeUtc = new Date().getTime(); // current date time - already UTC, no need to apply offset
    db.patches.save(doc);
});