/* **************************************************************************
 * $Workfile:: brix-labelcarousel.js                                        $
 * *********************************************************************/ /**
 *
 * @fileoverview Implementation of the Label Carousel bric.
 *
 *
 * The LabelCarousel bric draws the common configuration of a
 * {@link pearson.brix.LabelSelector} presenting a list of selectable numbered
 * labels each representing an image to be displayed in an
 * {@link pearson.brix.Image} bric below the LabelSelector.
 * The initial implementation was based on ImageViewer.
 *
 * Created on       Sept 15, 2013
 * @author          Leslie Bondaryk
 * @author          Michael Jay Lippert
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/


goog.provide('pearson.brix.LabelCarousel');

goog.require('pearson.brix.SvgBric');
goog.require('pearson.brix.Image');
goog.require('pearson.brix.CaptionedImage');
goog.require('pearson.brix.LabelSelector');
goog.require('pearson.utils.IEventManager');

// Sample configuration objects for classes defined here
(function()
{
    // config for ImageViewer class
    var labelCarouselConfig =
        {
            id: "imgvwr1",
            images: [{}],
            imagesActualSize: {height: 380, width: 550},
        };
});

/* **************************************************************************
 * LabelCarousel                                                       */ /**
 *
 * The LabelCarousel draws the common bric configuration of a Label
 * Selector presenting a collection of images with the selected
 * image displayed in an Image widget below.
 *
 * @constructor
 * @extends {pearson.brix.SvgBric}
 * @export
 *
 * @param {Object}          config          -The settings to configure this LabelCarousel
 * @param {string|undefined}
 *                          config.id       -String to uniquely identify this LabelCarousel.
 *                                           if undefined a unique id will be assigned.
 * @param {!Array.<{URI: string, caption: string, selectorLabel: string}>}
 *                          config.images   -The list of info to load the images for the carousel.
 * @param {!pearson.utils.ISize}
 *                          config.imagesActualSize
 *                                          -The actual size of all of the images.
  * @param {integer}
 *                          config.displayWidth
 *                                          -The column width at which carousel displays full size.
 * @param {!pearson.utils.IEventManager=}
 *                          eventManager    -allows the bric to publish and subscribe to events
 *                                           required for correct internal operation.
 *
 ****************************************************************************/
pearson.brix.LabelCarousel = function (config, eventManager)
{
    // call the base class constructor
    goog.base(this);

    var that = this;

    /**
     * A unique id for this instance of the LabelCarousel bric
     * @type {string}
     */
    this.id = pearson.brix.utils.getIdFromConfigOrAuto(config, pearson.brix.LabelCarousel);

    /**
     * The list of info for each image to be presented by this LabelCarousel.
     * @type {!Array.<{URI: string, caption: string, selectorLabel: string}>}
     */
    this.imagesInfo = config.images;

    this.assignMissingItemKeys_();

    // The LabelCarousel uses a standard layout of the LabelGroup to make its
    // configuration simpler.
    // @todo why a non-breaking space placeholder label, and not just a space? -mjl
    var lblselConfig =
        {
            id: this.id + "_labels",
            labels: (config.type == 'textLabels') ?
                config.images.map(function (e, i) {return e.selectorLabel || '\u00a0';}) :
                config.images.length,
            layout: "horizontal",
            type: (config.type == 'textLabels') ? 'none' : (config.type || 'numbered'),
            itemMargin: {top: 0, bottom: 15, left: 0, right: (config.type == 'textLabels') ? 0 : 10}
        };


    /**
     * The selector bric used by this LabelCarousel to present the images.
     * @type {!pearson.brix.LabelSelector}
     */
    this.labelSelector = new pearson.brix.LabelSelector(lblselConfig, eventManager);

    // We may want to eventually support an empty image, but for now
    // we'll just copy the 1st image into the display image.
    var cimgConfig =
        {
            id: this.id + "_cimg",
            URI: this.imagesInfo[0].URI,
            caption: this.imagesInfo[0].caption,
            displayWidth: config.displayWidth || 457,
            actualSize: config.imagesActualSize,
            captionPosition: "below"
        };

    /**
     * The captioned image bric which displays the image selected
     * in the carousel.
     * @type {!pearson.brix.CaptionedImage}
     */
    this.image = new pearson.brix.CaptionedImage(cimgConfig);

    /**
     * The event manager to use to publish (and subscribe to) events for this widget
     * @type {!pearson.utils.IEventManager}
     */
    this.eventManager = eventManager || pearson.utils.IEventManager.dummyEventManager;

    /**
     * The event id published when an item in this carousel is selected.
     * @const
     * @type {string}
     */
    this.selectedEventId = this.labelSelector.selectedEventId;

    /**
     * The event details for this.selectedEventId events
     * @typedef {Object} SelectedEventDetails
     * @property {string} selectKey -The key associated with the selected item.
     */
    var SelectedEventDetails;

    // event handler that connects the label selector selection to changing and redrawing
    // the image below.
    var handleLabelSelection = function (eventDetails)
    {
        that.image.changeImage(that.imagesInfo[eventDetails.index].URI,
                                that.imagesInfo[eventDetails.index].caption);
        that.image.redraw();
    };

    eventManager.subscribe(this.labelSelector.selectedEventId, handleLabelSelection);

    /**
     * Information about the last drawn instance of this image (from the draw method)
     * @type {Object}
     */
    this.lastdrawn =
        {
            container: null,
            size: {height: 0, width: config.displayWidth},
            widgetGroup: null,
        };
}; // end of LabelCarousel constructor
goog.inherits(pearson.brix.LabelCarousel, pearson.brix.SvgBric);

