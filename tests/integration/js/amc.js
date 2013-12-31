/**
 * Closure executor
 */
;(function() {
	
	var version = 1.0;
	
	/*
	 * Configture the PAF/Ecourses Namespaces.
	 */
	
	var global = (window ? window : (function (){return this;})()) ;
	global.Ecourses = global.Ecourses || {};
	global.Ecourses.Paf = global.Ecourses.Paf || {};
	
	var PAF = global.Ecourses.Paf;
	
	var logenabled = true;
	
	var log = function (e) {
		if (logenabled && console && console.log) {
			console.log (e);
		}
	};
	
	if (PAF.AMC) {
		// Someone has already added us! Hope its the same version :p
		if (PAF.AMC.version !== version) {
			console.log ("Added amc.js of different versions. " +
					"Possible conflicts could happen");
		}
		//return;
	}
	
	
	
	PAF.AMC = {};
	PAF.AMC.version = version;
	
	var _callCtx = null, ctxInited = false;
	
	PAF.AMC.enableLog = function (val) {
		logenabled = !!val;
	}
	/**
	 * AMC Level Helper function
	 */
	PAF.AMC.detectEventManager = function () {
		return global["eventManager"] ;
	};	
	
	PAF.AMC.getCallerContext = function () {
		return _callCtx;
	};
	
	PAF.AMC.initTestContext = function (laspafurl) {
		if (ctxInited) {
			log ("This function has already been called. Return as no-op");
			return;
		}
		if (!laspafurl) {
			laspafurl = "http://localhost:8080";
			log ("Test context init not supplied las base url. Using " + laspafurl);
		}
		var url = laspafurl + "/las-paf/sd/paf-service/lasapi/defaultToken";
		
		var context = null;
		ctxInited = true;
	 	$.ajax ({
	 		url : url,
	 		processData : false,
	 		type : 'GET',
	 		contentType : 'application/json',
	 		
	 		success : function (data, textStatus, jqXHR) {
	 			/*
	 			 * On success set the status and other values properly.
	 			 */
	 			context = {
	 					courseId :  "LAS-AMS-COURSE",
	 					assetId : "LAS-AMS-ASSIGNMENT",
	 					lasAuthToken : data.lasAuthToken
	 			};
	 		},
	 		
	 		error : function (jqXHR, textStatus, errorThrown ) {
	 			log ("Unable to fetch token. " + textStatus);
	 		},
	 		
			async : false		
	 	});	
	 	_callCtx = context;
	 	return context;
	}
	
	
	/**
	 * AMC Initializer
	 */
	PAF.AMC.initialize = function (io) {
		if (PAF.AMC.initialized === true) {
			log ("Already initialized. This call is a no-op");
			return;
		}

		io.laspafurl = io.laspafurl ? io.laspafurl : "";
		log ("Using paf url = [" + io.laspafurl + "]. " +
				"Empty url implies current context will be used.");
		if (!io.eventmanager) {
			var msg = "Init failed. AMC needs an event manager.";
			log (msg);
			throw msg;
		}
		var inst = 
			PAF.AMC._instance = new PAF.AMC.AMCClass (io.laspafurl, io.eventmanager);
		
		PAF.AMC.initialized = true;
		
		if (io.requestbinding && $.isArray(io.requestbinding)) {
			$.each (io.requestbinding, function (i, message) {
				if (!message.assignmenturl || !message.activityurl) {
					log ("Insufficient argument in initial 'requestbinding' request"
							+ " for message at index = " + i 
							+ ". Continuing with next message");
					return;
				}
				var msg = {};
				if (!message.replytopic) {
					msg.replytopic = 
						PAF.AMC.activityBindingReplyTopic(message);
				}
				msg.data = {
					assignmenturl : message.assignmenturl,
					activityurl : message.activityurl
				};
				
				inst.requestbinding (msg);
				
			});
		}
		
	};
	
	PAF.AMC.activityBindingReplyTopic = function (message) {
		return "init." + message.assignmenturl 
			+ "." + message.activityurl;
	};
	
	/**
	 * AMC internal class
	 */
	PAF.AMC.AMCClass = function (lasPafURL, em) {
		
		var context = this;
		this._lasPafURL = lasPafURL;
		this._em = em;
		this._msgQ = [];
		this._asgnUrlToSession = {};

		em.subscribe ("AMC", function (message /*Custom Structure*/ ) {
			log ("Revieved request. Message = " + JSON.stringify (message));
			
			if (context[message.type]) {
				// Fire
				context[message.type].call (context, message);
			} else {
				log ("No handler for type = " + message.type);
			}			

		});	
		log ("Listening for Broker started.");
		em.listenBroker ();
	};
	
	PAF.AMC.AMCClass.prototype = {
		_lasPafURL	: null,
		_em : null,
		_msgQ : null,
		
		requestbinding : function (message) {
			log ("AMC Recieved binding request = " + message.data.activityurl);
			var context = this;
			// Create handler
			if (!message.data.assignmenturl || !message.data.activityurl
					|| !message.replytopic) {
				log ("Insufficient argument in 'requestbinding' request");
				return;
			}
			var assStat = context._asgnUrlToSession[message.data.assignmenturl];
			
			if (!assStat) {
				var sr = new PAF.SessionService(context._lasPafURL);
				assStat = context._asgnUrlToSession[message.data.assignmenturl] = {
					sessionservice : sr,
					activitysequence : null
				};			
				
				var reqObj = {
					header : {
						callContext : PAF.AMC.getCallerContext()
					},
					content : (message.data.startseqdata) ? message.data.startseqdata : {
						toolSettings :  {
							assignmentUrl : message.data.assignmenturl
						}
					}
				};		
				
				if (message.data.assignemntguid) {
					reqObj.content.toolSettings.assignmentGuid 
						= message.data.assignemntguid;
				}
				sr.startSequence (reqObj);

			}
			
			var session = assStat.sessionservice;
			// Bind deferred state change listeners
			session.startSequenceDone (function (hubsession, activitySeq, param) {
				log ("Completed start sequence hubsession = " + hubsession
						+ " activity sequence = " + JSON.stringify (activitySeq) + 
						" and param = " + JSON.stringify (param) );
				// Default URL is for PAF hub directly.
				param = $.extend ({
					asRequestForAms : false
				}, param);
				
				log (JSON.stringify (param));
				if (!param.lasPafBaseUrl) {
					context._em.publish (message.replytopic, {
						status : "fail",
						sourcemessage : message
					});	
					return;
				}
				// Get the binding...
				var binding =  activitySeq.
					getBindingByBoundActitvity (message.data.activityurl);
				
				if (!binding) {
					context._em.publish (message.replytopic, {
						status : "fail",
						sourcemessage : message
					});				
					return;
				}
				
				var asreq =  {
					header : {
						"Hub-Session" : hubsession,
						"Content-Type" : "application/vnd.pearson.paf.v1.node+json"
					},
					content : {
						"@context": "http://purl.org/pearson/paf/v1/ctx/core/SequenceNode",
						"@type": "SequenceNode",
						nodeIndex : binding.bindingIndex + 1,
						targetBinding : binding["@id"]
					},
					url : (param.asRequestForAms === true ? (param.lasPafBaseUrl) : 
						activitySeq.getNodeCollection()),
					method : "POST"
				};
				
				if (param.asRequestForAms === true) {
					asreq.content.nodeCollection = activitySeq.getNodeCollection();
					asreq.content.callContext = PAF.AMC.getCallerContext();
				}
				context._em.publish (message.replytopic, {
					status : "success",
					data : {
						asrequest : asreq
					},
					sourcemessage : message
				});
				
			}).startSequenceFail (function () {
				context._em.publish (message.replytopic, {
					status : "fail",
					sourcemessage : message
				});
			});
			
		},
		
		/**
		 * This is a handler for getting sequence node.
		 * Since it is directly referenced naming
		 * conventions are not followed.
		 * UNPUBLISHED.. ONLY FOR DEMO
		 * NO CACHING.
		 * @param message
		 */
		getsequencenode : function (message) {
			var context = this;
			// Create handler
			if (!message.data.nodeindex || !message.data.targetbinding
					|| !message.data.nodecollection || !message.data.hubsession
					|| !message.replytopic) {
				log ("Insufficient parameters in 'getsequencenode' request");
				return;
			}		

			var sr = new PAF.SessionService(context._lasPafURL);
			sr.getSequenceNode ({
					header : {
						"Hub-Session" : message.data.hubsession
					},
					content : (message.data.getseqnodedata) ? message.data.getseqnodedata : {
						nodeIndex : message.data.nodeindex,
						targetBinding : message.data.targetbinding,
						nodeCollection : message.data.nodecollection
					}
			}).done (function (data) {
				context._em.publish (message.replytopic, {
					status : "success",
					data : data.data,
					sourcemessage : message
				});
			}).fail (function () {
				context._em.publish (message.replytopic, {
					status : "fail",
					sourcemessage : message
				});
			});
		},

		
		endassignment : function (message) {
			var context = this;
			// Create handler
			if (!message.data.assignmenturl 
					|| !message.replytopic) {
				log ("Insufficient argument in 'endassignment' request");
				if (message.replytopic) {
					context._em.publish (message.replytopic, {
						status : "fail",
						sourcemessage : message
					});				
				}
				return;
			}	
			
			var assStat = context._asgnUrlToSession[message.data.assignmenturl];
			
			if (!assStat) {
				var sr = new PAF.SessionService(context._lasPafURL);
				assStat = context._asgnUrlToSession[message.data.assignmenturl] = {
					sessionservice : sr,
					activitysequence : null
				};			
				
				var reqObj = {
					header : {
						callContext : PAF.AMC.getCallerContext()
					},
					content :  {
						toolSettings :  {
							assignmentUrl : message.data.assignmenturl
						}
					}
				};		
				sr.startSequence (reqObj);

			}
			
			var session = assStat.sessionservice;			
			session.startSequenceDone (function (hubsession, activitySeq, param) {
				log ("End Assignment. To use hubsession = " + hubsession
						+ " activity sequence = " + JSON.stringify (activitySeq) + 
						" and param = " + JSON.stringify (param) );
				// Default URL is for PAF hub directly.
				
				var reqO = {
					header : {
						"Hub-Session" : hubsession,
						callContext : PAF.AMC.getCallerContext()
					},
					content :  {
						assignmentUrl : message.data.assignmenturl,
						assignmentId :  activitySeq["@id"]
					}
				};	
				
				session.endAssignment (reqO)
					.done(function (data) {
						log ("Successfully posted end assignment");
						context._em.publish (message.replytopic, {
							status : "success",
							data : data,
							sourcemessage : message
						});
					}).fail (function () {
						log ("End assignment operation failed");
						context._em.publish (message.replytopic, {
							status : "fail",
							sourcemessage : message
					});	
				});
				
			}).startSequenceFail (function () {
				context._em.publish (message.replytopic, {
					status : "fail",
					sourcemessage : message
				});
			});


		}		
	};
	
	/**
	 * Sample param. "http://localhost:8080"
	 * This object reference could be preserved for further 
	 * calls using the same hub session.
	 * @param lasPafURL
	 * @returns {PAF.SessionService}
	 */
	PAF.SessionService = function(lasPafURL) {
		// Lets init all declared vars.
		this._lasPafURL = lasPafURL;
		this._hubSession = null;
		this._startSeqDeferred = new jQuery.Deferred();
	};

	/**
	 * Session Service prototype object.
	 * Holds various states/data/ and methods
	 * to manipulate and access them.
	 */
	PAF.SessionService.prototype =  {
			
		_lasPafURL : null,
		_hubSession : null,
		_startSeqDeferred : null,
		
		
		/**
		 * Returns the Hub-Session for this 
		 * session. 
		 * This should be called after the startSequence() API is
		 * called and finished. 

		 * @returns
		 */
		getHubSessionId : function () {
			return this._hubSession;
		},
		
		/**
		 * Deferred.
		 * Add only one function at a time. 
		 * No time to enhance
		 * Chainable 
		 */
		startSequenceDone : function (fn) {
			this._startSeqDeferred.done (fn);
			return this;
		},
		
		/**
		 * Add only one function at a time. 
		 * No time to enhance 
		 */		
		startSequenceFail : function (fn) {
			this._startSeqDeferred.fail (fn);
			return this;
		},		
		
		
		/**
		 * Add only one function at a time. 
		 * No time to enhance 
		 */		
		startSequenceAlways : function (fn) {
			this._startSeqDeferred.always (fn);
			return this;
		},		
		
		/**
		 * Refer PAF documentation for the data structure.
		 * @param data
		 * @returns
		 */		
		startSequence : function (data) {
			// Save a reference to our object
			var context = this;
			// Construct the laf-paf start sequence url
			var url = this._lasPafURL +  "/las-paf/sd/paf-service/overallactivity";
			// Return the Promise
		 	return  $.ajax ({
		 		url : url,
		 		data : JSON.stringify (data),
		 		processData : false,
		 		type : 'POST',
		 		contentType : 'application/json',
		 		
		 		success : function (data, textStatus, jqXHR) {
		 			/*
		 			 * On success set the status and other values properly.
		 			 */
			 		context._hubSession = data.hubsession;
			 		var seq = new PAF.ActivitySequence (data.data);
			 		try {
			 			context._startSeqDeferred.resolve (data.hubsession, seq, data.param);
			 		} catch (e) {
			 			// Leave or Console.log
			 			
			 		}
		 		},
		 		
		 		error : function (jqXHR, textStatus, errorThrown ) {
		 			// Like wise on error set status properly
			 		try {
			 			context._startSeqDeferred.reject (null);
			 		} catch (e) {
			 			// Leave
			 		}		 			
		 		},
		 		
				async : true 				
		 	});	
		},		
		
		getSequenceNode : function (data) {
			var url = this._lasPafURL +  "/las-paf/sd/paf-service/sequencenode";
		 	return  $.ajax ({
		 		url : url,
		 		data : JSON.stringify (data),
		 		processData : false,
		 		type : 'POST',
		 		contentType : 'application/json',
		 		async : true 
		 	});
		},
		
		endAssignment : function (data) {
			var url = this._lasPafURL +  "/las-paf/sd/paf-service/assessmentend";
		 	return  $.ajax ({
		 		url : url,
		 		data : JSON.stringify (data),
		 		processData : false,
		 		type : 'POST',
		 		contentType : 'application/json',
		 		async : true ,
		 	});
		}
	};
	
	/**
	 *  Activity Sequence constructor
	 */
	PAF.ActivitySequence = function (data) {
		this._rawData = data;
		this.initialize(data);
	};
	
	/**
	 *  ActivitySequence Prototype.
	 */
	PAF.ActivitySequence.prototype = {
		
		_rawData : null,
		
		_bindings : null,
		
		_itemToBinding : null,
		
		_sequenceGuid : null,
		
		_nodeCollection : null,
		
		_activityGuid : null,
		
		_activityTitle : null,
		
		_sequenceId : null,
		
		_settings : null,
		
		initialize : function (rawData) {
			var context = this;
			// sets the instance variables
			// with appropriate values
			context._sequenceGuid = rawData.guid;
			context._sequenceId = rawData["@id"];
			context._nodeCollection = rawData.nodeCollection;
			context._activityGuid = rawData.overallActivity.guid;

			context._bindings = rawData.overallActivity.assignmentContents.binding;
			context._activityTitle = rawData.overallActivity.title;
			
			context._settings = rawData.settings;
			
			context._itemToBinding = {};
			// Creates Map between item guid and binding
			$.each (this._bindings, function (i, obj) {
				context._itemToBinding[obj.guid] = obj;
			});
		},
		
		/**
		 * Return the total items in this sequence
		 * @returns
		 */
		count : function () {
			var context = this;
			return context.bindings.length;
		},
		
		/**
		 * Gets the item/binding at the specified index
		 * @param index
		 * @returns
		 */
		getBindingByIndex : function (index) {
			return this._bindings[index];
		},
		
		/**
		 * Given the item/binding guid returns the item
		 * if present or null
		 * @param guid
		 * @returns
		 */
		getBindingByGuid : function (guid) {
			return this._itemToBinding[guid];
		},
		
		/**
		 * Given the item/binding activitybinding returns the item
		 * if present or null
		 * @param guid
		 * @returns
		 */
		getBindingByBoundActitvity : function (ba) {
			for (var i = 0; i < this._bindings.length;  i++) {
				if (this._bindings[i].boundActivity === ba) {
					return this._bindings[i];
				}
			}
			
			return null;
		},	
		
		/**
		 * Return the node collection (string)
		 * @returns
		 */
		getSettings : function () {
			return this._settings;
		},
		
		/**
		 * Return the node collection (string)
		 * @returns
		 */
		getNodeCollection : function () {
			return this._nodeCollection;
		},
		
		/**
		 * Returns the activity title.
		 * @returns
		 */
		getActivityTitle : function () {
			return this._activityTitle;
		},
		
		/**
		 * Return the guid for this sequence.
		 * @returns
		 */
		getSequenceGuid : function () {
			return this._sequenceGuid;
		},
		
		
		/**
		 * Return the sequence id
		 * @returns
		 */
		getSequenceId : function () {
			return this._sequenceId;
		},
		
		/**
		 * Returns the guid for this activity.
		 * This is typically the assignment that was used to
		 * retrieve this sequence.
		 * @returns
		 */
		getActivityGuid : function () {
			return this._activityGuid;
		},
		

		/**
		 * Returns the raw sequence JSON as
		 * returned by the server
		 * @returns
		 */
		getRawData : function () {
			return this._rawData;
		},
		
		/**
		 * Helper function to iterate over each binding.
		 * First param is the item index, second the item
		 * The 'this' context within the function is set to the item.
		 * @param fn
		 */
		eachBinding : function (fn) {
			var context = this;
			$.each (context._bindings, function (i, obj) {
				fn.call (obj, i, obj);
			});
		}
	};
})();

