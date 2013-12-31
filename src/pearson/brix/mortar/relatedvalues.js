/* **************************************************************************
 * $Workfile:: relatedvalues.js                                             $
 * *********************************************************************/ /**
 *
 * @fileoverview Implementation of the method invoker utility.
 *
 * The Invoker will call a method on an object w/ specified arguments
 * in response to an event.
 *
 * Created on		July 24, 2013
 * @author			Michael Jay Lippert
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

/* **************************************************************************
 * RelatedValues                                                       */ /**
 *
 * Constructor for a RelatedValues.
 *
 * @constructor
 *
 * @classdesc
 * A RelatedValues contains a set of values that are interrelated along
 * with rules for changing the related values when one of them is set so
 * that the values are always consistent.
 *
 **************************************************************************/
function RelatedValues()
{
	/**
	 * The map of names of values to their actual value.
	 * @type {Array.<*>}
	 */
	this.values_ = {};
}

/* **************************************************************************
 * RelatedValues.addValue                                              */ /**
 *
 * [Description of addValue]
 *
 * @param {string}	name		-[Description of name]
 * @param {*}		value		-[Description of value]
 *
 ****************************************************************************/
RelatedValues.prototype.addValue = function(name, value)
{
};

/* **************************************************************************
 * RelatedValues.addRelation                                           */ /**
 *
 * [Description of addRelation]
 *
 * @param {string}	name		-[Description of name]
 * @param {*}		relation	-[Description of relation]
 *
 ****************************************************************************/
RelatedValues.prototype.addRelation = function(name, relation)
{
};

