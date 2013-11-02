#!/usr/bin/env node

var core = require('anna-core');
var shared = require('anna-shared');
var config = require('./config.json');
var pkg = require('./package.json');

var anna = new core.Anna(config);
anna.run();
