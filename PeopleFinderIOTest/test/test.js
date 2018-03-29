// Setup env
let envPath = __dirname + "/test.env";
require('dotenv').config({path:envPath});

// Node packages
const assert = require('assert');

// Controllers
const util = require('./../controllers/util');

describe('util', function() {
    describe('public:', function() {
        describe('#getDomain(url)', function() {
            it('should return domain part of url', function() {
                assert.equal(util.getDomain("example.com/dummy/index.html"), "example.com");
                assert.equal(util.getDomain("www.fr.example.com/dummy/index.html"), "example.com");
                assert.equal(util.getDomain("https://www.fr.example.com/dummy/index.html"), "example.com");
            });
        });
        describe('#getSubdomain(url)', function() {
            it('should return subdomain part of url', function() {
                assert.equal(util.getSubdomain("example.com/dummy/index.html"), "");
                assert.equal(util.getSubdomain("www.fr.example.com/dummy/index.html"), "www.fr");
                assert.equal(util.getSubdomain("https://www.fr.example.com/dummy/index.html"), "www.fr");
            });
        });
        describe('#getDomainWithSubdomain(url, considerWWWASubdomain)', function() {
            it('should return domain and subdomain part of url', function() {
                assert.equal(util.getDomainWithSubdomain("example.com/dummy/index.html", true), "example.com");
                assert.equal(util.getDomainWithSubdomain("www.fr.example.com/dummy/index.html", true), "www.fr.example.com");
                assert.equal(util.getDomainWithSubdomain("https://www.fr.example.com/dummy/index.html", true), "www.fr.example.com");
                assert.equal(util.getDomainWithSubdomain("https://www.fr.example.com/dummy/index.html", false), "fr.example.com");
            });
        });
        describe('#getRootUrl(url)', function() {
            it('should return root of url', function() {
                assert.equal(util.getRootUrl("example.com/dummy/index.html"), "http://www.example.com");
                assert.equal(util.getRootUrl("fr.example.com/dummy/index.html"), "http://fr.example.com");
                assert.equal(util.getRootUrl("www.fr.example.com/dummy/index.html"), "http://www.fr.example.com");
                assert.equal(util.getRootUrl("https://www.fr.example.com/dummy/index.html"), "https://www.fr.example.com");
            });
        });
        describe('#replaceUndefinedbyEmptyString(value)', function() {
            it('should return value or empty if no value', function() {
                assert.strictEqual(util.replaceUndefinedbyEmptyString(undefined), "");
                assert.strictEqual(util.replaceUndefinedbyEmptyString("example string"), "example string");
                assert.strictEqual(util.replaceUndefinedbyEmptyString(0), 0);
            });
        });
        describe('#getAbbreviationForState(state)', function() {
            it('should return abbreviation for state', function() {
                assert.equal(util.getAbbreviationForState("Alabama"), "AL");
                assert.equal(util.getAbbreviationForState("Texas"), "TX");
                assert.equal(util.getAbbreviationForState("Wyoming"), "WY");
                assert.equal(util.getAbbreviationForState("not a state"), undefined);
            });
        });
    });
});