// SilverSim is distributed under the terms of the
// GNU Affero General Public License v3

dojoConfig = {
	async: true,
	parseOnLoad: false
};


var sessionid = "";
var rights;
var modules;
var containsAdminAll;

require([
	"dojox/mobile/parser",
	"dojox/mobile/compat",
	"dojox/mobile",
	"dijit/registry",
	"dojo/domReady!",
	"dojox/mobile/View",
	"dojox/mobile/ScrollableView",
	"dojox/mobile/Button",
	"dojox/mobile/Heading",
	"dojox/mobile/RoundRectList",
	"dojox/mobile/ListItem",
	"dojox/mobile/TransitionEvent",
	"dojox/mobile/TextBox",
	"dojox/mobile/Slider",
	"dojox/mobile/Switch",
	"dojox/mobile/SimpleDialog",
	"dojox/mobile/RoundRectCategory",
	"dojox/mobile/Pane",
], function (parser) {
	// now parse the page for widgets
	parser.parse();
});


/******************************************************************************/
function showErrorDialog(reason)
{
	var message;

	switch(reason)
	{
		case 1: message = "Not logged in"; break;
		case 2: message = "Not found"; break;
        case 3: message = "Insufficient rights"; break;
        case 4: message = "Invalid request"; break;
        case 5: message = "Already exists"; break;
        case 6: message = "Not possible"; break;
        case 7: message = "In use"; break;
        case 8: message = "Missing SessionId"; break;
        case 9: message = "Missing Method"; break;
        case 10: message = "Invalid session"; break;
        case 11: message = "Invalid User and/or password"; break;
        case 12: message = "Unknown method"; break;
        case 13: message = "Already started"; break;
        case 14: message = "Failed to start"; break;
        case 15: message = "Not running"; break;
        case 16: message = "Is running"; break;
        case 17: message = "Invalid parameter"; break;
        case 18: messages = "No estates"; break;
		default: message = "Unknown error "+ reason; break;
	}
	
	require(["dijit/registry"], function(registry)
	{
		registry.byId('errordialog_text').set('innerHTML', message);
		registry.byId('errordialog').show();
	});
}

/******************************************************************************/
function showErrorTextDialog(message)
{
	require(["dijit/registry"], function(registry)
	{
		registry.byId('errordialog_text').set('innerHTML', message);
		registry.byId('errordialog').show();
	});
}

/******************************************************************************/
function generateResponse(challenge, password)
{
	return CryptoJS.SHA1(challenge + "+" + CryptoJS.SHA1(password)).toString();
}

/******************************************************************************/
function processLogout(e)
{
	require(["dojo/request","dojox/mobile/TransitionEvent","dojo/json"],
		function(request, TransitionEvent)
		{
			request("/admin/json", 
			{
				method:"POST",
				data: JSON.stringify(
				{ 
					"method":"logout",
					"sessionid":sessionid
				}),
				headers:
				{
					"Content-Type":"application/json"
				},
				handleAs:"json"
			}).then(
				function(logout_data) 
				{
					if(!logout_data.success && logout_data.reason != 1)
					{
						showErrorDialog(logout_data.reason);
					}
					new TransitionEvent(viewmain, {
						moveTo: "viewlogin",
						transition: "slide",
						transitionDir: -1
					}).dispatch();
				},
				function(err) {
				}
			);
		}
	);
}

/******************************************************************************/
function switchToConfigurationIssues()
{
	require(["dojo/_base/array", "dojo/request", "dijit/registry", "dojox/mobile/TransitionEvent"], 
		function(array, request, registry, TransitionEvent)
	{
		list = registry.byId("list_issues");
		list.destroyDescendants();
		request("/admin/json", 
		{
			method:"POST",
			data: JSON.stringify(
			{ 
				"method":"issues.get",
				"sessionid":sessionid
			}),
			headers:
			{
				"Content-Type":"application/json"
			},
			handleAs:"json"
		}).then(
			function(data) 
			{
				if(!data.success)
				{
					if(data.reason == 1)
					{
						new TransitionEvent(viewissues, {
							moveTo: "viewlogin",
							transition: "slide",
							transitionDir: -1
						}).dispatch();
					}
					return;
				}
				
				var addedOne = false;
				array.forEach(data.issues, function(issue)
				{
					var childWidget = new dojox.mobile.ListItem({
						label:issue});
					list.addChild(childWidget);
					addedOne = true;
				});
				
				if(!addedOne)
				{
					var childWidget = new dojox.mobile.ListItem({
						label:"<None>"});
					list.addChild(childWidget);
				}
				
				new TransitionEvent(viewmain, {
					moveTo: "viewissues",
					transition: "slide",
					transitionDir: 1
				}).dispatch();
			},
			function(err) {
			}
		);
	});
}
