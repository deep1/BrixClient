// tests for widget-sketch
'use strict';
(function ()
{
    var expect = chai.expect;

	var EventManager = pearson.utils.EventManager;
	var Sketch = pearson.brix.Sketch;

    describe('Sketch widget tests', function ()
	{
		var eventManager = null;
	
        describe('Sketch.splitOnNumbers', function ()
		{
            it('should handle the simple case w/ no numbers', function ()
			{
				var result = Sketch.splitOnNumbers("abc");
                expect(result.length).to.equal(1);
                expect(result[0]).to.equal("abc");
            });
            it('should handle the simple case of just a number', function ()
			{
				var result = Sketch.splitOnNumbers(2);
                expect(result).to.have.length(3);
                expect(result[0]).to.be.empty;
                expect(result[1]).to.equal("2");
                expect(result[2]).to.be.empty;
            });
            it('should handle the simple case w/ one number group at end', function ()
			{
				var result = Sketch.splitOnNumbers("abc23");
                expect(result).to.have.length(3);
                expect(result[0]).to.equal("abc");
                expect(result[1]).to.equal("23");
                expect(result[2]).to.be.empty;
            });
            it('should handle the text that starts with a number group', function ()
			{
				var result = Sketch.splitOnNumbers("45abc");
                expect(result).to.have.length(3);
                expect(result[0]).to.be.empty;
                expect(result[1]).to.equal("45");
                expect(result[2]).to.equal("abc");
            });
            it('should handle the text with multiple number groups', function ()
			{
				var result = Sketch.splitOnNumbers("a1b2c3e4f5g6h123cd43foo");
                expect(result).to.have.length(17);
                expect(result[0]).to.equal("a");
                expect(result[1]).to.equal("1");
                expect(result[2]).to.equal("b");
                expect(result[3]).to.equal("2");
                expect(result[4]).to.equal("c");
                expect(result[5]).to.equal("3");
                expect(result[6]).to.equal("e");
                expect(result[7]).to.equal("4");
                expect(result[8]).to.equal("f");
                expect(result[9]).to.equal("5");
                expect(result[10]).to.equal("g");
                expect(result[11]).to.equal("6");
                expect(result[12]).to.equal("h");
                expect(result[13]).to.equal("123");
                expect(result[14]).to.equal("cd");
                expect(result[15]).to.equal("43");
                expect(result[16]).to.equal("foo");
            });
        });

		describe('Creating a sketch', function ()
		{
			
			var configCntr = {
					node: null,
					maxWid: 200,
					maxHt: 200
				};
			
			// make svg container
			var cntr = helper.createNewSvgContainer(configCntr);
			
			after(function ()
			{
				// Clean up test modifications to the DOM
				configCntr.node && configCntr.node.remove();
			});
			
			var mySketch = null;
			var xScale = null;
			var yScale = null;
			
			before(function ()
			{
				// make the sketch
				mySketch = new Sketch ({
					id: "sketch1",
					drawShape:
					[
						{ shape: "rectangle", data:[{xyPos: [.2, .5], width: .2, height: .1 }]},
						{ shape: "circle", data:[{xyPos: [.5, .5], radius:  .2 }]}, 
						{ shape: "hexagon", data:[{xyPos: [.3, .3], side:  .1 }]},
						{ shape: "triangle", data:[{xyPos: [.4, .4], side: .2 }]},
						{ shape: "line", data:[{xyPos: [.1, .1], length: .5, angle: Math.PI/3 }]},
						{ shape: "wedge", data:[{xyPos: [.2, .4], length: .5, width: .2, angle: Math.PI/6 }]},
						//{ shape: "wedge", data:[{xyPos: [.35, .24], length: .3, width: .15, angle: Math.PI/4, type: "hash"}]},
						{ shape: "textBit", data:[{xyPos: [.15, .35], text: "blah" }]}
					],
				});
			
				// append the sketch
				cntr.append(mySketch);
			});
			
			/*
				NOTE:
				
				- The x and y values for each successive test are based on the values
				left from the previous test, since they all act on the same sketch.
				
				- Reflection for rectangles is not as simple as it is for other
				shapes because rectangles are anchored at their top left corner, rather
				than their center.
				
				- Transitions on sketches are asynchronous, so timeouts are necessary to
				keep new transitions from overriding older ones. If there is an unexpected
				and/or random test failure, try increasing the timeout value defined below.
			*/
			var time = 20;	// number of milliseconds for each timeout
			
			
			// draw
			describe('draw', function ()
			{
				before(function (done)
				{
					xScale = mySketch.lastdrawn.xScale;
					yScale = mySketch.lastdrawn.yScale;
					
					done();
				});
				
				it('rectangles should start with the correct attributes', function (done)
				{
					setTimeout( function ()
					{
						check(done, function ()
						{
							var rectangle = mySketch.lastdrawn.widgetGroup.select("rect");
							expect(rectangle.attr('x')).to.equal(xScale(.2).toString());
							expect(rectangle.attr('y')).to.equal(yScale(.5).toString());
							expect(rectangle.attr('width')).to.equal(xScale(.2).toString());
							expect(rectangle.attr('height')).to.equal((yScale(0) - yScale(.1)).toString());
						});
					}, time);
				});
				it('circles should start with the correct attributes', function (done)
				{
					setTimeout( function ()
					{
						check(done, function ()
						{
							var circle = mySketch.lastdrawn.widgetGroup.select("circle");
							expect(circle.attr('cx')).to.equal(xScale(.5).toString());
							expect(circle.attr('cy')).to.equal(yScale(.5).toString());
							expect(circle.attr('r')).to.equal(xScale(.2).toString());
						});
					}, time);
				});
				it('hexagons should start with the correct attributes', function (done)
				{
					setTimeout( function ()
					{
						check(done, function ()
						{
							var hexagon = mySketch.lastdrawn.widgetGroup.select("polygon.hex");
							expect(hexagon.attr('points')).to.equal('43,150 60,160 77,150 77,130 60,120 43,130');
						});
					}, time);
				});
				it('triangles should start with the correct attributes', function (done)
				{
					setTimeout( function ()
					{
						check(done, function ()
						{
							var triangle = mySketch.lastdrawn.widgetGroup.select("polygon.tri");
							expect(triangle.attr('points')).to.equal('60,137 100,137 80,103');
						});
					}, time);
				});
				it('wedges should start with the correct attributes', function (done)
				{
					setTimeout( function ()
					{
						check(done, function ()
						{
							var wedge = mySketch.lastdrawn.widgetGroup.select("polygon.wedge");
							expect(wedge.attr('points')).to.equal('117,53 40,120 137,87');
						});
					}, time);
				});
				it('lines should start with the correct attributes', function (done)
				{
					setTimeout( function ()
					{
						check(done, function ()
						{
							var line = mySketch.lastdrawn.widgetGroup.select("line");
							expect(line.attr('x1')).to.equal(xScale(.1).toString());
							expect(line.attr('y1')).to.equal(yScale(.1).toString());
							expect(line.attr('x2')).to.equal(xScale(.1 + .5*Math.cos(Math.PI/3)).toString());
							expect(line.attr('y2')).to.equal(yScale(.1 + .5*Math.sin(Math.PI/3)).toString());
						});
					}, time);
				});
				it('textBits should start with the correct attributes', function (done)
				{
					setTimeout( function ()
					{
						check(done, function ()
						{
							var textBit = mySketch.lastdrawn.widgetGroup.select("text");
							var text = textBit.select("tspan").text();
							expect(textBit.attr('x')).to.equal(xScale(.15).toString());
							expect(textBit.attr('y')).to.equal(yScale(.35).toString());
							expect(text).to.equal("blah");
						});
					}, time);
				});
			});
			
			
			// move
			describe('move', function ()
			{
				before(function (done)
				{
					mySketch.move(.1, .2, 0, 0);
					
					xScale = mySketch.lastdrawn.xScale;
					yScale = mySketch.lastdrawn.yScale;
					
					done();
				});
				it('rectangles should be translated by the given offsets', function (done)
				{
					setTimeout( function ()
					{
						check(done, function ()
						{
							var rectangle = mySketch.lastdrawn.widgetGroup.select("rect");
							expect(rectangle.attr('x')).to.equal(xScale(.3).toString());
							expect(rectangle.attr('y')).to.equal(yScale(.7).toString());
						});
					}, time);
				});
				it('circles should be translated by the given offsets', function (done)
				{
					setTimeout( function ()
					{
						check(done, function ()
						{
							var circle = mySketch.lastdrawn.widgetGroup.select("circle");
							expect(circle.attr('cx')).to.equal(xScale(.6).toString());
							expect(circle.attr('cy')).to.equal(yScale(.7).toString());
						});
					}, time);
				});
				it('hexagons should be translated by the given offsets', function (done)
				{
					setTimeout( function ()
					{
						check(done, function ()
						{
							var hexagon = mySketch.lastdrawn.widgetGroup.select("polygon.hex");
							expect(hexagon.attr('points')).to.equal('63,110 80,120 97,110 97,90 80,80 63,90');
						});
					}, time);
				});
				it('triangles should be translated by the given offsets', function (done)
				{
					setTimeout( function ()
					{
						check(done, function ()
						{
							var triangle = mySketch.lastdrawn.widgetGroup.select("polygon.tri");
							expect(triangle.attr('points')).to.equal('80,97 120,97 100,63');
						});
					}, time);
				});
				it('wedges should be translated by the given offsets', function (done)
				{
					setTimeout( function ()
					{
						check(done, function ()
						{
							var wedge = mySketch.lastdrawn.widgetGroup.select("polygon.wedge");
							expect(wedge.attr('points')).to.equal('137,13 60,80 157,47');
						});
					}, time);
				});
				it('lines should be translated by the given offsets', function (done)
				{
					setTimeout( function ()
					{
						check(done, function ()
						{
							var line = mySketch.lastdrawn.widgetGroup.select("line");
							expect(line.attr('x1')).to.equal(xScale(.2).toString());
							expect(line.attr('y1')).to.equal(yScale(.3).toString());
							expect(line.attr('x2')).to.equal(xScale(.2 + .5*Math.cos(Math.PI/3)).toString());
							expect(line.attr('y2')).to.equal(yScale(.3 + .5*Math.sin(Math.PI/3)).toString());
						});
					}, time);
				});
				it('textBits should be translated by the given offsets', function (done)
				{
					setTimeout( function ()
					{
						check(done, function ()
						{
							var textBit = mySketch.lastdrawn.widgetGroup.select("text");
							expect(textBit.attr('x')).to.equal(xScale(.25).toString());
							expect(textBit.attr('y')).to.equal(yScale(.55).toString());
						});
					}, time);
				});
			});
			
			
			// horizontal reflection
			describe('horizontal reflection', function ()
			{
				before(function (done)
				{
					mySketch.reflect(null, .6, 0, 0);
					
					xScale = mySketch.lastdrawn.xScale;
					yScale = mySketch.lastdrawn.yScale;
					
					done();
				});
				it('rectangles should be reflected over the horizontal line', function (done)
				{
					setTimeout( function ()
					{
						check( done, function ()
						{
							var rectangle = mySketch.lastdrawn.widgetGroup.select("rect");
							expect(rectangle.attr('x')).to.equal(xScale(.3).toString());
							expect(rectangle.attr('y')).to.equal(yScale(.6).toString());
						});
					}, time);
				});
				it('circles should be reflected over the horizontal line', function (done)
				{
					setTimeout( function ()
					{
						check( done, function ()
						{
							var circle = mySketch.lastdrawn.widgetGroup.select("circle");
							expect(circle.attr('cx')).to.equal(xScale(.6).toString());
							expect(circle.attr('cy')).to.equal(yScale(.5).toString());
						});
					}, time);
				});
				
				it('hexagons should be reflected over the horizontal line', function (done)
				{
					setTimeout( function ()
					{
						check( done, function ()
						{
							var hexagon = mySketch.lastdrawn.widgetGroup.select("polygon.hex");
							expect(hexagon.attr('points')).to.equal('63,50 80,40 97,50 97,70 80,80 63,70');
						});
					});
				});
				
				it('triangles should be reflected over the horizontal line', function (done)
				{
					setTimeout( function ()
					{
						check( done, function ()
						{
							var triangle = mySketch.lastdrawn.widgetGroup.select("polygon.tri");
							expect(triangle.attr('points')).to.equal('80,63 120,63 100,97');
						});
					});
				});
				
				it('wedges should be reflected over the horizontal line', function (done)
				{
					setTimeout( function ()
					{
						check( done, function ()
						{
							var wedge = mySketch.lastdrawn.widgetGroup.select("polygon.wedge");
							expect(wedge.attr('points')).to.equal('137,147 60,80 157,113');
						});
					});
				});
				
				it('lines should be reflected over the horizontal line', function (done)
				{
					setTimeout( function ()
					{
						check( done, function ()
						{
							var line = mySketch.lastdrawn.widgetGroup.select("line");
							expect(line.attr('x1')).to.equal(xScale(.2).toString());
							expect(line.attr('y1')).to.equal(yScale(.9).toString());
							expect(line.attr('x2')).to.equal(xScale(.2 + .5*Math.cos(-Math.PI/3)).toString());
							expect(line.attr('y2')).to.equal(yScale(.9 + .5*Math.sin(-Math.PI/3)).toString());
						});
					}, time);
				});
				it('textBits should be reflected over the horizontal line', function (done)
				{
					setTimeout( function ()
					{
						check( done, function ()
						{
							var textBit = mySketch.lastdrawn.widgetGroup.select("text");
							expect(textBit.attr('x')).to.equal(xScale(.25).toString());
							expect(textBit.attr('y')).to.equal(yScale(.65).toString());
						});
					}, time);
				});
			});
			
			
			// vertical reflection
			describe('vertical reflection', function ()
			{
				before(function (done)
				{
					mySketch.reflect(.5, null, 0, 0);
					
					xScale = mySketch.lastdrawn.xScale;
					yScale = mySketch.lastdrawn.yScale;
					
					done();
				});
				it('rectangles should be reflected over the vertical line', function (done)
				{
					setTimeout( function ()
					{
						check(done, function ()
						{
							var rectangle = mySketch.lastdrawn.widgetGroup.select("rect");
							expect(rectangle.attr('x')).to.equal(xScale(.5).toString());
							expect(rectangle.attr('y')).to.equal(yScale(.6).toString());
						});
					}, time);
				});
				it('circles should be reflected over the vertical line', function (done)
				{
					setTimeout( function ()
					{
						check(done, function ()
						{
							var circle = mySketch.lastdrawn.widgetGroup.select("circle");
							expect(circle.attr('cx')).to.equal(xScale(.4).toString());
							expect(circle.attr('cy')).to.equal(yScale(.5).toString());
						});
					}, time);
				});
				
				it('hexagons should be reflected over the vertical line', function (done)
				{
					setTimeout( function ()
					{
						check( done, function ()
						{
							var hexagon = mySketch.lastdrawn.widgetGroup.select("polygon.hex");
							expect(hexagon.attr('points')).to.equal('137,50 120,40 103,50 103,70 120,80 137,70');
						});
					});
				});
				
				it('triangles should be reflected over the vertical line', function (done)
				{
					setTimeout( function ()
					{
						check( done, function ()
						{
							var triangle = mySketch.lastdrawn.widgetGroup.select("polygon.tri");
							expect(triangle.attr('points')).to.equal('120,63 80,63 100,97');
						});
					});
				});
				
				it('wedges should be reflected over the vertical line', function (done)
				{
					setTimeout( function ()
					{
						check( done, function ()
						{
							var wedge = mySketch.lastdrawn.widgetGroup.select("polygon.wedge");
							expect(wedge.attr('points')).to.equal('63,147 140,80 43,113');
						});
					});
				});
				
				it('lines should be reflected over the vertical line', function (done)
				{
					setTimeout( function ()
					{
						check(done, function ()
						{
							var line = mySketch.lastdrawn.widgetGroup.select("line");
							expect(line.attr('x1')).to.equal(xScale(.8).toString());
							expect(line.attr('y1')).to.equal(yScale(.9).toString());
							expect(line.attr('x2')).to.equal(xScale(.8 + .5*Math.cos(-2*Math.PI/3)).toString());
							expect(line.attr('y2')).to.equal(yScale(.9 + .5*Math.sin(-2*Math.PI/3)).toString());
						});
					}, time);
				});
				it('textBits should be reflected over the vertical line', function (done)
				{
					setTimeout( function ()
					{
						check(done, function ()
						{
							var textBit = mySketch.lastdrawn.widgetGroup.select("text");
							expect(textBit.attr('x')).to.equal(xScale(.75).toString());
							expect(textBit.attr('y')).to.equal(yScale(.65).toString());
						});
					}, time);
				});
			});
			
			
			// make invisible
			describe('make invisible', function ()
			{
				before(function (done)
				{
					mySketch.setOpacity(0, 0, 0);
					
					done();
				});
				it('all shapes should have their opacity set to zero', function (done)
				{
					setTimeout( function ()
					{
						check(done, function ()
						{
							var sketch = mySketch.lastdrawn.widgetGroup.selectAll("g.shape");
							expect(sketch.style('opacity')).to.equal('0');
						});
					}, time);
				});
			});
			
			
			// make visible
			describe('make visible', function ()
			{
				before(function (done)
				{
					mySketch.setOpacity(1, 0, 0);
					
					done();
				});
				it('all shapes should have their opacity set to 1', function (done)
				{
					setTimeout( function ()
					{
						check(done, function ()
						{
							var sketch = mySketch.lastdrawn.widgetGroup.selectAll("g.shape");
							expect(sketch.style('opacity')).to.equal('1');
						});
					}, time);
				});
			});
			
			
			// change color
			describe('change color', function ()
			{
				before(function (done)
				{
					mySketch.setColor("blue", 0, 0);
					
					done();
				});
				it('all shapes should have their color changed', function (done)
				{
					setTimeout( function ()
					{
						check(done, function ()
						{
							var sketch = mySketch.lastdrawn.widgetGroup.selectAll("g.shape");
							expect(sketch.style('stroke')).to.equal('#0000ff');
					
							var textBit = mySketch.lastdrawn.widgetGroup.select("text");
							expect(textBit.style('fill')).to.equal('#0000ff');
					
							var wedge = mySketch.lastdrawn.widgetGroup.select("polygon.wedge");
							expect(wedge.style('fill')).to.equal('#0000ff');
						});
					}, time);
				});
			});
			
			
		});
    });
})();

function check(done, f)
{
	try
	{
    	f();
    	done();
  	} 
	catch(e)
	{
    	done(e);
  	}
}
