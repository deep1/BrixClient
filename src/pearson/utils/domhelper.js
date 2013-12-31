/* **************************************************************************
 * $Workfile:: domhelper.js                                                 $
 * *********************************************************************/ /**
 *
 * @fileoverview Document Model Helper class.
 *
 * DomHelper class contains utility functions to  query and manipulate and 
 * DOM objects. 
 *
 * @note currently there is no DomHelper class, it's just a namespace.
 * By the way I've seen it used, it looks like perhaps it should be a
 * class, if so, we need to make it one. -mjl
 * [ysa] Planning to change into class that accept as constructor param the 
 * document to associate with this DomHelper (similar to http://docs.closure-library.googlecode.com/git/class_goog_dom_DomHelper.html)
 *
 * Created on       August 14, 2013
 * @author          Young Suk Ahn Park
 *
 * **************************************************************************/

goog.provide('pearson.utils.DomHelper');

/* **************************************************************************
 * DomHelper.buildQueryStringFromParams                                */ /**
 *
 * Builds and returns a queryString from &lt;param&gt; tags inside of the provided 
 * &lt;object&gt; element node. 
 *
 * @param {Element} objectNode   -The object node that will be changed to iframe, and contains the params.
 *
 * @return {string} The query string as: [param1]=[value1]&[param2]=[value2]...
 */
pearson.utils.DomHelper.buildQueryStringFromParams = function (objectNode)
{
    var params = objectNode.querySelectorAll('param');
    var queryString = [].reduce.call(params, function(acc, paramNode){
        var name = paramNode.getAttribute('name');
        var value = paramNode.getAttribute('value');

        if (acc) acc += '&';
        return acc + encodeURIComponent(name) + '=' + encodeURIComponent(value);
    }, '');
    return queryString;
};

/* **************************************************************************
 * DomHelper.convertObjectToIframeElement                              */ /**
 *
 * Converts the object element to iframe element. (As the function name implies) 
 *
 * @param {string} classAttr       -The class for selecting the object element
 *                                  to be converted. (i.e. 'bric')
 *
 */
pearson.utils.DomHelper.convertObjectToIframeElement = function (classAttr)
{
    // Turn the <object> tags into <iframe> tags to work around webkit bug https://bugs.webkit.org/show_bug.cgi?id=75395.
    // Also append parameters to iframe url so they're accessible to the iframe implementation.
    // To prevent the flicker when loading, you might want to do this transformation work before rendering the HTML in your player.
    var objectNodes = document.querySelectorAll('object.' + classAttr);
    [].forEach.call(objectNodes, function(objectNode){
        var iframeNode = document.createElement('iframe');
        iframeNode.setAttribute('sandbox', 'allow-scripts');

        // Copy over white-listed attributes from the <object> to the <iframe>.
        ['height','width','class','style'].forEach(function(attrName){
            var attrValue = objectNode.getAttribute(attrName);
            if (attrValue !== null) iframeNode.setAttribute(attrName, attrValue);
        });

        var queryString = pearson.utils.DomHelper.buildQueryStringFromParams(objectNode);
        if (queryString.length > 0)
            queryString = '?' + queryString;
        var url = objectNode.getAttribute('data') + queryString;
        iframeNode.setAttribute('src', url);
        // Swap the <object> for the <iframe> node.
        objectNode.parentNode.replaceChild(iframeNode, objectNode);
    });
};

/* **************************************************************************
 * DomHelper.scanElements                                              */ /**
 * 
 * Scans objects with particular class attribute and return an
 * array of objects composed o data-* attributes.
 * For example <div class="bric" data-id="MyID" data-server-url="http://xyz.com" data-index="34" />
 * Will return [{id:"MyID", serverUrl:"http://xyz.com", index="34"}]
 * Notice that it uses the name transform of the HTML5's data-* (server-url => serverUrl)
 * 
 * @param  {string} classAttr      The HTML class that should match for scanning
 * @param  {string=} opt_nodeType  The HTML node type, e.g.: div, iframe, default is 'div'
 * 
 * @return {Array.<Object>}        Array of objects where each object represents an entry
 *                                 composed of dataset name value pair.
 */
pearson.utils.DomHelper.scanElements = function (classAttr, opt_nodeType)
{
    var queryString = opt_nodeType ? opt_nodeType + '.' : 'div.';
    queryString = queryString + classAttr;

    var matches = document.querySelectorAll(queryString);

    var result = [];
    for (var i = 0; i < matches.length; i++)
    {
        var entry = {};
        /* Shall the ID be added as well?
        var id = matches[i].getAttribute('id');
        if (id)
        {
            entry.id = id;
        }*/
        // Iterate over the dat-* attributes
        var dataset = matches[i].dataset;
        for (var prop in dataset)
        {
            entry[prop] = dataset[prop];
        }
        result.push(entry);
    }

    return result;
};

/* **************************************************************************
 * DomHelper.scanObjects                                              */ /**
 * 
 * Scans objects with particular class attribute and return an
 * array of objects composed o parameters.
 * For example:
 * <object class="bric">
 *     <param name="" value="">
 *     <param name="" value="">
 * </object>
 * 
 * @param  {string} classAttr   -The HTML class that should match for scanning
 * 
 * @return {Array.<Object>}      Array of objects where each object represents an entry
 *                               composed of dataset name value pair.
 */
pearson.utils.DomHelper.scanObjects = function (classAttr)
{
    var queryString = 'object.' + classAttr;

    var matches = document.querySelectorAll(queryString);

    var result = [];
    for (var i = 0; i < matches.length; i++)
    {
        var entry = {};
        
        /* Shall the ID be added as well?
        var id = matches[i].getAttribute('id');
        if (id)
        {
            entry.id = id;
        }*/

        var params = matches[i].getElementsByTagName('param');
        for (var j = 0; j < params.length; j++)
        {
            var prop = params[j].getAttribute('name');
            entry[prop] = params[j].getAttribute('value');
        }
        
        result.push(entry);
    }

    return result;
};
