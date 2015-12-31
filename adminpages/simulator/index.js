// SilverSim is distributed under the terms of the
// GNU Affero General Public License v3

dojoConfig = {
	async: true,
	parseOnLoad: false
};


var sessionid = "";
var rights;
var containsAdminAll;

require([
	"dojox/mobile/parser",
	"dojox/mobile/compat",
	"dojox/mobile",
	"dijit/registry",
	"dojo/domReady!",
	"dojox/mobile/View",
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
function sendRegionsNotice()
{
	require(["dijit/registry", "dojo/request"], function(registry, request)
	{
		registry.byId('simulatornoticedialog').hide();
		request("/admin/json", 
		{
			method:"POST",
			data: JSON.stringify(
			{ 
				"method":"regions.notice",
				"message":registry.byId('regions_notice_text').get('value'),
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
						new TransitionEvent(viewmain, {
							moveTo: "viewlogin",
							transition: "slide",
							transitionDir: -1
						}).dispatch();
						return;
					}
					showErrorDialog(data.reason);
				}
			},
			function(err) {
			}
		);
	});
}

/******************************************************************************/
function processLogin(e)
{
	require(["dojo/request","dojox/mobile/TransitionEvent","dijit/registry", "dojo/_base/array", "dojo/json"],
		function(request, TransitionEvent, registry, array)
		{
			var username = registry.byId('user').get('value');
			var password = registry.byId('pass').get('value');
			request("/admin/json", 
			{
				method:"POST",
				data: JSON.stringify(
				{ 
					"method":"challenge",
					"user":username
				}),
				headers:
				{
					"Content-Type":"application/json"
				},
				handleAs:"json"
			}).then(
				function(challenge_data) 
				{
					if(!challenge_data.success)
					{
						showErrorDialog(challenge_data.reason);
						return;
					}
					
					response = generateResponse(challenge_data.challenge, password);
					pass.value = "";
					user.value = "";
					sessionid = challenge_data.sessionid;
					
					request("/admin/json",
					{
						method:"POST",
						data: JSON.stringify(
						{
							"method":"login",
							"user":username,
							"response":response,
							"sessionid":challenge_data.sessionid
						}),
						headers:
						{
							"Content-Type":"application/json"
						},
						handleAs:"json"
					}).then(
						function(login_data) 
						{
							if(!login_data.success)
							{
								showErrorDialog(login_data.reason);
								return;
							}
							
							var mainview = registry.byId("view_main");
							mainview.destroyDescendants();
							
							rights = login_data.rights;
							containsAdminAll = array.indexOf(login_data.rights, "admin.all") >= 0;
							var childWidget;
							var sectionWidget;
							
							if( containsAdminAll ||
								(array.indexOf(login_data.rights, "issues.view")>=0 && login_data.numissues != 0) ||
								array.indexOf(login_data.rights, "regions.notice")>=0 ||
								array.indexOf(login_data.rights, "modules.view")>=0)
							{
								mainview.addChild(new dojox.mobile.RoundRectCategory({label:"Simulator"}));
								var list = new dojox.mobile.RoundRectList();
								mainview.addChild(list);
							
								if(containsAdminAll || array.indexOf(login_data.rights, "issues.view")>=0)
								{
									if(login_data.numissues != 0)
									{
										
										var numIssues = login_data.numissues != 0 ? login_data.numissues : "None";
										childWidget = new dojox.mobile.ListItem({
											clickable:true,
											rightText:numIssues,
											label:"Configuration Issues"});
										list.addChild(childWidget);
										childWidget.on("click", switchToConfigurationIssues);
									}
								}
								
								if(containsAdminAll || array.indexOf(login_data.rights, "modules.view")>=0)
								{
										childWidget = new dojox.mobile.ListItem({
											clickable:true,
											label:"Configured Modules"});
										list.addChild(childWidget);
										childWidget.on("click", switchToModulesList);
								}
								
								if(containsAdminAll || array.indexOf(login_data.rights, "regions.notice")>=0)
								{
									var listItem;
									listItem = new dojox.mobile.ListItem({
											label:'Send Simulator Notice',
											onclick:"dijit.registry.byId('simulatornoticedialog').show()",
											clickable:true,
											arrowClass:'mblDomButtonGrayKnob'});
									list.addChild(listItem);
								}
							}
							
							
							if(containsAdminAll || array.indexOf(login_data.rights, "estates.view")>=0)
							{
								mainview.addChild(new dojox.mobile.RoundRectCategory({label:"Estates"}));
								var list = new dojox.mobile.RoundRectList();
								mainview.addChild(list);
								childWidget = new dojox.mobile.ListItem({
									clickable:true,
									label:"List"});
								list.addChild(childWidget);
								childWidget.on("click", function() {switchToEstatesList(1,viewmain); });
							}
							
							if(containsAdminAll ||
								array.indexOf(login_data.rights, "regions.control")>=0 ||
								array.indexOf(login_data.rights, "regions.manage") >= 0 ||
								array.indexOf(login_data.rights, "regions.logincontrol")>=0 ||
								array.indexOf(login_data.rights, "regions.notice")>=0 ||
								array.indexOf(login_data.rights, "regions.agents.view")>=0)
							{
								mainview.addChild(new dojox.mobile.RoundRectCategory({label:"Regions"}));
								var list = new dojox.mobile.RoundRectList();
								mainview.addChild(list);
								
								childWidget = new dojox.mobile.ListItem({
									clickable:true,
									label:"List"});
								list.addChild(childWidget);
								childWidget.on("click", function() { switchToRegionsList(1, viewmain); });
								
								if(containsAdminAll || array.indexOf(login_data.rights, "regions.control")>=0)
								{
									childWidget = new dojox.mobile.ListItem({
										clickable:true,
										label:"Start/Stop"});
									list.addChild(childWidget);
									childWidget.on("click", switchToRegionControl);
								}
								
								if(containsAdminAll || array.indexOf(login_data.rights, "regions.manage")>=0)
								{
									childWidget = new dojox.mobile.ListItem({
										clickable:true,
										label:"Auto-Start Enable"});
									list.addChild(childWidget);
									childWidget.on("click", switchToRegionEnable);
								}
								
								if(containsAdminAll || array.indexOf(login_data.rights, "regions.logincontrol")>=0)
								{
									childWidget = new dojox.mobile.ListItem({
										clickable:true,
										label:"Login Enable"});
									list.addChild(childWidget);
									childWidget.on("click", switchToLoginControl);
								}
								
								if(containsAdminAll ||array.indexOf(login_data.rights, "regions.agents.view")>=0)
								{
									childWidget = new dojox.mobile.ListItem({
										clickable:true,
										label:"Agents List per Region"});
									list.addChild(childWidget);
									childWidget.on("click", function() { switchToAgentRegionsList(1, viewmain);});
								}
							}
							
							if(containsAdminAll || array.indexOf(login_data.rights, "console.access")>=0)
							{
								mainview.addChild(new dojox.mobile.RoundRectCategory({label:"Console"}));
								var list = new dojox.mobile.RoundRectList();
								mainview.addChild(list);
								
								childWidget = new dojox.mobile.ListItem({
									clickable:true,
									label:">>",
									moveTo:"viewconsole",
									transition:"slide"});
								list.addChild(childWidget);
							}
							
							initEstateDetails();
							initRegionDetails();
							initAgentDetails();
							
							new TransitionEvent(viewlogin, {
								moveTo: "viewmain",
								transition: "slide",
								transitionDir: 1
							}).dispatch();
						},
						function(err)
						{
						}
					);
				},
				function(err) {
				}
			);
		}
	);
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
