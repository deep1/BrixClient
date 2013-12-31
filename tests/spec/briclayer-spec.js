/* **************************************************************************
 * briclayer-spec.js                                                        *
 * *********************************************************************/ /**
 *
 * @fileoverview BricLayer unit tests
 *
 * Created on   September 17, 2013
 * @author      Michael Jay Lippert
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

'use strict';

goog.require('goog.object');

(function () {
    var expect = chai.expect;

    var BricLayer = pearson.brix.BricLayer;

    var createActivityConfigSkeleton = function ()
    {
        var activityConfig =
            {
                "sequenceNodeKey": "seq key",
                "containerConfig":
                    [
                        {
                            "containerId": "container1",
                            "brixConfig": [],
                            "mortarConfig": [],
                            "hookupActions": []
                        }
                    ]
            };

        return activityConfig;
    };

    describe('BricLayer: who do ya call when you need a brix house? BricLayer!', function () {
        var dummyEventMgr = {publish: function () {}, subscribe: function () {}, unsubscribe: function () {}};
        var DummyBricCtor = function (c, e) {this.cfg = c; this.em = e;};
        var DummyMortarCtor = function (c, e) {this.cfg = c; this.em = e;};

        var bricLayer = new BricLayer({}, dummyEventMgr);

        it('should have a BricWorks', function () {
            expect(bricLayer.getBricWorks()).to.not.be.null;
        });

        it('should only have one instance of a BricWorks', function () {
            var bricWorks = bricLayer.getBricWorks();
            expect(bricLayer.getBricWorks()).to.equal(bricWorks);
        });

        it('should have a bricWorks w/ a registered mold for all brix in BricTypes', function () {
            var BricTypes = pearson.brix.BricTypes;
            var bricWorks = bricLayer.getBricWorks();

            goog.object.forEach(BricTypes, function (bricName, key) {
                expect(bricWorks.hasMold(bricName), key + '("' + bricName + '")').to.be.true;
            });
        });

        describe('BricLayer.build with valid minimal empty activity config', function () {
            var bricLayer = new BricLayer({}, dummyEventMgr);
            var activityConfig = createActivityConfigSkeleton();
            // remove the optional properties so the config is truly minimal
            delete activityConfig.containerConfig[0].mortarConfig;
            delete activityConfig.containerConfig[0].hookupActions;
            var building = bricLayer.build(activityConfig);

            it('should return an object w/ an info property which is an object', function () {
                expect(building).to.have.a.property('info');
                expect(building.info).to.be.an('object');
            });

            it('should have a sequenceNodeKey property in the info object', function () {
                expect(building.info).to.have.a.property('sequenceNodeKey');
            });

            it('should not have a maxAttempts property in the info object', function () {
                expect(building.info).to.not.have.a.property('maxAttempts');
            });

            it('should not have an imgBaseUrl property in the info object', function () {
                expect(building.info).to.not.have.a.property('imgBaseUrl');
            });

            it('should return an object w/ a data property which is an object w/ no properties', function () {
                expect(building).to.have.a.property('data');
                expect(building.brix).to.be.an('object');
                expect(goog.object.getCount(building.brix)).to.equal(0);
            });

            it('should return an object w/ a brix property which is an object w/ no properties', function () {
                expect(building).to.have.a.property('brix');
                expect(building.brix).to.be.an('object');
                expect(goog.object.getCount(building.brix)).to.equal(0);
            });

            it('should return an object w/ a mortar property which is an object w/ no properties', function () {
                expect(building).to.have.a.property('mortar');
                expect(building.mortar).to.be.an('object');
                expect(goog.object.getCount(building.mortar)).to.equal(0);
            });
        });

        describe('BricLayer.build with activity config w/ maxAttempts property', function () {
            var bricLayer = new BricLayer({}, dummyEventMgr);
            var activityConfig = createActivityConfigSkeleton();
            activityConfig.maxAttempts = 12;
            var building = bricLayer.build(activityConfig);

            it('should have a maxAttempts property in the info object', function () {
                expect(building.info).to.have.a.property('maxAttempts');
                expect(building.info.maxAttempts).to.equal(12);
            });
        });

        describe('BricLayer.build with activity config w/ imgBaseUrl property', function () {
            var bricLayer = new BricLayer({}, dummyEventMgr);
            var activityConfig = createActivityConfigSkeleton();
            activityConfig.imgBaseUrl = 'http://localhost:8088/images/';
            var building = bricLayer.build(activityConfig);

            it('should have a imgBaseUrl property in the info object', function () {
                expect(building.info).to.have.a.property('imgBaseUrl');
                expect(building.info.imgBaseUrl).to.equal('http://localhost:8088/images/');
            });
        });
        describe('BricLayer.build with static bric config', function () {
            var bricLayer = new BricLayer({}, dummyEventMgr);
            var bricWorks = bricLayer.getBricWorks();
            // Add another mold for testing purposes
            var dummyBricName = '_dummy test bric_'
            bricWorks.registerBricMold(dummyBricName, DummyBricCtor);

            var activityConfig = createActivityConfigSkeleton();
            var dummyBricId = 'test';
            var dummyBricConfig = {"foo": "any foo will do"};

            var staticBricConfig =
                {
                    "bricId": dummyBricId,
                    "bricType": dummyBricName,
                    "config": dummyBricConfig
                };

            activityConfig.containerConfig[0].brixConfig.push(staticBricConfig);

            var building = bricLayer.build(activityConfig);

            it('should create the bric as a property of the brix object with a property name of the bricId', function () {
                expect(building.brix).to.have.a.property(dummyBricId);
                expect(building.brix[dummyBricId]).to.be.an.instanceOf(DummyBricCtor);
            });

            it('should build the bric with an exact copy of the static config', function () {
                var dummyBric = building.brix[dummyBricId];
                // the exact config obj from the activity config should not be passed to the ctor.
                expect(dummyBric.cfg).to.not.equal(dummyBricConfig);
                // the config obj should be identical to the activity config
                expect(dummyBric.cfg).to.deep.equal(dummyBricConfig);
                // the eventmanager the BricLayer was created with is passed to the bric ctor.
                expect(dummyBric.em).to.equal(dummyEventMgr);
            });
        });

        describe('BricLayer.build with an activity config with a data section', function () {
            var bricLayer = new BricLayer({}, dummyEventMgr);
            var activityConfig = createActivityConfigSkeleton();
            // remove the optional properties so the config is truly minimal
            delete activityConfig.containerConfig[0].mortarConfig;
            delete activityConfig.containerConfig[0].hookupActions;
            // add a data property
            activityConfig.data = { "foo1": "here and now", "bar1": 20, "foo2": { "key1": 1 } };

            var building = bricLayer.build(activityConfig);

            it('should return a "building" object with a data property which is a ref to the data property in the config', function () {
                expect(building.data).to.equal(activityConfig.data);
            });
        });

        describe('BricLayer.build w/ bric config w/ unknown configFixup type', function () {
            var bricLayer = new BricLayer({}, dummyEventMgr);
            var bricWorks = bricLayer.getBricWorks();
            // Add another mold for testing purposes
            var dummyBricName = '_dummy test bric_'
            bricWorks.registerBricMold(dummyBricName, DummyBricCtor);

            var activityConfig = createActivityConfigSkeleton();

            var dummyBricId = 'test';
            var dummyBricConfig = {"foo": "any foo will do"};

            var fixupUnknown =
                {
                    "type": "gobble-d-gook",
                };

            var bricConfigWithFixup =
                {
                    "bricId": dummyBricId,
                    "bricType": dummyBricName,
                    "config": dummyBricConfig,
                    "configFixup": [fixupUnknown]
                };

            activityConfig.containerConfig[0].brixConfig.push(bricConfigWithFixup);

            it('should throw an exception w/ the name of the unkown config fixup type', function () {
                expect(goog.bind(bricLayer.build, bricLayer, activityConfig)).to.throw(Error, /configFixup.+gobble-d-gook/);
            });
        });

        describe('BricLayer.build w/ bric config w/ configFixup', function () {
            var bricLayer = new BricLayer({}, dummyEventMgr);
            var bricWorks = bricLayer.getBricWorks();
            // Add another couple of molds for testing purposes
            var dummyBricName = '_dummy test bric_'
            bricWorks.registerBricMold(dummyBricName, DummyBricCtor);

            var DummyRefBricCtor = function (c, e) {this.cfg = c; this.em = e;};
            DummyRefBricCtor.prototype.getBar = function () {return this.cfg.bar;};
            var dummyRefBricName = '_dummy test ref bric_'
            bricWorks.registerBricMold(dummyRefBricName, DummyRefBricCtor);

            var activityConfig = createActivityConfigSkeleton();

            var dummyRefBricId = 'ref-test';
            var dummyRefBricConfig = {"bar": "any fubar will do"};

            var dummyBricId = 'test';
            var dummyBricConfig = {"foo": "any foo will do"};

            var bricConfigToRef =
                {
                    "bricId": dummyRefBricId,
                    "bricType": dummyRefBricName,
                    "config": dummyRefBricConfig,
                };

            activityConfig.containerConfig[0].brixConfig.push(bricConfigToRef);

            var fixupD3Select =
                {
                    "type": "set-property",
                    "name": "node",
                    "value":
                        {
                            "type": "d3select",
                            "selector": "#target"
                        }
                };

            var fixupWithBrixRefProperty =
                {
                    "type": "set-property",
                    "name": "maxSize",
                    "value":
                        {
                            "type": "property-of-ref",
                            "domain": "brix",
                            "refId": dummyRefBricId,
                            "accessor": "getBar"
                        }
                };

            var bricConfigWithFixup =
                {
                    "bricId": dummyBricId,
                    "bricType": dummyBricName,
                    "config": dummyBricConfig,
                    "configFixup": [fixupD3Select, fixupWithBrixRefProperty]
                };

            activityConfig.containerConfig[0].brixConfig.push(bricConfigWithFixup);

            var building = null;

            // the div element w/ id 'target' created before the tests, which will be removed
            // after the tests.
            var div;

            before(function () {
                div = helper.createNewDiv();
                d3.select(div).attr('id', 'target');
                building = bricLayer.build(activityConfig);
            });

            after(function () {
                d3.select(div).remove();
            });

            it('should set the config property specified w/ a value of the d3 select of the given selector', function () {
                var dummyBric = building.brix[dummyBricId];
                expect(dummyBric.cfg).to.have.a.property(fixupD3Select['name']);
                expect(dummyBric.cfg.node).to.be.an.instanceof(d3.selection);
                expect(dummyBric.cfg.node).to.deep.equal(d3.select('#target'));
            });

            it('should set the config property specified w/ a value from a previous bric', function () {
                var dummyBric = building.brix[dummyBricId];
                expect(dummyBric.cfg).to.have.a.property(fixupWithBrixRefProperty['name']);
                expect(dummyBric.cfg.maxSize).to.equal("any fubar will do");
            });
        });

        describe('BricLayer.build with static mortar config', function () {
            var bricLayer = new BricLayer({}, dummyEventMgr);
            var bricWorks = bricLayer.getBricWorks();
            // Add another mix for testing purposes
            var dummyMortarName = '_dummy test mortar_'
            bricWorks.registerMortarMix(dummyMortarName, DummyMortarCtor);

            var activityConfig = createActivityConfigSkeleton();
            var dummyMortarId = 'test';
            var dummyMortarConfig = {"foo": "any foo will do"};

            var staticMortarConfig =
                {
                    "mortarId": dummyMortarId,
                    "mortarType": dummyMortarName,
                    "config": dummyMortarConfig
                };

            activityConfig.containerConfig[0].mortarConfig.push(staticMortarConfig);

            var building = bricLayer.build(activityConfig);

            it('should create the mortar as a property of the mortar object with a property name of the mortarId', function () {
                expect(building.mortar).to.have.a.property(dummyMortarId);
                expect(building.mortar[dummyMortarId]).to.be.an.instanceOf(DummyMortarCtor);
            });

            it('should build the mortar with an exact copy of the static config', function () {
                var dummyMortar = building.mortar[dummyMortarId];
                // the exact config obj from the activity config should not be passed to the ctor.
                expect(dummyMortar.cfg).to.not.equal(dummyMortarConfig);
                // the config obj should be identical to the activity config
                expect(dummyMortar.cfg).to.deep.equal(dummyMortarConfig);
                // the eventmanager the BricLayer was created with is passed to the bric ctor.
                expect(dummyMortar.em).to.equal(dummyEventMgr);
            });
        });

        describe('BricLayer.build w/ mortar config w/ configFixup', function () {
            var bricLayer = new BricLayer({}, dummyEventMgr);
            var bricWorks = bricLayer.getBricWorks();
            // Add another couple of mixes for testing purposes
            var dummyMortarName = '_dummy test mortar_'
            bricWorks.registerMortarMix(dummyMortarName, DummyMortarCtor);

            var DummyRefMortarCtor = function (c, e) {this.cfg = c; this.em = e;};
            DummyRefMortarCtor.prototype.getBar = function () {return this.cfg.bar;};
            var dummyRefMortarName = '_dummy test ref mortar_'
            bricWorks.registerMortarMix(dummyRefMortarName, DummyRefMortarCtor);

            var activityConfig = createActivityConfigSkeleton();

            var dummyRefMortarId = 'ref-test';
            var dummyRefMortarConfig = {"bar": "any fubar will do"};

            var dummyMortarId = 'test';
            var dummyMortarConfig = {"foo": "any foo will do"};

            var mortarConfigToRef =
                {
                    "mortarId": dummyRefMortarId,
                    "mortarType": dummyRefMortarName,
                    "config": dummyRefMortarConfig,
                };

            activityConfig.containerConfig[0].mortarConfig.push(mortarConfigToRef);

            var fixupConstant =
                {
                    "type": "set-property",
                    "name": "node",
                    "value":
                        {
                            "type": "constant",
                            "value": "#target"
                        }
                };

            var fixupWithMortarRefProperty =
                {
                    "type": "set-property",
                    "name": "glue",
                    "value":
                        {
                            "type": "ref",
                            "domain": "mortar",
                            "refId": dummyRefMortarId
                        }
                };

            var mortarConfigWithFixup =
                {
                    "mortarId": dummyMortarId,
                    "mortarType": dummyMortarName,
                    "config": dummyMortarConfig,
                    "configFixup": [fixupConstant, fixupWithMortarRefProperty]
                };

            activityConfig.containerConfig[0].mortarConfig.push(mortarConfigWithFixup);

            var building = null;

            building = bricLayer.build(activityConfig);

            it('should set the config property specified w/ a value of the constant given', function () {
                var dummyMortar = building.mortar[dummyMortarId];
                expect(dummyMortar.cfg).to.have.a.property(fixupConstant['name']);
                expect(dummyMortar.cfg.node).to.equal('#target');
            });

            it('should set the config property specified w/ a reference to the previous mortar', function () {
                var dummyMortar = building.mortar[dummyMortarId];
                var dummyRefMortar = building.mortar[dummyRefMortarId];
                expect(dummyMortar.cfg).to.have.a.property(fixupWithMortarRefProperty['name']);
                expect(dummyMortar.cfg.glue).to.be.an.instanceOf(DummyRefMortarCtor);
                expect(dummyMortar.cfg.glue).to.equal(dummyRefMortar);
            });
        });

        describe('BricLayer.build w/ an unknown hookupAction type', function () {
            var bricLayer = new BricLayer({}, dummyEventMgr);

            var activityConfig = createActivityConfigSkeleton();

            var methodCallAction1 =
                {
                    "type": "jump-in-lake",
                    "instance": {"type": "ref", "domain": "brix", "refId": "foo"},
                    "methodName": "doIt",
                };

            activityConfig.containerConfig[0].hookupActions.push(methodCallAction1);

            it('should throw an exception w/ the name of the unkown action type', function () {
                expect(goog.bind(bricLayer.build, bricLayer, activityConfig)).to.throw(Error, /action.+jump-in-lake/);
            });
        });

        describe('BricLayer.build with method call hookup actions', function () {
            var bricLayer = new BricLayer({}, dummyEventMgr);
            var bricWorks = bricLayer.getBricWorks();
            // Add another couple of molds for testing purposes
            var DummyRefBricCtor = function (c, e)
                {this.cfg = c; this.em = e; this.doItArgs = null; this.doItAllArgs = null;};
            DummyRefBricCtor.prototype.doIt = function () { this.doItArgs = arguments; };
            DummyRefBricCtor.prototype.doItAll = function () { this.doItAllArgs = arguments; };

            var dummyRefBricName = '_dummy test ref bric_'
            bricWorks.registerBricMold(dummyRefBricName, DummyRefBricCtor);

            var activityConfig = createActivityConfigSkeleton();

            var dummyRefBricId = 'ref-test';
            var dummyRefBricConfig = {"bar": "any fubar will do"};

            var bricConfigToRef =
                {
                    "bricId": dummyRefBricId,
                    "bricType": dummyRefBricName,
                    "config": dummyRefBricConfig
                };

            activityConfig.containerConfig[0].brixConfig.push(bricConfigToRef);

            var methodCallAction1 =
                {
                    "type": "method-call",
                    "instance": {"type": "ref", "domain": "brix", "refId": dummyRefBricId},
                    "methodName": "doIt",
                    "args":
                        [
                            {"type": "constant", "value": 42},
                            {"type": "constant", "value": "towel"}
                        ]
                };

            var methodCallAction2 =
                {
                    "type": "method-call",
                    "instance": {"type": "ref", "domain": "brix", "refId": dummyRefBricId},
                    "methodName": "doItAll",
                    "args":
                        [
                            {"type": "constant", "value": [1, 3, 5]}
                        ]
                };

            activityConfig.containerConfig[0].hookupActions.push(methodCallAction1);
            activityConfig.containerConfig[0].hookupActions.push(methodCallAction2);

            var building = null;

            before(function () {
                building = bricLayer.build(activityConfig);
            });

            it('should call the methods on the correct objects w/ the correct arguments', function () {
                var dummyBric = building.brix[dummyRefBricId];
                expect(dummyBric.doItArgs).is.not.null;
                expect(dummyBric.doItArgs.length).to.equal(2);
                expect(dummyBric.doItArgs[0]).to.equal(42);
                expect(dummyBric.doItArgs[1]).to.equal('towel');

                expect(dummyBric.doItAllArgs).is.not.null;
                expect(dummyBric.doItAllArgs.length).to.equal(1);
                expect(dummyBric.doItAllArgs[0]).to.deep.equal([1, 3, 5]);
            });
        });

        describe('BricLayer.build w/ an unknown dynamicValue type', function () {
            var bricLayer = new BricLayer({}, dummyEventMgr);

            var activityConfig = createActivityConfigSkeleton();

            // we'll put the unknown dynamicValue type in an action
            var methodCallAction1 =
                {
                    "type": "method-call",
                    "instance": {"type": "cant-get-thar", "domain": "brix", "refId": "foo"},
                    "methodName": "doIt",
                };

            activityConfig.containerConfig[0].hookupActions.push(methodCallAction1);

            it('should throw an exception w/ the name of the unkown dynamicValue type', function () {
                expect(goog.bind(bricLayer.build, bricLayer, activityConfig)).to.throw(Error, /dynamicValue.+cant-get-thar/);
            });
        });

        describe('BricLayer Dynamic Values', function() {
            var bricLayer = new BricLayer({}, dummyEventMgr);
            var bricWorks = bricLayer.getBricWorks();
            // Add a bric mold to use for testing the dynamic values
            var TestDV_BricCtor = function (c, e)
                {this.cfg = c; this.em = e; this.dynamicVal = null;};
            TestDV_BricCtor.prototype.doIt = function (dynamicValue) { this.dynamicVal = dynamicValue; };
            TestDV_BricCtor.prototype.testProp = function () { return "howdy partner"; };
            TestDV_BricCtor.getEventTopic = function (eventName, instanceId) { return eventName + '_' + instanceId; };
            var testDV_BricName = '_test DV_'
            bricWorks.registerBricMold(testDV_BricName, TestDV_BricCtor);

            var testDV_BricId = 'test-dv';
            var testDVConfig =
                {
                    "bricId": testDV_BricId,
                    "bricType": testDV_BricName,
                    "config": {}
                };

            // The method-call action used to pass the dynamic value being tested to the
            // doIt method of the test bric.
            var action =
                {
                    "type": "method-call",
                    "instance": {"type": "ref", "domain": "brix", "refId": testDV_BricId},
                    "methodName": "doIt",
                    "args": []
                };

            var activityConfig = null;

            beforeEach(function () {
                // create a new activity config w/ the dynamic value test bric for each test
                // and the hookup action which calls the doIt method of that bric, initially
                // w/o any args, each test will add an arg of the dynamic value type
                // being tested.
                activityConfig = createActivityConfigSkeleton();
                activityConfig.containerConfig[0].brixConfig.push(testDVConfig);
                action['args'] = [];
                activityConfig.containerConfig[0].hookupActions.push(action);
            });

            describe('constant', function() {
                it('should support numeric values', function () {
                    var constantDv = { "type": "constant", "value": 42 };
                    activityConfig.containerConfig[0].hookupActions[0].args.push(constantDv);

                    var building = bricLayer.build(activityConfig);
                    var testDVBric = building.brix[testDV_BricId];

                    expect(testDVBric.dynamicVal).to.equal(42);
                });

                it('should support string values', function () {
                    var constantDv = { "type": "constant", "value": "snafu?" };
                    activityConfig.containerConfig[0].hookupActions[0].args.push(constantDv);

                    var building = bricLayer.build(activityConfig);
                    var testDVBric = building.brix[testDV_BricId];

                    expect(testDVBric.dynamicVal).to.equal("snafu?");
                });

                it('should support boolean values', function () {
                    var constantDv = { "type": "constant", "value": true };
                    activityConfig.containerConfig[0].hookupActions[0].args.push(constantDv);

                    var building = bricLayer.build(activityConfig);
                    var testDVBric = building.brix[testDV_BricId];

                    expect(testDVBric.dynamicVal).to.be.true;
                });

                it('should support object values', function () {
                    var constantDv = { "type": "constant", "value": {"foo": "test", "bar": 19} };
                    activityConfig.containerConfig[0].hookupActions[0].args.push(constantDv);

                    var building = bricLayer.build(activityConfig);
                    var testDVBric = building.brix[testDV_BricId];

                    expect(testDVBric.dynamicVal).to.deep.equal({"foo": "test", "bar": 19});
                });

                it('should support array values', function () {
                    var constantDv = { "type": "constant", "value": [true, 16, "arg", {"foo": "test"}] };
                    activityConfig.containerConfig[0].hookupActions[0].args.push(constantDv);

                    var building = bricLayer.build(activityConfig);
                    var testDVBric = building.brix[testDV_BricId];

                    expect(testDVBric.dynamicVal).to.deep.equal([true, 16, "arg", {"foo": "test"}]);
                });
            });

            describe('brix-topic', function() {
                it('should return the value from calling the getEventTopic static method of the specified bric', function () {
                    var brixTopicDv = { "type": "brix-topic",
                                        "bricType": testDV_BricName,
                                        "eventName": "sunrise",
                                        "instanceId": "foo" };
                    activityConfig.containerConfig[0].hookupActions[0].args.push(brixTopicDv);

                    var building = bricLayer.build(activityConfig);
                    var testDVBric = building.brix[testDV_BricId];

                    expect(testDVBric.dynamicVal).to.equal('sunrise_foo');
                });
            });

            describe('ref', function() {
                it('should be able to reference a previously created bric', function () {
                    var refDv = { "type": "ref", "domain": "brix", "refId": testDV_BricId };
                    activityConfig.containerConfig[0].hookupActions[0].args.push(refDv);

                    var building = bricLayer.build(activityConfig);
                    var testDVBric = building.brix[testDV_BricId];

                    expect(testDVBric.dynamicVal).to.equal(testDVBric);
                });

                it('should be able to reference a previously created mortar', function () {
                    // add a test mortar to the activity config so it can be referenced
                    var dummyMortarName = '_dummy test mortar_'
                    var DummyMortarCtor = function (c, e) {this.cfg = c; this.em = e;};
                    bricWorks.registerMortarMix(dummyMortarName, DummyMortarCtor);

                    var testDV_MortarId = 'test';
                    var testDV_MortarConfig = {"foo": "any foo will do"};

                    var staticMortarConfig =
                        {
                            "mortarId": testDV_MortarId,
                            "mortarType": dummyMortarName,
                            "config": testDV_MortarConfig
                        };

                    activityConfig.containerConfig[0].mortarConfig.push(staticMortarConfig);

                    var refDv = { "type": "ref", "domain": "mortar", "refId": testDV_MortarId };
                    activityConfig.containerConfig[0].hookupActions[0].args.push(refDv);

                    var building = bricLayer.build(activityConfig);
                    var testDVBric = building.brix[testDV_BricId];
                    var testDVMortar = building.mortar[testDV_MortarId];

                    expect(testDVBric.dynamicVal).to.equal(testDVMortar);
                });

                it('should be able to reference data properties', function () {
                    // add a data property to the activity config so it can be referenced
                    var dataId = "foo";
                    activityConfig.data = {};
                    activityConfig.data[dataId] = ["one", "two", "shoe"];
                    var refDv = { "type": "ref", "domain": "data", "refId": dataId };
                    activityConfig.containerConfig[0].hookupActions[0].args.push(refDv);

                    var building = bricLayer.build(activityConfig);
                    var testDVBric = building.brix[testDV_BricId];

                    expect(testDVBric.dynamicVal).to.be.an('array');
                    expect(testDVBric.dynamicVal).to.equal(building.data[dataId]);
                });

                it('should be able to reference info properties', function () {
                    // the bricLayer currently only supports 1 info property
                    // which it creates from the 'sequenceNodeKey' property
                    // so add that property to the config.
                    var seqNodeKey = "f7d82086-4072-411a-8fe4-1fcee6843613";
                    activityConfig.sequenceNodeKey = seqNodeKey;
                    var refDv = { "type": "ref", "domain": "info", "refId": 'sequenceNodeKey' };
                    activityConfig.containerConfig[0].hookupActions[0].args.push(refDv);

                    var building = bricLayer.build(activityConfig);
                    var testDVBric = building.brix[testDV_BricId];

                    expect(testDVBric.dynamicVal).to.be.a('string');
                    expect(testDVBric.dynamicVal).to.equal(seqNodeKey);
                });
            });

            describe('property-of-ref', function() {
                it('should get the property of a previously created bric using an accessor method', function () {
                    var propOfRefDv = { "type": "property-of-ref", "domain": "brix", "refId": testDV_BricId, "accessor": "testProp" };
                    activityConfig.containerConfig[0].hookupActions[0].args.push(propOfRefDv);

                    var building = bricLayer.build(activityConfig);
                    var testDVBric = building.brix[testDV_BricId];

                    expect(testDVBric.dynamicVal).to.equal('howdy partner');
                });
            });

            describe('array', function() {
                it('should get an array whose elements are the specified dynamic values', function () {
                    var arrayDv = { "type": "array",
                                    "elements":
                                        [
                                            { "type": "ref", "domain": "brix", "refId": testDV_BricId },
                                            { "type": "constant", "value": "snafu?" },
                                            { "type": "constant", "value": 101 }
                                        ]
                                  };
                    activityConfig.containerConfig[0].hookupActions[0].args.push(arrayDv);

                    var building = bricLayer.build(activityConfig);
                    var testDVBric = building.brix[testDV_BricId];

                    expect(testDVBric.dynamicVal).to.be.an('array');
                    expect(testDVBric.dynamicVal.length).to.equal(3);
                    expect(testDVBric.dynamicVal[0]).to.equal(building.brix[testDV_BricId]);
                    expect(testDVBric.dynamicVal[1]).to.equal("snafu?");
                    expect(testDVBric.dynamicVal[2]).to.equal(101);
                });
            });

            describe('array-element', function() {
                it('should get an element of an array which is a dynamic value', function () {
                    var dataId = "foo";
                    activityConfig.data = {};
                    activityConfig.data[dataId] = [10, 20, 30, 40];
                    var arrayElDv = { "type": "array-element",
                                      "array": { "type": "ref", "domain": "data", "refId": dataId },
                                      "index": 2
                                    };
                    activityConfig.containerConfig[0].hookupActions[0].args.push(arrayElDv);

                    var building = bricLayer.build(activityConfig);
                    var testDVBric = building.brix[testDV_BricId];

                    expect(testDVBric.dynamicVal).to.equal(30);
                });

                it('should be able to be nested to get values from nested arrays', function () {
                    var dataId = "foo";
                    var objInNestedArray = {"george": "dragon"};
                    activityConfig.data = {};
                    activityConfig.data[dataId] = [10, 20, ["a", "b", "c", objInNestedArray, [3]], 40];
                    var arrayElDv = { "type": "array-element",
                                      "array": { "type": "array-element",
                                                 "array": { "type": "ref", "domain": "data", "refId": dataId },
                                                 "index": 2
                                               },
                                      "index": 3
                                    };
                    activityConfig.containerConfig[0].hookupActions[0].args.push(arrayElDv);

                    var building = bricLayer.build(activityConfig);
                    var testDVBric = building.brix[testDV_BricId];

                    expect(testDVBric.dynamicVal).to.be.an('object');
                    expect(testDVBric.dynamicVal).to.equal(objInNestedArray);
                });
            });

            describe('object', function() {
                it('should get an object which has properties with the defined names and associated dynamic values', function () {
                    var objectDv = { "type": "object",
                                     "properties": [ { "name": "foo",
                                                       "value": { "type": "ref", "domain": "brix", "refId": testDV_BricId },
                                                     },
                                                     { "name": "bar",
                                                       "value": { "type": "constant", "value": "snafu?" },
                                                     },
                                                     { "name": "happyhappy",
                                                       "value": { "type": "constant", "value": 101 }
                                                     }
                                                   ]
                                   };
                    activityConfig.containerConfig[0].hookupActions[0].args.push(objectDv);

                    var building = bricLayer.build(activityConfig);
                    var testDVBric = building.brix[testDV_BricId];

                    expect(testDVBric.dynamicVal).to.be.an('object');
                    expect(testDVBric.dynamicVal).to.have.property('foo');
                    expect(testDVBric.dynamicVal.foo).to.equal(building.brix[testDV_BricId]);
                    expect(testDVBric.dynamicVal).to.have.property('bar');
                    expect(testDVBric.dynamicVal.bar).to.equal("snafu?");
                    expect(testDVBric.dynamicVal).to.have.property('happyhappy');
                    expect(testDVBric.dynamicVal.happyhappy).to.equal(101);
                });
            });

            describe('join', function() {
                it('should concatenate an array of mixed dynamic values', function () {
                    var dataId = "foo";
                    activityConfig.data = {};
                    activityConfig.data[dataId] = [1, 2, 3, 36];

                    var arrayDv = { "type": "join",
                                    "parts":
                                        [
                                            { "type": "constant", "value": "Yo, homey. " },
                                            { "type": "constant", "value": "How many pigs can I eat? " },
                                            { "type": "array-element",
                                              "array": { "type": "ref", "domain": "data", "refId": dataId },
                                              "index": 3
                                            }
                                        ]
                                  };
                    activityConfig.containerConfig[0].hookupActions[0].args.push(arrayDv);

                    var building = bricLayer.build(activityConfig);
                    var testDVBric = building.brix[testDV_BricId];

                    expect(testDVBric.dynamicVal).to.be.a('string');
                    expect(testDVBric.dynamicVal).to.equal('Yo, homey. How many pigs can I eat? 36');
                });

                it('should concatenate an array of dynamic values pulling from info domain', function () {
                    var arrayDv = { "type": "join",
                                    "parts":
                                        [
                                            { "type": "ref", "domain": "info", "refId": "imgBaseUrl" },
                                            { "type": "constant", "value": "img/monkey.jpg" }
                                        ]
                                  };
                    activityConfig.containerConfig[0].hookupActions[0].args.push(arrayDv);

                    activityConfig.imgBaseUrl = 'http://localhost:8088/images/';
                    var building = bricLayer.build(activityConfig);
                    var testDVBric = building.brix[testDV_BricId];

                    expect(testDVBric.dynamicVal).to.be.a('string');
                    expect(testDVBric.dynamicVal).to.equal('http://localhost:8088/images/img/monkey.jpg');
                });
            });

            describe('submit-manager', function() {
                it('should be null if the BricLayer is constructed w/o a submit manager', function () {
                    // We need to construct a new bricLayer so we control the constructor args
                    var bricLayer = new BricLayer({}, dummyEventMgr);
                    var bricWorks = bricLayer.getBricWorks();
                    // Add a bric mold to use for testing the dynamic values (use the one setup above)
                    bricWorks.registerBricMold(testDV_BricName, TestDV_BricCtor);

                    var submitMgrDv = { "type": "submit-manager" };
                    activityConfig.containerConfig[0].hookupActions[0].args.push(submitMgrDv);

                    var building = bricLayer.build(activityConfig);
                    var testDVBric = building.brix[testDV_BricId];

                    expect(testDVBric.dynamicVal).to.be.null;
                });

                it('should be the instance of the SubmitManager passed to the BricLayer constructor', function () {
                    // We need to construct a new bricLayer so we control the constructor args
                    var submitManager = new pearson.brix.utils.SubmitManager();
                    var bricLayer = new BricLayer({}, dummyEventMgr, submitManager);
                    var bricWorks = bricLayer.getBricWorks();
                    // Add a bric mold to use for testing the dynamic values (use the one setup above)
                    bricWorks.registerBricMold(testDV_BricName, TestDV_BricCtor);

                    var submitMgrDv = { "type": "submit-manager" };
                    activityConfig.containerConfig[0].hookupActions[0].args.push(submitMgrDv);

                    var building = bricLayer.build(activityConfig);
                    var testDVBric = building.brix[testDV_BricId];

                    expect(testDVBric.dynamicVal).to.be.an.instanceof(pearson.brix.utils.SubmitManager);
                    expect(testDVBric.dynamicVal).to.equal(submitManager);
                });
            });

            describe('d3select', function() {
                // the div element w/ id 'target' created before the tests, which will be removed
                // after the tests.
                var div;

                before(function () {
                    div = helper.createNewDiv();
                    d3.select(div).attr('id', 'target42');
                });

                after(function () {
                    d3.select(div).remove();
                });

                it('should be the value of the d3 select function called with the given selector', function () {
                    var d3selectDv = { "type": "d3select", "selector": "#target42" };
                    activityConfig.containerConfig[0].hookupActions[0].args.push(d3selectDv);

                    var building = bricLayer.build(activityConfig);
                    var testDVBric = building.brix[testDV_BricId];

                    expect(testDVBric.dynamicVal).to.be.an.instanceof(d3.selection);
                    expect(testDVBric.dynamicVal).to.deep.equal(d3.select('#target42'));
                });
            });
        });
    });
})();
