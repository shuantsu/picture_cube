fetch('texture-instructions.md')
	.then(r => r.text())
	.then(md => document.getElementById('instructionsContent').innerHTML = marked.parse(md))
	.catch(() => document.getElementById('instructionsContent').innerHTML = '<p>Instructions file not found.</p>');