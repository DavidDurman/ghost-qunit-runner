PhantomJS QUnit test runner.
============================

Run QUnit tests in a PhantomJS headless browser with CasperJS.

Dependencies
============

1. PhantomJS >= 1.3 (http://www.phantomjs.org/)
2. CasperJS (http://n1k0.github.com/casperjs/)

Running the tests
=================

`casperjs tests-runner.js "http://www.example.com/tests/index.html" "screenshot.png"`

Features
========

- Run QUnit tests in a headless browser.
- Display colorful results in the command line.
- Display remote (in test) logging in the command line, i.e. console.log() in your tests work as expected.
