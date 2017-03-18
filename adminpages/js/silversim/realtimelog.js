// SilverSim is distributed under the terms of the
// GNU Affero General Public License v3 with
// the following clarification and special exception.

// Linking this library statically or dynamically with other modules is
// making a combined work based on this library. Thus, the terms and
// conditions of the GNU Affero General Public License cover the whole
// combination.

// As a special exception, the copyright holders of this library give you
// permission to link this library with independent modules to produce an
// executable, regardless of the license terms of these independent
// modules, and to copy and distribute the resulting executable under
// terms of your choice, provided that you also meet, for each linked
// independent module, the terms and conditions of the license of that
// module. An independent module is a module which is not derived from
// or based on this library. If you modify this library, you may extend
// this exception to your version of the library, but you are not
// obligated to do so. If you do not wish to do so, delete this
// exception statement from your version.

var logsocket;

/******************************************************************************/
function clearRealtimeLog()
{
	require(["dojo/_base/array", "dojo/request", "dijit/registry", "dojox/mobile/TransitionEvent"], 
		function(array, request, registry, TransitionEvent)
	{
		registry.byId('log_output').set('innerHTML', 'Cleared\n');
		registry.byId('log_scroll').scrollTo({x:0 ,y: 0});
	});
}

/******************************************************************************/
function switchToRealtimeLog()
{
	require(["dojo/_base/array", "dojo/request", "dijit/registry", "dojox/mobile/TransitionEvent", "dojox/socket"], 
		function(array, request, registry, TransitionEvent, Socket)
	{
		registry.byId("log_output").set('innerHTML', '');
		registry.byId('log_scroll').scrollTo({x:0 ,y: 0});
		logsocket = new Socket("/admin/loghtml/" + sessionid);
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
			registry.byId("log_output").set('innerHTML', oldtext + response + "\n");
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