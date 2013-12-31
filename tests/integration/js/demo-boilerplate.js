/**
 * Brix DIV-mode initialization boilerplate code.
 * This function should be called on HTML document loaded.
 *  
 * @return {none} 
 */
function brixInitDiv(opt_amsBaseUrl, opt_ipsBaseUrl, opt_course, opt_user)
{

    /** 
     * AMS Server (SanVan Core) base URL
     * @type {String}
     */
    var AMS_BASE_URL = "http://localhost:9080";
    //var AMS_BASE_URL =  "http://dev-414158649.us-west-1.elb.amazonaws.com";

    var amsBaseUrl = (opt_amsBaseUrl) ? opt_amsBaseUrl : AMS_BASE_URL;

    /**
     * IPS Server base URL
     * @type {String}
     */
    var IPS_BASE_URL = "http://localhost:8088";

    var ipsBaseUrl = (opt_ipsBaseUrl) ? opt_ipsBaseUrl : IPS_BASE_URL;

    /**
     * AMC Course
     * type {String}
     */
    var COURSE = "course_c1";
    var course = (opt_course) ? opt_course : COURSE;

    /**
     * AMC User
     * type {String}
     */
    var USER = "test1_t1";
    var user = (opt_user) ? opt_user : USER;

    var eventManager = new pearson.utils.EventManager();

    // FYI: AMS endpoint for the 
    // - get sequence is laspafurl + "/las-paf/sd/paf-service/sequencenode"
    // - start sequence is laspafurl + "/paf-service/overallactivity"
    // In case using HubMock(Nock), set path accordingly.
    var PAF = window.Ecourses.Paf;

    // Note: Configure the IPS server base url accordingly.
    //       In this configuration is runninng on local machine port 8088
    //       The server configuration is in /BrixServer/config/ 
    var ipcConfig = {ipsBaseUrl: ipsBaseUrl};
        //var ipcConfig = {ipsBaseUrl:"http://dev-414158649.us-west-1.elb.amazonaws.com/ips"};
    var ipc = new pearson.brix.Ipc(ipcConfig, eventManager);

    // Scan through the div element with class brix
    var items = pearson.utils.DomHelper.scanElements('brix', 'div');

    // Multiple divs may map to different container in the SAME sequence node.
    // Therefore we want to eliminate duplicates when sending to ipc.init
    var itemsNormalized = ipc.normalizeByTopic(items);

    // Notice that ipc.init() comes before AMC.initialize()
    ipc.init(itemsNormalized);


    // Since 2013/12/05 - Sets the course id and user(identity) id explicitly
    //                    Different course or user will retrieve different sequence node
    // 2013/12/12 update - AMS no longer lets you set course & user context
    //PAF.AMC.setCallerContext (course, user);
    
    // Required for testing
    PAF.AMC.initTestContext (amsBaseUrl);

    // In iframe-mode, the requestbinding should not be provided
    // Note: Configure the LASPAF (AMS) server url appropriately.
    //       In this configuration, the AMS is running on local Tomcat port 9080 
    //       (Tomcat comes with default setting to 8080 but my Local Jenkins is running on 8080)
    //       If you need to change the tomcat port, you may do so by modifing the file
    //       <tomcat>/config/server.xml:70 <Connector port="8080" protocol="HTTP/1.1"


    PAF.AMC.initialize ({
        laspafurl : amsBaseUrl,
        eventmanager : eventManager,
        requestbinding : itemsNormalized
    });

}