/// <reference path="../_ref.d.ts" />

'use strict';

import path = require('path');
import Promise = require('bluebird');
import DH = require('definition-header');

import File = require('../file/File');
import util = require('../util/util');

import ITestOptions = require('../test/ITestOptions');
import TestResult = require('../test/TestResult');
import TestSuiteBase = require('../suite/TestSuiteBase');

var isDef = /^[\w\.-]+[\\\/][\w\.-]+\.d\.ts$/;

/////////////////////////////////
// Compile with *-tests.ts
/////////////////////////////////
class HeaderSuite extends TestSuiteBase {

	dtPath: string;

	constructor(options: ITestOptions, dtPath: string) {
		super(options, 'Header format', 'Invalid header');
		this.dtPath = dtPath;
	}

	public filterTargetFiles(files: File[]): Promise<File[]> {
		return Promise.resolve(files.filter((file) => {
			return isDef.test(file.filePathWithName);
		}));
	}

	public runTest(targetFile: File): Promise<TestResult> {
		console.log(targetFile.filePathWithName);

		return util.readFile(path.join(this.dtPath, targetFile.filePathWithName)).then((content) => {
			var testResult = new TestResult();
			testResult.hostedBy = this;
			testResult.targetFile = targetFile;

			if (DH.isPartial(content)) {
				testResult.exitCode = 0;
			}
			else {
				var result = DH.parse(content);
				if (result.success) {
					testResult.exitCode = 0;
				}
				else {
					testResult.exitCode = 1;
					testResult.stderr = '\n' + result.details;
				}
			}

			this.testResults.push(testResult);

			return testResult;
		});
	}
}

export = HeaderSuite;
