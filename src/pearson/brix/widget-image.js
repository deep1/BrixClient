/* **************************************************************************
 * $Workfile:: widget-image.js                                              $
 * *********************************************************************/ /**
 *
 * @fileoverview Implementation of the Image and CaptionedImage brix.
 *
 * The Image bric draws a scaled image in an SVGContainer.
 * The CaptionedImage bric draws a caption above or below an Image.
 *
 * Created on       May 04, 2013
 * @author          Leslie Bondaryk
 * @author          Michael Jay Lippert
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

goog.provide('pearson.brix.Image');
goog.provide('pearson.brix.CaptionedImage');

goog.require('pearson.utils.IEventManager');
goog.require('pearson.brix.SvgBric');
goog.require('pearson.brix.ILightable');

// Sample configuration objects for classes defined here
(function()
{
    // config for Image class
    var imageConfig =
        {
            id: "img1",
            URI: 'img/ch4_1.jpg',
            caption: "The Whitewater-Baldy Complex wildfire.",
            preserveAspectRatio: "xMinYMin meet",
            actualSize: {height: 960, width: 1280},
            key: "fire"
        };

    // config for CaptionedImage class
    var cimgConfig =
        {
            id: "cimg1",
            URI: 'img/ch4_1.jpg',
            caption: "The Whitewater-Baldy Complex wildfire.",
            preserveAspectRatio: "xMinYMin meet",
            actualSize: {height: 960, width: 1280},
            key: "fire",
            captionPosition: "below"
        };

});

/* **************************************************************************
 * Image                                                               */ /**
 *
 * The Image bric draws an image in an SVGContainer.
 *
 * The Image is frequently used by other brix, or drawn under other
 * brix such as LabelGroups or graphs.
 *
 * @constructor
 * @extends {pearson.brix.SvgBric}
 * @implements {pearson.brix.ILightable}
 * @export
 *
 * @param {Object}      config          -The settings to configure this Image
 * @param {string|undefined}
 *                      config.id       -String to uniquely identify this Image.
 *                                       if undefined a unique id will be assigned.
 * @param {string}      config.URI      -The URI of the image resource to be displayed.
 * @param {string}      config.caption  -The caption for the image.
 * @param {string}      config.preserveAspectRatio
 *                                      -Specify how to treat the relationship between
 *                                       the actual aspect ratio of the image and the
 *                                       area it is to be drawn in.
 * @param {!pearson.utils.ISize}
 *                      config.actualSize
 *                                      -The actual height and width in pixels of the image.
 * @param {string}      config.key      -Association key used to determine if this
 *                                       image should be highlighted.
 * @param {!pearson.utils.IEventManager=}
 *                      eventManager    -The event manager to use for publishing events
 *                                       and subscribing to them.
 *
 ****************************************************************************/
pearson.brix.Image = function (config, eventManager)
{
    // call the base class constructor
    goog.base(this);

    /**
     * A unique id for this instance of the image bric
     * @private
     * @type {string}
     */
    this.imageId_ = pearson.brix.utils.getIdFromConfigOrAuto(config, pearson.brix.Image);

    /**
     * The URI where the image resource is located.
     * @type {string}
     */
    this.URI = config.URI;

    /**
     * The caption for the image.
     * @type {string}
     */
    this.caption = config.caption;

    /**
     * String that determines if the aspect ratio of the image should be preserved, and if
     * so how it should be laid out in the viewport. The values that are allowed are defined by svg.
     * @see {@link https://developer.mozilla.org/en-US/docs/SVG/Attribute/preserveAspectRatio|SVG Doc on preserveAspectRatio}
     *
     * @type {string}
     * @default "xMinYMin meet"
     */
    this.preserveAspectRatio = config.preserveAspectRatio || "xMinYMin meet";

    /**
     * The actual size in pixels of the image resource.
     * @todo determine if there is a simple way to figure out the actual size
     *       at runtime instead of forcing the user to specify it.
     * @type {!pearson.utils.ISize}
     */
    this.actualSize = config.actualSize;

    /**
     * Association key used to determine if this image should be highlighted.
     * @type {string}
     */
    this.key = config.key;

    /**
     * List of child brix which are to be drawn in this Image's container area.
     * Child brix are added using {@link pearson.brix.Image.append}.
     * @type {Array.<pearson.brix.SvgBric>}
     */
    this.childBrix = [];

    /**
     * The event manager to use to publish (and subscribe to) events for this widget
     * @type {!pearson.utils.IEventManager}
     */
    this.eventManager = eventManager || pearson.utils.IEventManager.dummyEventManager;

    /**
     * The scale functions set explicitly for this Image using setScale.
     * Image doesn't use scale functions, but they may get used in a brixStac, such
     * as an image behind a graph or labels on top of an image.
     * A default data extent of [0,1] will be mapped to the given
     * container area, allowing location on the image to be specified in % of height/width
     * @private
     * @type Object
     * @property {function(number): number}
     *                      xScale  -function to convert a horizontal data offset
     *                               to the pixel offset into the data area.
     * @property {function(number): number}
     *                      yScale  -function to convert a vertical data offset
     *                               to the pixel offset into the data area.
     */
    this.explicitScales_ = {xScale: null, yScale: null};

    /**
     * Information about the last drawn instance of this image (from the draw method)
     * @type {Object}
     */
    this.lastdrawn =
        {
            container: null,
            size: {height: 0, width: 0},
            widgetGroup: null,
        };
}; // end of Image constructor
goog.inherits(pearson.brix.Image, pearson.brix.SvgBric);

