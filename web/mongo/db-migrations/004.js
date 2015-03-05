// Remove field author.url:
db.patches.update({'author.url' : { $exists: true }}, { $unset: { 'author.url': true }}, { multi: true });

// Associate authors to WP user IDs
//
// neb & bella
// ~~~~~~~~~~~
// Blondinou - blondinou - 33
// Christine Caulfield - chrissie - 37
// Martin Dittus - martind2 - 18
// Oli Larkin - hibrasil - 14
//
// buenaventura & nestor
// ~~~~~~~~~~~~~~~~~~~~~
// Blondinou - blondinou - 117
// Christine Caulfield - chrissie - 100
// Martin Dittus - martind2 - 22
// Oli Larkin - hibrasil - 15

db.patches.update({ 'author.name': 'Blondinou' },           { $set: { 'author.type': 'wordpress', 'author.wordpress_id': 33 }}, { multi: true });
db.patches.update({ 'author.name': 'Christine Caulfield' }, { $set: { 'author.type': 'wordpress', 'author.wordpress_id': 37 }}, { multi: true });
db.patches.update({ 'author.name': 'Martin Dittus' },       { $set: { 'author.type': 'wordpress', 'author.wordpress_id': 18 }}, { multi: true });
db.patches.update({ 'author.name': 'Oli Larkin' },          { $set: { 'author.type': 'wordpress', 'author.wordpress_id': 14 }}, { multi: true });

// db.patches.update({ 'author.name': 'Blondinou' },           { $set: { 'author.type': 'wordpress', 'author.wordpress_id': 117 }}, { multi: true });
// db.patches.update({ 'author.name': 'Christine Caulfield' }, { $set: { 'author.type': 'wordpress', 'author.wordpress_id': 100 }}, { multi: true });
// db.patches.update({ 'author.name': 'Martin Dittus' },       { $set: { 'author.type': 'wordpress', 'author.wordpress_id': 22 }}, { multi: true });
// db.patches.update({ 'author.name': 'Oli Larkin' },          { $set: { 'author.type': 'wordpress', 'author.wordpress_id': 15 }}, { multi: true });