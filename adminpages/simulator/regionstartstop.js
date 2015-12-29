/******************************************************************************/
function startStopRegion(regionid, value)
{
	var method = value == "on" ? "region.start" : "region.stop";
	
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
function switchToRegionControl()
{
	require(["dojo/_base/array", "dojo/request", "dijit/registry", "dojox/mobile/TransitionEvent"], 
		function(array, request, registry, TransitionEvent)
	{
		list = registry.byId("list_regioncontrol");
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
					new TransitionEvent(viewregioncontrol, {
						moveTo: "viewlogin",
						transition: "slide",
						transitionDir: -1
					}).dispatch();
					return;
				}
				
				array.forEach(regions_data.regions, function(region)
				{
					var childWidget = new dojox.mobile.ListItem({
						id:"startstop_"+region.ID, 
						label:region.Name});
					list.addChild(childWidget);
					var val = region.IsOnline ? "on" : "off";
					var sw = new dojox.mobile.Switch({
						value:val});
					childWidget.addChild(sw);
					sw.on("stateChanged", function(val) { startStopRegion(region.ID, val);});
				});
				
				new TransitionEvent(viewmain, {
					moveTo: "viewregioncontrol",
					transition: "slide",
					transitionDir: 1
				}).dispatch();
			},
			function(err) {
			}
		);
	});
}