/**
 * Prefix to use when generating ids for instances of Image.
 * @const
 * @type {string}
 */
pearson.brix.Image.autoIdPrefix = "img_auto_";

/* **************************************************************************
 * Image.draw                                                          */ /**
 *
 * @inheritDoc
 * @export
 *
 * @description The following is here until jsdoc supports the inheritDoc tag.
 * Draw this Image in the given container.
 *
 * @param {!d3.selection}   container   -The container svg element to append
 *                                       this SvgBric element tree to.
 * @param {!pearson.utils.ISize}
 *                          size        -The size (in pixels) of the area this
 *                                       SvgBric has been allocated.
 ****************************************************************************/
pearson.brix.Image.prototype.draw = function (container, size)
{
    this.lastdrawn.container = container;
    this.lastdrawn.size = size;
    this.lastdrawn.URI = this.URI;
    this.lastdrawn.caption = this.caption;

    var imgSize = this.actualSize;

    this.setLastdrawnScaleFns2ExplicitOrDefault_(size);

    // make a group to hold the image
    var imageGroup = container.append("g")
        .attr("class", "brixImage")
        .attr("id", this.imageId_);

    // Rect for the background of the viewbox in case the image doesn't fill it
    imageGroup
        .append("rect")
            .attr("class", "background")
            .attr("width", size.width)
            .attr("height", size.height);

    // Draw the image itself
    imageGroup
        .append("image")
            .attr("xlink:href", this.URI)
            .attr("preserveAspectRatio", this.preserveAspectRatio)
            // images should scale down if the container is smaller than actual size, but should not
            // scale up (their actual size should be their maximum size).
            //.attr("width", imgSize.width > size.width ? size.width : imgSize.width)
            //.attr("height", imgSize.height > size.height ? size.height : imgSize.height)
            // Because of preserveAspectRatio, the actual size of the image is used to scale
            // proportionally (magically read by the browser somehow).  So, if the container is not
            // the same h/w proportions as the image, it will stretch or shrink to fit into the
            // dimension nearest the actual size corresponding dimension.
            .attr("width", size.width)
            .attr("height", size.height)
            .append("desc")
                .text(this.caption);

    // Rect to highlight this image when needed will get a box with
    // stroke of 2 px on each side.
    var hilightWidth = 4;
    imageGroup
        .append("rect")
            .attr("class", "highlight")
            .attr("width", size.width - hilightWidth)
            .attr("height", size.height - hilightWidth)
            .attr("stroke-width", hilightWidth)
            .attr("x", hilightWidth / 2)
            .attr("y", hilightWidth / 2);

    this.lastdrawn.widgetGroup = imageGroup;

    // Draw any child widgets that got appended before draw was called
    this.childBrix.forEach(this.drawBric_, this);

}; // end of Image.draw()

/* **************************************************************************
 * Image.redraw                                                        */ /**
 *
 * Redraw the image as it may have been changed (new URI or caption). It will be
 * redrawn into the same container area as it was last drawn.
 * @export
 *
 ****************************************************************************/
