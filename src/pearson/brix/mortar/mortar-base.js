/* **************************************************************************
 * $Workfile:: mortar-base.js                                               $
 * *********************************************************************/ /**
 *
 * @fileoverview Defines {@link pearson.brix.mortar.Mortar} and other abstract base classes for mortar
 *
 * Created on		October 2, 2013
 * @author			Michael Jay Lippert
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

goog.provide('pearson.brix.mortar.Mortar');

/**
 * the pearson.brix.mortar namespace contains the mortar classes that are
 * used to connect brix together.
 * @namespace {!Object} pearson.brix.mortar
 */
pearson.brix.mortar;

/* **************************************************************************
 * Abstract Base Classes
 * **************************************************************************/

/* **************************************************************************
 * Mortar                                                              */ /**
 *
 * Base class constructor used only by derived Mortar instances.
 *
 * @constructor
 * @extends {pearson.brix.BuildingBlock}
 *
 * @classdesc
 * A Mortar is an object that provides functionality to connect Brix.
 * For example a mortar object can highlight elements of one Bric when
 * elements of a different Bric are selected. Or a mortar object can
 * calculate a new value for one Bric when a value in a different Bric
 * has been changed.
 *
 ****************************************************************************/
pearson.brix.mortar.Mortar = function ()
{
};

/* **************************************************************************
 * Mortar.getId                                                        */ /**
 *
 * Returns the ID of this mortar.
 *
 * @returns {string} The ID of this Mortar.
 *
 ****************************************************************************/
pearson.brix.mortar.Mortar.prototype.getId = function ()
{
    // There is no id defined unless the derived class defines one and
    // overrides this method.
    return 'override in derived class for real id';
};

