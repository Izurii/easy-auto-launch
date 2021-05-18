/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let executablePath;
const chai = require('chai');
const path = require('path');
const {
    expect
} = chai;
const AutoLaunch = require('../src/');
const AutoLaunchHelper = require('./helper');

let isMac = false;

if (/^win/.test(process.platform)) {
    executablePath = path.resolve(path.join('./tests/executables', 'GitHubSetup.exe'));
} else if (/darwin/.test(process.platform)) {
    isMac = true;
    executablePath = '/Applications/Calculator.app';
} else if (/linux/.test(process.platform)) {
    executablePath = path.resolve(path.join('./tests/executables', 'hv3-linux-x86'));
}

console.log("Executable being used for tests:", executablePath);

describe('easy-auto-launch', function() {
    let autoLaunch = null;
    let autoLaunchHelper = null;


    beforeEach(function() {
        autoLaunch = new AutoLaunch({
            name: 'easy-auto-launch test',
            path: executablePath
        });
        return autoLaunchHelper = new AutoLaunchHelper(autoLaunch);
    });


    describe('.isEnabled', function() {
        beforeEach(() => autoLaunchHelper.ensureDisabled());

        it('should be disabled', function(done) {
            autoLaunch.isEnabled().then(function(enabled) {
                expect(enabled).to.equal(false);
                return done();}).catch(done);
        });

        return it('should catch errors', function(done) {
            autoLaunchHelper.mockApi({
                isEnabled() {
                    return Promise.reject();
                }
            });

            autoLaunch.isEnabled().catch(done);
        });
    });


    describe('.enable', function() {
        beforeEach(() => autoLaunchHelper.ensureDisabled());

        it('should enable auto launch', function(done) {
            autoLaunch.enable()
            .then(() => autoLaunch.isEnabled())
            .then(function(enabled) {
                expect(enabled).to.equal(true);
                return done();}).catch(done);
        });

        return it('should catch errors', function(done) {
            autoLaunchHelper.mockApi({
                enable() { return Promise.reject(); }});

            autoLaunch.enable().catch(done);
        });
    });


    describe('.disable', function() {
        beforeEach(() => autoLaunchHelper.ensureEnabled());

        it('should disable auto launch', function(done) {
            autoLaunch.disable()
            .then(() => autoLaunch.isEnabled())
            .then(function(enabled) {
                expect(enabled).to.equal(false);
                return done();}).catch(done);
        });

        return it('should catch errors', function(done) {
            autoLaunchHelper.mockApi({
                disable() {
                    return Promise.reject();
                }
            });

            autoLaunch.disable().catch(done);
        });
    });




    // Let's test some Mac-only options
    if (!isMac) { return; }

    return describe('mac.useLaunchAgent', function() {
        let autoLaunchWithLaunchAgent = null;
        let autoLaunchWithLaunchAgentHelper = null;

        beforeEach(function() {
            autoLaunchWithLaunchAgent = new AutoLaunch({
                name: 'easy-auto-launch test',
                path: executablePath,
                mac: {
                    useLaunchAgent: true
                }
            });
            return autoLaunchWithLaunchAgentHelper = new AutoLaunchHelper(autoLaunchWithLaunchAgent);
        });

        describe('.isEnabled', function() {
            beforeEach(() => autoLaunchWithLaunchAgentHelper.ensureDisabled());

            it('should be disabled', function(done) {
                autoLaunchWithLaunchAgent.isEnabled().then(function(enabled) {
                    expect(enabled).to.equal(false);
                    return done();}).catch(done);
            });

            return it('should catch errors', function(done) {
                autoLaunchWithLaunchAgentHelper.mockApi({
                    isEnabled() { return Promise.reject(); }});

                autoLaunchWithLaunchAgent.isEnabled().catch(done);
            });
        });


        describe('.enable', function() {
            beforeEach(() => autoLaunchWithLaunchAgentHelper.ensureDisabled());

            it('should enable auto launch', function(done) {
                autoLaunchWithLaunchAgent.enable().then(() => autoLaunchWithLaunchAgent.isEnabled().then(function(enabled) {
                    expect(enabled).to.equal(true);
                    return done();
                })).catch(done);
            });

            return it('should catch errors', function(done) {
                autoLaunchWithLaunchAgentHelper.mockApi({
                    enable() { return Promise.reject(); }});

                autoLaunchWithLaunchAgent.enable().catch(done);
            });
        });


        return describe('.disable', function() {
            beforeEach(() => autoLaunchWithLaunchAgentHelper.ensureEnabled());

            it('should disable auto launch', function(done) {
                autoLaunchWithLaunchAgent.disable()
                .then(() => autoLaunchWithLaunchAgent.isEnabled())
                .then(function(enabled) {
                    expect(enabled).to.equal(false);
                    return done();}).catch(done);
            });

            return it('should catch errors', function(done) {
                autoLaunchWithLaunchAgentHelper.mockApi({
                    disable() { return Promise.reject(); }});

                autoLaunchWithLaunchAgent.disable().catch(done);
            });
        });
    });
});