pearson.brix.Image.prototype.redraw = function ()
{
    // TODO: Do we want to allow calling redraw before draw (ie handle it gracefully
    //       by doing nothing? -mjl
    var image = this.lastdrawn.widgetGroup.select("image");
    image.attr("xlink:href", this.URI);

    var desc = image.select("desc");
    desc.text(this.caption);

    this.childBrix.forEach(this.redrawBric_, this);
};

/* **************************************************************************
 * Image.drawBric_                                                     */ /**
 *
 * Draw the given child bric in this image's area.
 * This image must have been drawn BEFORE this method is called or
 * bad things will happen.
 * @private
 *
 * @param {pearson.brix.SvgBric}    bric    -The child bric to draw
 *
 * @todo implement some form of error handling! -mjl
 *
 ****************************************************************************/
pearson.brix.Image.prototype.drawBric_ = function (bric)
{
    bric.setScale(this.lastdrawn.xScale, this.lastdrawn.yScale);
    bric.draw(this.lastdrawn.widgetGroup, this.lastdrawn.size);
};

/* **************************************************************************
 * Image.redrawBric_                                                   */ /**
 *
 * Redraw the given child bric.
 * This image and given child bric must have been drawn BEFORE this
 * method is called or bad things will happen.
 * @private
 *
 * @param {pearson.brix.SvgBric}    bric    -The child bric to redraw
 *
 * @todo implement some form of error handling! -mjl
 *
 ****************************************************************************/
pearson.brix.Image.prototype.redrawBric_ = function (bric)
{
    bric.redraw();
};

/* **************************************************************************
 * Image.changeImage                                                   */ /**
 *
 * Change the URI of this Image and/or the caption. After changing the
 * image it should be redrawn.
 * @export
 *
 * @param   {?string}   uri         -The new URI for the image. If null, the URI
 *                                   will not be changed.
 * @param   {string=}   caption     -The new caption for the image.
 *
 ****************************************************************************/
pearson.brix.Image.prototype.changeImage = function (uri, caption)
{
    if (uri)
    {
        this.URI = uri;
    }

    if (caption !== undefined)
    {
        this.caption = caption;
    }
};

/* **************************************************************************
 * Image.setScale                                                      */ /**
 *
 * Called to preempt the normal scale definition which is done when the
 * bric is drawn. This is usually called in order to force one widget
 * to use the scaling/data area calculated by another widget.
 *
 * @param {function(number): number}
 *                      xScale  -function to convert a horizontal data offset
 *                               to the pixel offset into the data area.
 * @param {function(number): number}
 *                      yScale  -function to convert a vertical data offset
 *                               to the pixel offset into the data area.
 *
 ****************************************************************************/
pearson.brix.Image.prototype.setScale = function (xScale, yScale)
{
    this.explicitScales_.xScale = xScale;
    this.explicitScales_.yScale = yScale;
};

/* **************************************************************************
 * Image.append                                                        */ /**
 *
 * Append the bric or brix to this image and draw it/them on top
 * of the image and any brix appended earlier. If append
 * is called before draw has been called, then the appended bric(s) will be
 * drawn when draw is called.
 * @export
 *
 * @param {!pearson.brix.SvgBric|Array.<!pearson.brix.SvgBric>}
 *                      svgBrix     -The svg bric or array of svg brix to be
 *                                   drawn in this image's area.
 *
 ****************************************************************************/
pearson.brix.Image.prototype.append = function(svgBrix)
{
    if (!goog.isArray(svgBrix))
    {
        this.append_one_(/**@type {!pearson.brix.SvgBric}*/ (svgBrix));
    }
    else
    {
        svgBrix.forEach(this.append_one_, this);
    }

}; // end of Image.append()

/* **************************************************************************
 * Image.append_one_                                                   */ /**
 *
 * Helper for append that does the work needed to append a single widget.
 *
 * @param {!pearson.brix.SvgBric}
 *                      bric    -The bric which is to be drawn in this image's
 *                               area.
 *
 * @private
 *
 ****************************************************************************/
pearson.brix.Image.prototype.append_one_ = function(bric)
{
    this.childBrix.push(bric);

    if (this.lastdrawn.container !== null)
        this.drawBric_(bric);

}; // end of Image.append_one_()

