// SilverSim is distributed under the terms of the
// GNU Affero General Public License v3

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
								mainview.addChild(new dojox.mobile.RoundRectCategory({label:"Grid"}));
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
								
							}
							
							if(containsAdminAll || array.indexOf(login_data.rights, "useraccounts.view")>=0 ||
								array.indexOf(login_data.rights, "useraccounts.create") >= 0 ||
								array.indexOf(login_data.rights, "useraccounts.delete") >= 0 ||
								array.indexOf(login_data.rights, "useraccounts.manage") >= 0)
							{
								mainview.addChild(new dojox.mobile.RoundRectCategory({label:"Accounts"}));
								var list = new dojox.mobile.RoundRectList();
								mainview.addChild(list);
								
								if(containsAdminAll || array.indexOf(login_data.rights, "useraccounts.create")>=0)
								{
									childWidget = new dojox.mobile.ListItem({
										clickable:true,
										label:"Add Account",
										moveTo:"viewaccountadd",
										transition:"slide"});
									list.addChild(childWidget);
								}
								childWidget = new dojox.mobile.ListItem({
									clickable:true,
									label:">>"});
								childWidget.on("click", function() { switchToAccounts(1, viewmain); });
								list.addChild(childWidget);
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
							
							initAccountDetails();
							
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
