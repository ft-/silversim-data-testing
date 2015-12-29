/******************************************************************************/
function enableDisableLogins(regionid, value)
{
	var method = value == "on" ? "region.login.enable" : "region.login.disable";
	
	require(["dojo/request"], function(request)
	{
		request("/admin/json", {
			method:"POST",
			data: JSON.stringify(
			{
				"method":method,
				"id":regionid,
				"sessionid":sessionid
			}),
			headers:
			{
				"Content-Type":"application/json"
			},
			handleAs:"json"
		}).then(
			function(regions_data) 
			{
				if(!regions_data.success)
				{
					if(regions_data.reason == 1)
					{
						new TransitionEvent(viewmain, {
							moveTo: "viewlogin",
							transition: "slide",
							transitionDir: -1
						}).dispatch();
					}
					else
					{
						showErrorDialog(regions_data.reason);
					}
					return;
				}
			},
			function(err) {
			}
		);
	});
}

/******************************************************************************/
function switchToLoginControl()
{
	require(["dojo/_base/array", "dojo/request", "dijit/registry", "dojox/mobile/TransitionEvent"], 
		function(array, request, registry, TransitionEvent)
	{
		list = registry.byId("list_logincontrol");
		list.destroyDescendants();
		request("/admin/json", 
		{
			method:"POST",
			data: JSON.stringify(
			{ 
				"method":"regions.list",
				"sessionid":sessionid
			}),
			headers:
			{
				"Content-Type":"application/json"
			},
			handleAs:"json"
		}).then(
			function(regions_data) 
			{
				if(!regions_data.success)
				{
					if(regions_data.reason == 1)
					{
						new TransitionEvent(viewlogincontrol, {
							moveTo: "viewlogin",
							transition: "slide",
							transitionDir: -1
						}).dispatch();
					}
					return;
				}
				
				array.forEach(regions_data.regions, function(region)
				{
					if(region.IsOnline)
					{
						var childWidget = new dojox.mobile.ListItem({
							id:"login_"+region.ID, 
							label:region.Name});
						list.addChild(childWidget);
						var val = region.IsLoginsEnabled ? "on" : "off";
						var sw = new dojox.mobile.Switch({
							value:val});
						childWidget.addChild(sw);
						sw.on("stateChanged", function(val) {enableDisableLogins(region.ID, val);});
					}
				});
				
				new TransitionEvent(viewmain, {
					moveTo: "viewlogincontrol",
					transition: "slide",
					transitionDir: 1
				}).dispatch();
			},
			function(err) {
			}
		);
	});
}
