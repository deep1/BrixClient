/* **************************************************************************
 * brix-image-spec.js                                                       $
 * **********************************************************************//**
 *
 * @fileoverview image and captioned image brix unit tests
 *
 * Created on		Oct 1, 2013
 * @author			Leslie Bondaryk
 *
 * Copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

'use strict';


(function () {
  	var expect = chai.expect;

	var EventManager = pearson.utils.EventManager;
	var Image = pearson.brix.Image;
	var CaptionedImage = pearson.brix.CaptionedImage;


    describe('Images wif and wifout captions: you want fries with that?', function () {
		var eventManager = null;

        describe('Creating an image bric', function () {
			var configImg =
                {
                    id: 'foo',
                    URI: 'img/test1.jpg',
                    caption: "The seasons",
                    actualSize: {height: 366, width: 443}
                };
			var myImage = null;
			
			before(function () {
				myImage = new Image(configImg);
			});
			
            it('should have the id specified in the config', function () {
                // we're testing a private member here
                expect(myImage.imageId_).to.equal(configImg.id);
            });

			it('should have an uninitialized lastdrawn property', function () {
                expect(myImage.lastdrawn).to.have.property('container').that.is.null;
                expect(myImage.lastdrawn).to.have.deep.property('size.height', 0);
                expect(myImage.lastdrawn).to.have.deep.property('size.width', 0);
                expect(myImage.lastdrawn).to.have.property('widgetGroup').that.is.null;
            });
 		

        describe('DOM manipulation (create/update elements) tests', function () {
				var configCntr = {
					node: null,
					maxSize: {width: 477, height: 300}
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
						cntr.append(myImage);
					});
					
					it('should set the lastdrawn container and size properties to the values passed in', function () {
						// get the last element of the container
						// note: this uses internal knowledge of SVGContainer.append which may change. -mjl
						var cntrArg = cntr.svgObj.select("g.brix:last-child");
						var sizeArg = {height: 300, width: 477};
						expect(myImage.lastdrawn.container.node()).to.deep.equal(cntrArg.node());
						expect(myImage.lastdrawn.size).to.deep.equal(sizeArg);
					});

					it('should have appended a group element with class "brixImage" to the container' +
						' and set the lastdrawn.widgetGroup to that d3 selection', function () {
						// get the last element of the container
						// note: this uses internal knowledge of SVGContainer.append which may change. -mjl
						var last = cntr.svgObj.select("g.brix:last-child :last-child");
						expect(last.node().nodeName).to.equal('g');
						expect(last.classed('brixImage')).to.be.true;
						expect(myImage.lastdrawn.widgetGroup.node()).to.deep.equal(last.node());
					});

					it('should create a background rect, an image tag, and a highlight rect', function () {
						/*
						 g.brixImage
						 	rect.background
						 	image
								desc
							rect.highlight
						 */
						var tree =
							{ name: 'g', class: 'brixImage', children:
								[
                                    { name: 'rect', class: 'background' },
                                    { name: 'image', children:
                                        [ { name: 'desc' } ]
                                    },
                                    { name: 'rect', class: 'highlight' }
                                ],
							};

						helper.expectElementTree(myImage.lastdrawn.widgetGroup, tree);
					});

					it('should create an image tag with the size properties to the values passed in', function () {
						// get the last element of the container
						// note: this uses internal knowledge of SVGContainer.append which may change. -mjl
						var sizeArg = {height: '300', width: '477'};
						expect(myImage.lastdrawn.widgetGroup.select('image').attr('height')).to.equal(sizeArg.height);
						expect(myImage.lastdrawn.widgetGroup.select('image').attr('width')).to.equal(sizeArg.width);
					});
				});
			});
		});

		describe('Creating a captioned image bric', function () {
			var configCImg =
                {
                    id: 'foo',
                    URI: 'img/squaresTest.png',
                    caption: "One Line",
                    actualSize: {height: 200, width: 200}
                };
			var myCImage = null;
			
			before(function () {
				myCImage = new CaptionedImage(configCImg);
			});
			
            it('should have the id specified in the config', function () {
                // we're testing a private member here
                expect(myCImage.imageId_).to.equal(configCImg.id);
            });

            it('should set a default display width of 457', function () {
                // we're testing a private member here
                expect(myCImage.displayWidth_).to.equal(457);
            });

			it('should have an uninitialized lastdrawn property', function () {
                expect(myCImage.lastdrawn).to.have.property('container').that.is.null;
                expect(myCImage.lastdrawn).to.have.deep.property('size.height', 0);
                expect(myCImage.lastdrawn).to.have.deep.property('size.width', 0);
                expect(myCImage.lastdrawn).to.have.property('widgetGroup').that.is.null;
            });
 		

        describe('DOM manipulation (create/update elements) tests', function () {
				var configCntr = {
					node: null,
					//the container size gets ignored
					maxSize: {width: 477, height: 300}
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
						cntr.append(myCImage);
					});
					
					it('should set the captioned_lastdrawn container property to the container passed in', function () {
						// get the last element of the container
						// note: this uses internal knowledge of SVGContainer.append which may change. -mjl
						var cntrArg = cntr.svgObj.select("g.brix:last-child");
						expect(myCImage.captioned_lastdrawn.container.node()).to.deep.equal(cntrArg.node());
					});

					// this test needs a way to hard set a font size so it isn't so fragile
					it.skip('A square image should stay square plus ' +
						' caption + margins (one-line caption = 19 at 16px Helvetica)', function () {
						// get the last element of the container
						// note: this uses internal knowledge of SVGContainer.append which may change. -mjl
						var cntrArg = cntr.svgObj.select("g.brix:last-child");
						var sizeArg = {height: myCImage.displayWidth_ - 2 * myCImage.marginSize_, width: myCImage.displayWidth_ -  2 * myCImage.marginSize_};
						expect(myCImage.imageDisplaySize_).to.deep.equal(sizeArg);
						expect(myCImage.captionSize_.height).to.deep.equal(19 + 2 * myCImage.marginSize_);
					});

					it('should create a background rect, a foreignObject caption, and an image rect tree', function () {
						/*
						g.brixCaptionedImage
							g 
								rect.background
								g
									g.brixImage
										rect.background
											image
												desc
										rect.highlight
							g
								foreignobject
						 */
						var tree =
							{ name: 'g', class: 'brixCaptionedImage', children:
								[ 
									{ name: 'g', children:
										[
                                    		{ name: 'rect', class: 'background' },
                                    		{ name: 'g', children: 
                                    		[
                                    			{ name: 'g', class: 'brixImage', children:
												[
													{ name: 'rect', class: 'background' },
													{ name: 'image', children:
                                       		 			[ { name: 'desc' } ]
                                    				},
                                    				{ name: 'rect', class: 'highlight' }
                                				],
												}
											]
											}
                                    	]
                                    },
                                    { name: 'g', children:
										[ {name: 'foreignObject'} ]
									}
                                   
                                ],
							};

						helper.expectElementTree(myCImage.captioned_lastdrawn.widgetGroup, tree);
					});

					it('should create an image tag with the scaled height (Square image) that allows the image' +
						'to fill full displayWidth less margins', function () {
						// get the last element of the container
						// note: this uses internal knowledge of SVGContainer.append which may change. -mjl
						var sizeArg = {height: '457', width: '457'};
						expect(myCImage.lastdrawn.widgetGroup.select('image').attr('height')).to.equal(sizeArg.height);
						expect(myCImage.lastdrawn.widgetGroup.select('image').attr('width')).to.equal(sizeArg.width);
					});
				});
			});
		});
	});
})();
