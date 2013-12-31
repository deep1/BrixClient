/*****************************************************************************
 * Unit test for DomHelper
 *
 * @author Young-Suk Ahn Park 
 */

'use strict';

(function () {
    var expect = chai.expect;

    var DomHelper = pearson.utils.DomHelper;

    describe('DomHelper', function () {

        //var DomHelper = DomHelper;

        var divAttrs = [
            {
                id: "some_habitat_id1",
                class: "brix"
            },
            {
                id: "some_habitat_id2",
                class: "brix"
            }
        ];
        var expectedItems = [
            {
                activityurl: "http://content.api.pearson.com/resources/activity/11001",
                assignmenturl: "http://content.api.pearson.com/resources/activity/12001",
                containerid: "imgReactor",
                type: "brix",
            },
            {
                activityurl: "http://content.api.pearson.com/resources/activity/11002",
                assignmenturl: "http://content.api.pearson.com/resources/activity/12002",
                containerid: "steps",
                type: "brix",
            }
        ];

        var containerDiv;
        var div1, div2;

        before(function () {
            containerDiv = helper.createNewDiv();
            div1 = helper.createNewDiv(divAttrs[0], expectedItems[0]);
            div2 = helper.createNewDiv(divAttrs[1], expectedItems[1]);

            helper.createNewObject(containerDiv, 'brix', null, expectedItems[0]);
            helper.createNewObject(containerDiv, 'brix', null, expectedItems[1]);
        });
        after(function () {
            // Remove the crated divs and objects
            var bodyEl = document.getElementsByTagName('body')[0];
            bodyEl.removeChild(div1);
            bodyEl.removeChild(div2);
            helper.removeAllChildren(containerDiv);
        });

        it.skip('should build query string from params', function () {
            //buildQueryStringFromParams
        });

        it.skip('should convertObjectToIframeElement', function () {
            //convertObjectToIframeElement
        });

        it('should scan divs of class \'brix\'', function () {
            var items = DomHelper.scanElements('brix', 'div');

            expect(items).to.deep.equal(expectedItems);
            // @todo: Verify that divs with other classes are not included 
        });


        it('should scan objects of class brix', function () {
            var items = DomHelper.scanObjects('brix');

            expect(items).to.deep.equal(expectedItems);
            // @todo: Verify that objects with other classes are not included
        });

        
    });

})();
