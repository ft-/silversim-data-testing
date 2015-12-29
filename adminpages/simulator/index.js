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
	"dojox/mobile/RoundRectCategory",
	"dojox/mobile/Pane",
], function (parser) {
	// now parse the page for widgets
	parser.parse();
});


/******************************************************************************/
function generateResponse(challenge, password)
{
	return CryptoJS.SHA1(challenge + "+" + CryptoJS.SHA1(password)).toString();
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
						alert("Login not possible. Code: "+ challenge_data.reason);
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
								alert("Login failed: reason " + login_data.reason);
								return;
							}
							
							var mainview = registry.byId("view_main");
							array.forEach(mainview.getChildren(),
							function(child)
							{
								mainview.removeChild(child);
								child.destroy();
							});
							
							rights = login_data.rights;
							containsAdminAll = array.indexOf(login_data.rights, "admin.all") >= 0;
							var childWidget;
							var sectionWidget;
							
							if(containsAdminAll || array.indexOf(login_data.rights, "securityissues.view")>=0)
							{
								mainview.addChild(new dojox.mobile.RoundRectCategory({label:"Security Issues"}));
								var list = new dojox.mobile.RoundRectList();
								mainview.addChild(list);
								if(login_data.numsecurityissues != 0)
								{
									var numSecIssues = login_data.numsecurityissues != 0 ? login_data.numsecurityissues : "None";
									childWidget = new dojox.mobile.ListItem({
										clickable:true,
										rightText:numSecIssues,
										label:"Security Issues"});
									list.addChild(childWidget);
									childWidget.on("click", switchToSecurityIssues);
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
								childWidget.on("click", function() {switchToEstatesList(1); });
							}
							
							if(containsAdminAll ||
								array.indexOf(login_data.rights, "regions.control")>=0 ||
								array.indexOf(login_data.rights, "regions.manage") >= 0 ||
								array.indexOf(login_data.rights, "regions.logincontrol")>=0)
							{
								mainview.addChild(new dojox.mobile.RoundRectCategory({label:"Regions"}));
								var list = new dojox.mobile.RoundRectList();
								mainview.addChild(list);
								
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
							}
							
							if(containsAdminAll || array.indexOf(login_data.rights, "console.access")>=0)
							{
								mainview.addChild(new dojox.mobile.RoundRectCategory({label:"Console"}));
								var list = new dojox.mobile.RoundRectList();
								mainview.addChild(list);
								
								childWidget = new dojox.mobile.ListItem({
									clickable:true,
									label:"Switch To",
									moveTo:"viewconsole",
									transition:"slide"});
								list.addChild(childWidget);
							}
							
							initEstateDetails();
							
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
					if(!logout_data.success)
					{
						alert("Logout not possible. Code: "+ logout_data.reason);
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
function switchToSecurityIssues()
{
	require(["dojo/_base/array", "dojo/request", "dijit/registry", "dojox/mobile/TransitionEvent"], 
		function(array, request, registry, TransitionEvent)
	{
		list = registry.byId("list_securityissues");
		array.forEach(list.getChildren(),
		function(child)
		{
			list.removeChild(child);
			child.destroy();
		});
		request("/admin/json", 
		{
			method:"POST",
			data: JSON.stringify(
			{ 
				"method":"securityissues.get",
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
						new TransitionEvent(viewsecurityissues, {
							moveTo: "viewlogin",
							transition: "slide",
							transitionDir: -1
						}).dispatch();
					}
					return;
				}
				
				var addedOne = false;
				array.forEach(data.securityissues, function(issue)
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
					moveTo: "viewsecurityissues",
					transition: "slide",
					transitionDir: 1
				}).dispatch();
			},
			function(err) {
			}
		);
	});
}