/* **************************************************************************
 * Image.lite                                                          */ /**
 *
 * Highlight the image if it is identified by the given liteKey.
 * @export
 *
 * @param {string}  liteKey -The key associated with this image if it is to be highlighted.
 *
 ****************************************************************************/
pearson.brix.Image.prototype.lite = function (liteKey)
{
    var shouldHilight = liteKey === this.key;
    this.lastdrawn.widgetGroup.classed('lit', shouldHilight);
};

/* **************************************************************************
 * Image.setLastdrawnScaleFns2ExplicitOrDefault_                       */ /**
 *
 * Set this.lastdrawn.xScale and yScale to those stored in explicitScales
 * or to the default scale functions w/ a data domain of [0,1].
 * @private
 *
 * @param {!pearson.utils.ISize}
 *                      cntrSize    -The pixel size of the container given to draw().
 *
 ****************************************************************************/
pearson.brix.Image.prototype.setLastdrawnScaleFns2ExplicitOrDefault_ = function (cntrSize)
{
    if (this.explicitScales_.xScale !== null)
    {
        this.lastdrawn.xScale = this.explicitScales_.xScale;
    }
    else
    {
        // map the default x data domain [0,1] to the whole width of the container
        this.lastdrawn.xScale = d3.scale.linear().rangeRound([0, cntrSize.width]);
    }

    if (this.explicitScales_.yScale !== null)
    {
        this.lastdrawn.yScale = this.explicitScales_.yScale;
    }
    else
    {
        // map the default y data domain [0,1] to the whole height of the container
        // but from bottom to top
        this.lastdrawn.yScale = d3.scale.linear().rangeRound([cntrSize.height, 0]);
    }
}; // end of Image.setLastdrawnScaleFns2ExplicitOrDefault_()

/* **************************************************************************
 * CaptionedImage                                                      */ /**
 *
 * The CaptionedImage bric draws an image in an SVGContainer with a caption.
 *
 * @constructor
 * @extends {pearson.brix.Image}
 * @export
 *
 * @param {Object}      config          -The settings to configure this CaptionedImage
 * @param {string|undefined}
 *                      config.id       -String to uniquely identify this CaptionedImage.
 *                                       if undefined a unique id will be assigned.
 * @param {string}      config.URI      -The URI of the image resource to be displayed.
 * @param {htmlString}  config.caption  -The caption for the image.
 * @param {string}      config.preserveAspectRatio
 *                                      -Specify how to treat the relationship between
 *                                       the actual aspect ratio of the image and the
 *                                       area it is to be drawn in.
 * @param {pearson.utils.ISize}
 *                      config.actualSize
 *                                      -The actual height and width in pixels of the image.
 * @param {number}      config.displayWidth
 *                                      -The column width in pixels for this bric when displayed.
 * @param {string}      config.key      -Association key used to determine if this
 *                                       image should be highlighted.
 * @param {string}      config.captionPosition
 *                                      -Where the caption should be placed in
 *                                       relation to the image.
 * @param {!pearson.utils.IEventManager=}
 *                      eventManager    -The event manager to use for publishing events
 *                                       and subscribing to them.
 *
 ****************************************************************************/
