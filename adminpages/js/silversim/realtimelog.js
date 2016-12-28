// SilverSim is distributed under the terms of the
// GNU Affero General Public License v3

var logsocket;

/******************************************************************************/
function clearRealtimeLog()
{
	require(["dojo/_base/array", "dojo/request", "dijit/registry", "dojox/mobile/TransitionEvent"], 
		function(array, request, registry, TransitionEvent)
	{
		registry.byId('log_output').set('innerHTML', '<pre>Cleared</pre>');
	});
}

/******************************************************************************/
function switchToRealtimeLog()
{
	require(["dojo/_base/array", "dojo/request", "dijit/registry", "dojox/mobile/TransitionEvent", "dojox/socket"], 
		function(array, request, registry, TransitionEvent, Socket)
	{
		registry.byId("log_output").set('innerHTML', '');
		logsocket = new Socket("/admin/log/" + sessionid);
		logsocket.on("message", function(ev) 
		{
			var response = ev.data;
			if(!response)
			{
				response = "";
			}
			var oldtext = "";
			if(registry.byId("log_output").get('innerHTML') != "")
			{
				oldtext = registry.byId("log_output").get('innerHTML');
			}
			registry.byId("log_output").set('innerHTML', oldtext + "<pre>"+response+"</pre>");
		});
		new TransitionEvent(viewmain, {
			moveTo: "viewlog",
			transition: "slide",
			transitionDir: 1
		}).dispatch();
	});
}

/******************************************************************************/
function switchFromLogToMainView()
{
	logsocket.close();
	require(["dojo/_base/array", "dojo/request", "dijit/registry", "dojox/mobile/TransitionEvent"], 
		function(array, request, registry, TransitionEvent)
	{
		new TransitionEvent(viewlog, {
			moveTo: "viewmain",
			transition: "slide",
			transitionDir: -1
		}).dispatch();
	});
}

/******************************************************************************/
function initRealTimeLog()
{
	if(logsocket)
	{
		logsocket.close();
	}
}