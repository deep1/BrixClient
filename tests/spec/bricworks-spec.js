/* **************************************************************************
 * $Workfile:: bricworks-spec.js                                            $
 * *********************************************************************/ /**
 *
 * @fileoverview BricWorks unit tests
 *
 * Created on	September 17, 2013
 * @author		Michael Jay Lippert
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

'use strict';

(function () {
    var expect = chai.expect;

	var BricWorks = pearson.brix.BricWorks;

    describe('BricWorks: the place to go when you need brix', function () {

        describe('A BricWorks with no registered molds', function () {
			var bricWorks;
			var DummyBricCtor = function (c, e) {this.cfg = c; this.em = e;};

			before(function () {
				bricWorks = new BricWorks({});
			});

			it('should have a registered mold count of 0', function () {
				expect(bricWorks.getMoldCount()).to.equal(0);
			});

			it('should return null when creating a bric', function () {
				expect(bricWorks.createBric('', {})).to.be.null;
			});

			it('should not register a mold with an empty name or any name that isn\'t a string', function () {
				var name = '';
				bricWorks.registerBricMold(name, DummyBricCtor);
				expect(bricWorks.createBric(name, {})).to.be.null;
				expect(bricWorks.getMoldCount()).to.equal(0);

				name = 12;
				bricWorks.registerBricMold(name, DummyBricCtor);
				expect(bricWorks.createBric(name, {})).to.be.null;
				expect(bricWorks.getMoldCount()).to.equal(0);

				name = {name: 'foo'};
				bricWorks.registerBricMold(name, DummyBricCtor);
				expect(bricWorks.createBric(name, {})).to.be.null;
				expect(bricWorks.getMoldCount()).to.equal(0);

				name = null;
				bricWorks.registerBricMold(name, DummyBricCtor);
				expect(bricWorks.createBric(name, {})).to.be.null;
				expect(bricWorks.getMoldCount()).to.equal(0);

				name = undefined;
				bricWorks.registerBricMold(name, DummyBricCtor);
				expect(bricWorks.createBric(name, {})).to.be.null;
				expect(bricWorks.getMoldCount()).to.equal(0);
			});
		});

        describe('A BricWorks with no registered mixes', function () {
			var bricWorks;
			var DummyMortarCtor = function (c, e) {this.cfg = c; this.em = e;};

			before(function () {
				bricWorks = new BricWorks({});
			});

			it('should have a registered mix count of 0', function () {
				expect(bricWorks.getMixCount()).to.equal(0);
			});

			it('should return null when creating a mortar', function () {
				expect(bricWorks.createMortar('', {})).to.be.null;
			});

			it('should not register a mix with an empty name or any name that isn\'t a string', function () {
				var name = '';
				bricWorks.registerMortarMix(name, DummyMortarCtor);
				expect(bricWorks.createMortar(name, {})).to.be.null;
				expect(bricWorks.getMixCount()).to.equal(0);

				name = 12;
				bricWorks.registerMortarMix(name, DummyMortarCtor);
				expect(bricWorks.createMortar(name, {})).to.be.null;
				expect(bricWorks.getMixCount()).to.equal(0);

				name = {name: 'foo'};
				bricWorks.registerMortarMix(name, DummyMortarCtor);
				expect(bricWorks.createMortar(name, {})).to.be.null;
				expect(bricWorks.getMixCount()).to.equal(0);

				name = null;
				bricWorks.registerMortarMix(name, DummyMortarCtor);
				expect(bricWorks.createMortar(name, {})).to.be.null;
				expect(bricWorks.getMixCount()).to.equal(0);

				name = undefined;
				bricWorks.registerMortarMix(name, DummyMortarCtor);
				expect(bricWorks.createMortar(name, {})).to.be.null;
				expect(bricWorks.getMixCount()).to.equal(0);
			});
		});

        describe('A BricWorks with one registered mold', function () {
			var dummyEventMgr = {publish: function () {}, subscribe: function () {}, unsubscribe: function () {}};
			var DummyBricCtor = function (c, e) {this.cfg = c; this.em = e;};
			var BRIC1 = 'bric1';
			var config1 = {foo: 'bar', cnt: 3};
			var bricWorks;

			before(function () {
				bricWorks = new BricWorks({}, dummyEventMgr);
				bricWorks.registerBricMold(BRIC1, DummyBricCtor);
			});

			it('should have a registered mold count of 1', function () {
				expect(bricWorks.getMoldCount()).to.equal(1);
			});

			it('should return null when creating a bric with an unregistered name', function () {
				expect(bricWorks.createBric('foo', {})).to.be.null;
			});

			it('should report that it has a mold for the registered name', function () {
				expect(bricWorks.hasMold(BRIC1)).is.true;
			});

			it('should create the correct bric using the given config and eventmanager' +
			   ' from the bricWorks constructor', function () {
				var mynewbric1 = bricWorks.createBric(BRIC1, config1);
				expect(mynewbric1).to.be.an.instanceOf(DummyBricCtor);
				// the exact config obj param to createBric is passed to the bric ctor.
				expect(mynewbric1.cfg).to.equal(config1);
				// the eventmanager the BricWorks was created with is passed to the bric ctor.
				expect(mynewbric1.em).to.equal(dummyEventMgr);
			});
		});

        describe('A BricWorks with one registered mix', function () {
			var dummyEventMgr = {publish: function () {}, subscribe: function () {}, unsubscribe: function () {}};
			var DummyMortarCtor = function (c, e) {this.cfg = c; this.em = e;};
			var MORTAR1 = 'mortar1';
			var config1 = {foo: 'bar', cnt: 3};
			var bricWorks;

			before(function () {
				bricWorks = new BricWorks({}, dummyEventMgr);
				bricWorks.registerMortarMix(MORTAR1, DummyMortarCtor);
			});

			it('should have a registered mix count of 1', function () {
				expect(bricWorks.getMixCount()).to.equal(1);
			});

			it('should return null when creating a mortar with an unregistered name', function () {
				expect(bricWorks.createMortar('foo', {})).to.be.null;
			});

			it('should report that it has a mix for the registered name', function () {
				expect(bricWorks.hasMix(MORTAR1)).is.true;
			});

			it('should create the correct mortar using the given config and eventmanager' +
			   ' from the bricWorks constructor', function () {
				var mynewmortar1 = bricWorks.createMortar(MORTAR1, config1);
				expect(mynewmortar1).to.be.an.instanceOf(DummyMortarCtor);
				// the exact config obj param to createMortar is passed to the mortar ctor.
				expect(mynewmortar1.cfg).to.equal(config1);
				// the eventmanager the BricWorks was created with is passed to the mortar ctor.
				expect(mynewmortar1.em).to.equal(dummyEventMgr);
			});
		});

        describe('A BricWorks with two registered molds', function () {
			var dummyEventMgr = {publish: function () {}, subscribe: function () {}, unsubscribe: function () {}};
			var DummyBricCtor = function (c, e) {this.cfg = c; this.em = e;};
			var DummyBric2Ctor = function (c, e) {this.cfg2 = c; this.em2 = e;};
			var BRIC1 = 'bric1';
			var BRIC2 = 'bric2';
			var config1 = {foo: 'bar', cnt: 3};
			var config2 = {cow: 'hay', cat: ['mouse', 'frog']};
			var bricWorks;

			before(function () {
				bricWorks = new BricWorks({}, dummyEventMgr);
				bricWorks.registerBricMold(BRIC1, DummyBricCtor);
				bricWorks.registerBricMold(BRIC2, DummyBric2Ctor);
			});

			it('should have a registered mold count of 2', function () {
				expect(bricWorks.getMoldCount()).to.equal(2);
			});

			it('should report that it has a mold for both registered names', function () {
				expect(bricWorks.hasMold(BRIC1)).is.true;
				expect(bricWorks.hasMold(BRIC2)).is.true;
			});

			it('should report that it doesn\'t have a mold for an unregistered name', function () {
				expect(bricWorks.hasMold('foo')).is.false;
			});

			it('should return null when creating a bric with an unregistered name', function () {
				expect(bricWorks.createBric('foo', {})).to.be.null;
			});

			it('should create the correct bric using the given config and eventmanager' +
			   ' from the bricWorks constructor for both registered brics', function () {
				var mynewbric1 = bricWorks.createBric(BRIC1, config1);
				expect(mynewbric1).to.be.an.instanceOf(DummyBricCtor);
				// the exact config obj param to createBric is passed to the bric ctor.
				expect(mynewbric1.cfg).to.equal(config1);
				// the eventmanager the BricWorks was created with is passed to the bric ctor.
				expect(mynewbric1.em).to.equal(dummyEventMgr);

				var mynewbric2 = bricWorks.createBric(BRIC2, config2);
				expect(mynewbric2).to.be.an.instanceOf(DummyBric2Ctor);
				// the exact config obj param to createBric is passed to the bric ctor.
				expect(mynewbric2.cfg2).to.equal(config2);
				// the eventmanager the BricWorks was created with is passed to the bric ctor.
				expect(mynewbric2.em2).to.equal(dummyEventMgr);
			});
		});

        describe('A BricWorks with two registered mixes', function () {
			var dummyEventMgr = {publish: function () {}, subscribe: function () {}, unsubscribe: function () {}};
			var DummyMortarCtor = function (c, e) {this.cfg = c; this.em = e;};
			var DummyMortar2Ctor = function (c, e) {this.cfg2 = c; this.em2 = e;};
			var MORTAR1 = 'mortar1';
			var MORTAR2 = 'mortar2';
			var config1 = {foo: 'bar', cnt: 3};
			var config2 = {cow: 'hay', cat: ['mouse', 'frog']};
			var bricWorks;

			before(function () {
				bricWorks = new BricWorks({}, dummyEventMgr);
				bricWorks.registerMortarMix(MORTAR1, DummyMortarCtor);
				bricWorks.registerMortarMix(MORTAR2, DummyMortar2Ctor);
			});

			it('should have a registered mix count of 2', function () {
				expect(bricWorks.getMixCount()).to.equal(2);
			});

			it('should report that it has a mix for both registered names', function () {
				expect(bricWorks.hasMix(MORTAR1)).is.true;
				expect(bricWorks.hasMix(MORTAR2)).is.true;
			});

			it('should report that it doesn\'t have a mix for an unregistered name', function () {
				expect(bricWorks.hasMix('foo')).is.false;
			});

			it('should return null when creating a mortar with an unregistered name', function () {
				expect(bricWorks.createMortar('foo', {})).to.be.null;
			});

			it('should create the correct mortar using the given config and eventmanager' +
			   ' from the bricWorks constructor for both registered mortars', function () {
				var mynewmortar1 = bricWorks.createMortar(MORTAR1, config1);
				expect(mynewmortar1).to.be.an.instanceOf(DummyMortarCtor);
				// the exact config obj param to createMortar is passed to the bric ctor.
				expect(mynewmortar1.cfg).to.equal(config1);
				// the eventmanager the MortarWorks was created with is passed to the bric ctor.
				expect(mynewmortar1.em).to.equal(dummyEventMgr);

				var mynewmortar2 = bricWorks.createMortar(MORTAR2, config2);
				expect(mynewmortar2).to.be.an.instanceOf(DummyMortar2Ctor);
				// the exact config obj param to createMortar is passed to the bric ctor.
				expect(mynewmortar2.cfg2).to.equal(config2);
				// the eventmanager the MortarWorks was created with is passed to the bric ctor.
				expect(mynewmortar2.em2).to.equal(dummyEventMgr);
			});
		});

        describe('BricWorks.getBricTopic(bricName, eventName, instanceId)', function () {
			var dummyEventMgr = {publish: function () {}, subscribe: function () {}, unsubscribe: function () {}};
			var DummyBricCtor = function (c, e) {this.cfg = c; this.em = e;};
			var DummyBric2Ctor = function (c, e) {this.cfg = c; this.em = e;};
            var fauxTopic = "blah blah blah";
            var passedEventName = null;
            var passedInstanceId = null;
            DummyBric2Ctor.getEventTopic = function (eventName, instanceId)
            {
                passedEventName = eventName;
                passedInstanceId = instanceId;
                return fauxTopic;
            };

			var BRIC1 = 'bric1';
			var BRIC2 = 'bric2';
			var bricWorks;

			before(function () {
				bricWorks = new BricWorks({}, dummyEventMgr);
				bricWorks.registerBricMold(BRIC1, DummyBricCtor); // No getEventTopic
				bricWorks.registerBricMold(BRIC2, DummyBric2Ctor); // Has getEventTopic
			});

			it('should throw an Error if the named bric doesn\'t support getEventTopic', function () {
				expect(goog.bind(bricWorks.getBricTopic, bricWorks, BRIC1, 'event', '12')).to.throw(Error, /'bric1'.+'getEventTopic'/);
			});

			it('should return the value returned from the named bric\'s getEventTopic after passing it the eventName and instanceId', function () {
                var returnedTopic = bricWorks.getBricTopic(BRIC2, 'event2', '14');
				expect(passedEventName).to.equal('event2');
				expect(passedInstanceId).to.equal('14');
				expect(returnedTopic).to.equal(fauxTopic);
			});
		});
    });
})();
