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
db.patches.find({ github: { $exists: true }}).forEach(function(doc) {
    doc.github = [ doc.github ];
    db.patches.save(doc);
});

/*
 * Changing format of GitHb files
 */
db.patches.find({ github: { $exists: true }}).forEach(function(doc) {
    var file = 'https://github.com/' + doc.repo + '/blob/master/' + doc.github[0];
    doc.github = [ file ];
    db.patches.save(doc);
});

/*
 * Delete old repository information
 * 
 * RUN AS A SEPARATE STEP!!!
 */
db.patches.update({}, { $unset: { repo: "" }}, { multi: true });