pearson.brix.CaptionedImage = function (config, eventManager)
{
    /**
     * A unique id for this instance of the captioned image bric
     * @private
     * @type {string}
     */
    this.captionedId_ = pearson.brix.utils.getIdFromConfigOrAuto(config, pearson.brix.CaptionedImage);

    // call the base class constructor
    config.id = this.captionedId_ + '_base';
    goog.base(this, config, eventManager);

    /**
     * Where the caption should be placed in relation to the image.
     *
     * - "above" : The caption should be below the image.
     * - "below" : The caption should be above the image.
     *
     * @type {string}
     */
    this.captionPosition = config.captionPosition;

    /**
     * Column width (in pixels) which is the full size display, with margins.
     * @note This sets the width at which captions display at full font size.
     * If not set, the default is for a two-column layout with even column widths.
     * @private
     * @type {number}
     */
    this.displayWidth_ = config.displayWidth || 457;

    /**
    * The margin size (in pixels) for the captioned image
    * @private
    * @type {number}
    */

    this.marginSize_ = 0;

    /**
     * The full size (in pixels) of the caption.
     * @note Currently the caption height is hardcoded, eventually we should measure it.
     * @private
     * @type {!pearson.utils.ISize}
     */
    this.captionSize_ = new pearson.utils.Size(80, this.displayWidth_);

    // Draw the caption
    var captionRendered = d3.select('body')
                        .append("div")
                        .style('visibility', 'hidden')
                        .style('width', this.displayWidth_ + "px")
                        .attr("class", "brixImageCaption")
                        .html(this.caption);

    // measure the caption height, and reset the associated sizes to match what was rendered
    // then remove the dummy caption
    this.captionSize_.height = captionRendered.node().offsetHeight + 2 * this.marginSize_;
    captionRendered.remove();

    var aspectRatio = this.actualSize.height/this.actualSize.width;
    var viewboxWidth = this.displayWidth_ - 2 * this.marginSize_;
    /**
    * The the viewbox size (in pixels) for the captioned image
    * @note Subtract the margin from either side of the image display width to get the
    * width of the image viewbox.  The image will proportionally size itself but the
    * viewbox height needs to be set or risk truncation. Will also be used to
    * position the caption below.
    * @private
    * @type {!pearson.utils.ISize}
    */
    this.imageDisplaySize_ = new pearson.utils.Size(aspectRatio * viewboxWidth, viewboxWidth);

    /**
     * Information about the last drawn instance of this image (from the draw method)
     * @type {Object}
     */
    this.captioned_lastdrawn =
        {
            container: null,
            size: {height: 0, width: 0},
            widgetGroup: null,
            URI: null,
            caption: null,
        };
}; // end of CaptionedImage constructor
goog.inherits(pearson.brix.CaptionedImage, pearson.brix.Image);

/**
 * Prefix to use when generating ids for instances of CaptionedImage.
 * @const
 * @type {string}
 */
pearson.brix.CaptionedImage.autoIdPrefix = "cimg_auto_";

/* **************************************************************************
 * CaptionedImage.getSizeAt100Pct                                      */ /**
 *
 * Get the size of this captioned Image at full size. That is the size of the
 * full size image with the caption below it.
 * @export
 *
 * @returns {!pearson.utils.Size} the size in pixels of this CaptionedImage at
 *          full size.
 *
 ****************************************************************************/
pearson.brix.CaptionedImage.prototype.getSizeAt100Pct = function ()
{
    return new pearson.utils.Size(this.imageDisplaySize_.height + this.captionSize_.height,
                                  this.imageDisplaySize_.width);
};

/* **************************************************************************
 * CaptionedImage.draw                                                 */ /**
 *
 * @inheritDoc
 * @export
 *
 * @description The following is here until jsdoc supports the inheritDoc tag.
 * Draw this CaptionedImage in the given container.
 *
 * @param {!d3.selection}   container   -The container svg element to append
 *                                       this SvgBric element tree to.
 * @param {!pearson.utils.ISize}
 *                          size        -The size (in pixels) of the area this
 *                                       SvgBric has been allocated.
 ****************************************************************************/