/**
 * Prefix to use when generating ids for instances of ImageViewer.
 * @const
 * @type {string}
 */
pearson.brix.LabelCarousel.autoIdPrefix = 'labCrsl_';

/* **************************************************************************
 * LabelCarousel.draw                                                  */ /**
 *
 * @inheritDoc
 * @export
 * @description The following is here until jsdoc supports the inheritDoc tag.
 * Draw this ImageViewer in the given container.
 *
 * @param {!d3.selection}   container   -The container svg element to append
 *                                       this SvgBric element tree to.
 * @param {!pearson.utils.ISize}
 *                          size        -The size (in pixels) of the area this
 *                                       SvgBric has been allocated.
 ****************************************************************************/
pearson.brix.LabelCarousel.prototype.draw = function (container, size)
{
    this.lastdrawn.container = container;

    // aliases of utility functions for readability
    var attrFnVal = pearson.brix.utils.attrFnVal;

    var that = this;

    // make a group to hold the imageviewer
    var widgetGroup = container.append("g")
        .attr("class", "brixLabelCarousel")
        .attr("id", this.id);

    // currently hard set height.  We might want to measure labels in future.
    var selectorHeight = 55;

    // Label selector goes at the top
    var selectorGroup = widgetGroup.append("g");
    this.labelSelector.draw(selectorGroup, {height: selectorHeight, width: size.width});

    // Swappable Image goes below
    var imageGroup = widgetGroup.append("g")
        .attr("transform", attrFnVal("translate", 0, selectorHeight));

    this.image.draw(imageGroup, {height: size.height - selectorHeight, width: size.width});

    this.lastdrawn.widgetGroup = widgetGroup;
    this.lastdrawn.size.height = this.image.captioned_lastdrawn.size.height + selectorHeight;

    // Initial selection is the 1st image
    this.selectItemAtIndex(0);

}; // end of ImageViewer.draw()

/* **************************************************************************
 * LabelCarousel.redraw                                                */ /**
 *
 * Redrawing the ImageViewer currently does nothing.
 * @export
 *
 ****************************************************************************/
pearson.brix.LabelCarousel.prototype.redraw = function ()
{
};

/* **************************************************************************
 * LabelCarousel.selectedItem                                          */ /**
 *
 * Return the selected item in the carousel.
 * @export
 *
 * @return {Object} the carousel item which is currently selected.
 *
 ****************************************************************************/
pearson.brix.LabelCarousel.prototype.selectedItem = function ()
{
    return {};
};

/* **************************************************************************
 * LabelCarousel.selectItemAtIndex                                     */ /**
 *
 * Select the item in the carousel at the given index.
 * @export
 *
 * @param {number}  index   -the 0-based index of the item to flag as selected.
 *
 ****************************************************************************/
pearson.brix.LabelCarousel.prototype.selectItemAtIndex = function (index)
{
    this.labelSelector.selectItemAtIndex(index);
};

/* **************************************************************************
 * ImageViewer.itemKeyToIndex                                          */ /**
 *
 * Find the first item in the list of items in this ImageViewer which has the
 * specified key and return its index. If no item has that key return null.
 * @export
 *
 * @param {string}  key     -The key of the item to find
 *
 * @return {?number} the index of the item in the list of items with the
 *          specified key.
 *
 ****************************************************************************/
pearson.brix.LabelCarousel.prototype.itemKeyToIndex = function(key)
{
    return this.labelSelector.itemKeyToIndex(key);
};

/* **************************************************************************
 * LabelCarousel.assignMissingItemKeys_                                */ /**
 *
 * Assign a key property value of the index in the item list to any
 * item which doesn't have a key property. This key is used for selection and
 * highlighting.
 * @private
 *
 ****************************************************************************/
pearson.brix.LabelCarousel.prototype.assignMissingItemKeys_ = function ()
{
};

/* **************************************************************************
 * LabelCarousel.lite                                                  */ /**
 *
 * Highlight the image(s) associated w/ the given liteKey (key) in the
 * carousel, and select the 1st highlighted image.
 * @export
 *
 * @param {string}      liteKey     -The key associated with the image(s) to be highlighted.
 *
 ****************************************************************************/
pearson.brix.LabelCarousel.prototype.lite = function (liteKey)
{
    window.console.log("called LabelCarousel.lite( " + liteKey + " )");

    var i = this.itemKeyToIndex(liteKey);

    if (i !== null)
    {
        this.selectItemAtIndex(i);
    }

 this.labelSelector.lite(liteKey);

}; // end of ImageViewer.lite()

