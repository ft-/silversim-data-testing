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
    "dojo/keys",
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
], function (parser, compat, mobile, registry, keys) {
	// now parse the page for widgets
	parser.parse();
    registry.byId('user').on("keyup", function(e)
    {
        if(e.keyCode == keys.ENTER)
        {
            registry.byId('pass').focus();
        }
    });
    registry.byId('pass').on("keyup", function(e)
    {
        if(e.keyCode == keys.ENTER)
        {
            processLogin(e);
        }
    });
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

var progress_hidden;
var progress_indicator;

/******************************************************************************/
function showProgressIndicatorDialog(title)
{
    require(["dijit/registry", "dojox/mobile/ProgressIndicator", "dojo/_base/window", "dojox/timing"], function(registry, ProgressIndicator, win)
    {
        if(!progress_indicator)
        {
            progress_indicator = new ProgressIndicator({size:40, colors:['#E60012','#F39800','#FFF100','#8FC31F','#009944','#009E96',
                  '#00A0E9','#0068B7','#1D2088','#920783','#E4007F','#E5004F']});
        }
        win.body().appendChild(progress_indicator.domNode);
        progress_indicator.start();
    });
}

/******************************************************************************/
function hideProgressIndicatorDialog()
{
    require(["dijit/registry"], function(registry)
    {
        progress_indicator.stop();
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