pearson.brix.CaptionedImage.prototype.draw = function (container, size)
{
    this.captioned_lastdrawn.container = container;
    this.captioned_lastdrawn.size = size;
    this.captioned_lastdrawn.URI = this.URI;
    this.captioned_lastdrawn.caption = this.caption;

    // aliases of utility functions for readability
    var attrFnVal = pearson.brix.utils.attrFnVal;
    

    // make a group to hold the image
    var widgetGroup = container.append("g")
        .attr("class", "brixCaptionedImage")
        .attr("id", this.captionedId_);

    // captioned images take the whole container height and subtract the caption height
    // to leave the available image window height.  Eventually we need to invert this logic
    // so the image height (after any proportional scaling due to displayWidth) + measured
    // caption height is used to fixup the container height.

    // group for the background and image
    var imageDisplayGroup = widgetGroup.append("g");

    // Rect for the background of the captioned viewbox
    imageDisplayGroup.append("rect")
            .attr("class", "background")
    //  shrunk by two and translated down and over 1 so you can see the 1 px outline
            .attr('transform', attrFnVal('translate', 1, 1))
            .attr("width", this.displayWidth_ - 2)
            .attr("height", this.imageDisplaySize_.height + 2 * this.marginSize_);

    // Draw the image
    var imageGroup = imageDisplayGroup.append("g")
            .attr('transform', attrFnVal('translate', this.marginSize_, this.marginSize_));
        goog.base(this, 'draw', imageGroup, this.imageDisplaySize_);

    // Draw the caption
    var captionGroup = widgetGroup.append("g");

    var captionBody = captionGroup.append("foreignObject")
            .attr("width", this.captionSize_.width)
            .attr("height", this.captionSize_.height)
            .append("xhtml:body")
            // this interior body shouldn't inherit margins from page body
                .style("margin", "0px");


    var captionDiv = captionBody.selectAll('brixImageCaption').data([this.caption]);

    captionDiv.enter()
                .append("div")
                .attr("class", "brixImageCaption")
                .html(function (d) { return d;});


    // position the caption
    if (this.captionPosition === "above")
    {
        imageDisplayGroup.attr("transform", attrFnVal("translate", 0,
            this.captionSize_.height - 2 * this.marginSize_));

    }
    else // assume below
    {
        captionGroup.attr("transform", attrFnVal("translate", 0,
            this.imageDisplaySize_.height + 2 * this.marginSize_));
    }

    this.captioned_lastdrawn.widgetGroup = widgetGroup;

} // end of CaptionedImage.draw()

/* **************************************************************************
 * CaptionedImage.redraw                                               */ /**
 *
 * Redraw the image as it may have been changed (new URI or caption). It will be
 * redrawn into the same container area as it was last drawn.
 * @export
 *
 ****************************************************************************/
pearson.brix.CaptionedImage.prototype.redraw = function ()
{
    // TODO: Do we want to allow calling redraw before draw (ie handle it gracefully
    //       by doing nothing? -mjl
    goog.base(this, 'redraw');

    // HACKALERT: Swapping the style around only serves to force a redisplay of
    // the caption, which otherwise doesn't refresh in many browsers
    //
    var captionGroup = this.captioned_lastdrawn.widgetGroup;

    (captionGroup.style('display') == 'block') ? captionGroup.style('display','inline') : captionGroup.style('display','block');

    // NOTE: for some reason foreignObject in a d3 selector doesn't work
    //       but body does.
    var captionDiv = this.captioned_lastdrawn.widgetGroup.select("g body div");
    captionDiv.html(this.caption);

};

/* **************************************************************************
 * CaptionedImage.changeImage                                          */ /**
 *
 * Change the URI of this Image and/or the caption. After changing the
 * image it should be redrawn.
 * @export
 *
 * @param   {?string}   uri         -The new URI for the image. If null, the URI
 *                                   will not be changed.
 * @param   {string=}   caption     -The new caption for the image.
 *
 ****************************************************************************/
pearson.brix.CaptionedImage.prototype.changeImage = function (uri, caption)
{
    goog.base(this, 'changeImage', uri, caption);
};

/* **************************************************************************
 * CaptionedImage.setScale                                             */ /**
 *
 * Called to preempt the normal scale definition which is done when the
 * widget is drawn. This is usually called in order to force one widget
 * to use the scaling/data area calculated by another widget.
 * This will actually set the scale of the encapsulated Image, not of
 * the CaptionedImage itself, as appended widgets will also be appended
 * to the encapsulated Image.
 *
 * @param {function(number): number}
 *                      xScale  -function to convert a horizontal data offset
 *                               to the pixel offset into the data area.
 * @param {function(number): number}
 *                      yScale  -function to convert a vertical data offset
 *                               to the pixel offset into the data area.
 *
 ****************************************************************************/
pearson.brix.CaptionedImage.prototype.setScale = function (xScale, yScale)
{
    goog.base(this, 'setScale', xScale, yScale);
};

/* **************************************************************************
 * CaptionedImage.append                                               */ /**
 *
 * Append the bric or brix to the encapsulated image.
 * @export
 *
 * @param {!pearson.brix.SvgBric|Array.<pearson.brix.SvgBric>}
 *                      svgBrix     -The svg bric or array of svg brix to be
 *                                   drawn in this encapsulated image's area.
 *
 ****************************************************************************/
pearson.brix.CaptionedImage.prototype.append = function(svgBrix)
{
    goog.base(this, 'append', svgBrix);

}; // end of CaptionedImage.append()


