/*
 * Allowing multiple SoundCloud samples instead of one
 */
db.patches.find({ soundcloud: { $exists: true }}).forEach(function(doc) {
    doc.soundcloud = [ doc.soundcloud ];
    db.patches.save(doc);
});

/*
 * Allowing multiple GitHub files instead of one
 */
