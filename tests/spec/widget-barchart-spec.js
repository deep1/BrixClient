// sample test for widget-linegraph
'use strict';


(function () {
    var expect = chai.expect;

	var EventManager = pearson.utils.EventManager;
	var BarChart = pearson.brix.BarChart;

    describe('Barcharts should be super awesome', function () {
		var eventManager = null;

        describe('Creating a BarChart with linear/ordinal data', function () {
			var testData = [
				{ x:    50, y: "chocolate creme" },
				{ x:    30, y: "lemon chiffon" },
				{ x: 	20, y: "mincemeat" }
			];
				
			var configGraph = {
				Data: [testData],
				xAxisFormat: { type: "linear",
							   ticks: 5,
							   orientation: "bottom",
							   label: "percentage of people who prefer this pie" },
				yAxisFormat: { type: "ordinal",
							   orientation: "left",
							   label: "Pies" },
			};
		
			var myGraph = null;

			before(function () {
				eventManager = new EventManager();
				myGraph = new BarChart(configGraph);
			});
			
			/*it('should know it values at its first point', function () {
                expect(myGraph.data[0][0]).to.deep.equal({x: 50, y: "chccolate creme"});
            });*/

			it('should create an empty array of child Brix', function () {
                expect(myGraph.childBrix.beforeData).to.be.empty;
                expect(myGraph.childBrix.afterData).to.be.empty;
            });

			describe('DOM manipulation (create/update elements) tests', function () {
				var configCntr = {
					node: null,
					maxWid: 400,
					maxHt: 300
				};
				var targetEl = null;
				var cntr = null;

				after(function () {
					// Clean up test modifications to the DOM
					configCntr.node && configCntr.node.remove();
				});
					
				describe('draw()', function () {
					before(function () {
						cntr = helper.createNewSvgContainer(configCntr);
						// append will call draw()
						cntr.append(myGraph);
					});
					
					it('should scale the min of x range to the left edge of svg box', function () {
						expect(myGraph.lastdrawn.xScale(0)).to.equal(0);
					});

					 it('should make a group in svg with barsId', function () {
						expect(myGraph.lastdrawn.graph.attr("id")).to.equal(myGraph.getId() + "_bars");
					});
				});
			});	
		});
    });
})();
