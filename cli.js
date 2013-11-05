#!/usr/bin/env node

var cmd = require('commander');
var path = require('path');
var fs = require('fs');
var wrench = require('wrench');
var exec = require('child_process').exec;
var pkg = require('./package.json');

cmd
	.command('run')
	.description('Run webserver on Anna-enabled project')
	.option('-d, --directory [directory]', 'Working directory [current]', './')
	.action(function (env) {
		var workingDir = path.resolve(env.directory);
		if (fs.existsSync(workingDir)) {
			console.error("Starting Anna-enabled webserver...");
			runServer(workingDir);
		} else {
			console.error("Directory", workingDir, "doesn't exist");
		}
	});

cmd
    .command('generate')
    .description('Generate empty project')
    .option('-d, --directory [directory]', 'Target directory [current]', './')
    .option('-f, --force', 'Don\'t check target direcroty existence and recreate it (DANGER!)')
	.action(function (env) {
		var workingDir = path.resolve(env.directory);
		var skelDir = path.resolve(path.resolve(path.join(__dirname, "skel")));
		if (!!env.force || !fs.existsSync(workingDir)) {
			if (env.force) {
				console.warn("WARNING: Directory will be recreated!");
			}
			generateEmptyProject(skelDir, workingDir);
		} else {
			console.error("Directory", workingDir, "exist. Aborting.");
		}
	});

function generateEmptyProject (skelDir, targetDir) {
	console.log("Generating empty project");
	wrench.copyDirRecursive(skelDir, targetDir, {
		forceDelete: true,
		excludeHiddenUnix: true,
		preserveFiles: false,
		inflateSymlinks: true
	}, function (err) {
		if (err) {
			console.error("ERROR:", err.message);
		} else {
			console.log("Done. Now, go to the", targetDir, "and run 'npm install' to finish the process.");
		}
	});
}

function runServer (workingDir) {
	try {
		process.chdir(workingDir);

		if (!fs.existsSync("./index.js")) {
			throw new Error("index.js doesn't exist (probably "+workingDir+' is not an Anna-enabled project\'s directory)');
		}

		var child = exec("/usr/bin/env node index.js", function (err, stdout, stderr) {
			if (err) throw err;
		});
		child.stdout.pipe(process.stdout);
		child.stderr.pipe(process.stderr);
	} catch (err) {
		console.error("Cannot run webserver:", err.code ? err.code : "", err.message);
	}
}

cmd
    .version(pkg.version)
    .parse(process.argv);

if (cmd.args.length === 0) {
	cmd.help();
}
