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
// nestor
// ~~~~~~~~~~~~~~~~~~~~~
// Blondinou - blondinou - 117
// Christine Caulfield - chrissie - 100
// Martin Dittus - martind2 - 22
// Oli Larkin - hibrasil - 15

// neb & bella
db.patches.update({ 'author.name': 'Blondinou' },           { $set: { 'author.type': 'wordpress', 'author.wordpressId': 33 }}, { multi: true });
db.patches.update({ 'author.name': 'Christine Caulfield' }, { $set: { 'author.type': 'wordpress', 'author.wordpressId': 37 }}, { multi: true });
db.patches.update({ 'author.name': 'Martin Dittus' },       { $set: { 'author.type': 'wordpress', 'author.wordpressId': 18 }}, { multi: true });
db.patches.update({ 'author.name': 'Oli Larkin' },          { $set: { 'author.type': 'wordpress', 'author.wordpressId': 14 }}, { multi: true });

// nestor
db.patches.update({ 'author.name': 'Blondinou' },           { $set: { 'author.type': 'wordpress', 'author.wordpressId': 117 }}, { multi: true });
db.patches.update({ 'author.name': 'Christine Caulfield' }, { $set: { 'author.type': 'wordpress', 'author.wordpressId': 100 }}, { multi: true });
db.patches.update({ 'author.name': 'Martin Dittus' },       { $set: { 'author.type': 'wordpress', 'author.wordpressId': 22 }}, { multi: true });
db.patches.update({ 'author.name': 'Oli Larkin' },          { $set: { 'author.type': 'wordpress', 'author.wordpressId': 15 }}, { multi: true });