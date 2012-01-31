// Configure Casper.
// -----------------

// Timeout. 50s should be enough.
var timeout = 50000;//ms

var casper = require('casper').create({
    viewportSize: { width: 1280, height: 1024 },
    verbose: false,
    timeout: timeout,
    logLevel: 'debug'
});

casper.on('remote.message', function(message) {
    casper.echo('Remote message: ' + message);
});
casper.on('die', function(message, status) {
    casper.echo('Ooops, Casper died. ' + message + '; status=' + status, 'ERROR');
});
casper.on('load.fail', function(obj) {
    casper.echo('Load failure.');
    casper.echo(obj);
});
casper.on('step.timeout', function() {
    casper.echo('Ooops, a step function execution time exceeds the stepTimeout.', 'ERROR');
});

var url = casper.cli.args[0],
    screenshot = casper.cli.args[1];

// Collect results.
// ----------------

function getTestResult() {

    var failures = [],
        failElements = document.querySelectorAll('#qunit-tests > .fail'),
        forEach = Array.prototype.forEach;

    // Get text content of an element pointed to by `selector` in the context of `fail`.
    function t(selector, fail) {
        var el = fail.querySelector(selector);
        return el ? el.textContent : 'UNKNOWN';
    }

    // For all tests.
    forEach.call(failElements, function(fail) {
        var info = {
            module: t('.module-name', fail),
            test:   t('.test-name',   fail),
            tests:  []
        };

        // For all asserts.
        var assertElements = fail.querySelectorAll('ol > .fail');
        forEach.call(assertElements, function(assert) {
            var simple = (assert.childElementCount == 0),
                oneTest = {
                    msg: simple ? assert.textContent : t('.test-message', assert),
                    expected: simple ? '' : t('.test-expected > td > pre', assert),
                    actual:   simple ? '' : t('.test-actual > td > pre', assert),
                    diff: {
                        del: t('.test-diff del', assert),
                        ins: t('.test-diff ins', assert)
                    }
                };
            info.tests.push(oneTest);
        });
        
        failures.push(info);
    });
    
    return {
        total: document.querySelector('#qunit-testresult > .total').textContent,
        passed: document.querySelector('#qunit-testresult > .passed').textContent,
        failed: document.querySelector('#qunit-testresult > .failed').textContent,
        failures: failures
    };
}

function stopCondition(self) {
    return self.evaluate(function() {
        return document.querySelector('#qunit-banner').className != '';
    });
}

function printResults(self) {
    var result = self.evaluate(getTestResult);

    result.failures.forEach(function(fail) {
        casper.echo('\n' + fail.module + ' > ' + fail.test, 'WARNING');
        fail.tests.forEach(function(test) {
            casper.echo(' |_ ' + test.msg, 'PARAMETER');
            casper.echo('\tExpected: ' + test.expected, 'INFO');
            casper.echo('\tActual: ' + test.actual, 'WARNING');
        });
    });

    
    casper.echo('\nTotal: ' + result.total, 'COMMENT');
    casper.echo('Passed: ' + result.passed, 'INFO');
    casper.echo('Failed: ' + result.failed, 'WARNING');

    casper.echo('\nSee screenshot ' + screenshot);
    
    self.captureSelector(screenshot, '#qunit-tests');
}

function printError() {
    casper.echo('Oops. The run exceeded timeout specified (' + timeout + 'ms). Set a higher one.');
}

// Run tests.
// ----------
casper.test.comment('Running unit tests... ' + url);

casper.start(url, function(self) {
    self.waitFor(stopCondition, printResults, printError, timeout);
});

casper.run();
