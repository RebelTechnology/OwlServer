// Remove author's names if author is a WP user:
db.patches.update({ 'author.type': 'wordpress'}, { $unset: { 'author.name': 1 }}, { multi: true });

// Remove author type from all authors:
db.patches.update({}, { $unset: { 'author.type': 1 }}, { multi: 1 });
