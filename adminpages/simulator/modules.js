/******************************************************************************/
function switchToModulesList()
{
	require(["dojo/_base/array", "dojo/request", "dijit/registry", "dojox/mobile/TransitionEvent"], 
		function(array, request, registry, TransitionEvent)
	{
		list = registry.byId("list_modules");
		list.destroyDescendants();
		request("/admin/json", 
		{
			method:"POST",
			data: JSON.stringify(
			{ 
				"method":"modules.list",
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
					}
					else
					{
						showErrorDialog(data.reason);
					}
					return;
				}
				
				array.forEach(data.modules, function(module)
				{
					var childWidget = new dojox.mobile.ListItem({
						id:"estate_"+module.Name, 
						clickable:true,
						label:module.Name + " - " + module.Description});
					list.addChild(childWidget);
					childWidget.on("click", function() { switchToModuleDetails(module.Name);});
				});
				
				
				new TransitionEvent(viewmain, {
					moveTo: "viewmodules",
					transition: "slide",
					transitionDir: 1
				}).dispatch();
			},
			function(err) {
				showErrorTextDialog(err.toString());
			}
		);
	});
}

/******************************************************************************/
function switchToModuleDetails(moduleid)
{
	require(["dojo/_base/array", "dojo/request", "dijit/registry", "dojox/mobile/TransitionEvent"], 
		function(array, request, registry, TransitionEvent)
	{
		request("/admin/json", 
		{
			method:"POST",
			data: JSON.stringify(
			{ 
				"method":"module.get",
				"name":moduleid,
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
						new TransitionEvent(viewestatedetails, {
							moveTo: "viewlogin",
							transition: "slide",
							transitionDir: -1
						}).dispatch();
					}
					else
					{
						showErrorDialog(data.reason);
					}
					return;
				}

				registry.byId("moduledetails_name").set('rightText',data.Name);
				registry.byId("moduledetails_desc").set('rightText',data.Description);

				var detailsList = registry.byId('list_modulefeatures');
				detailsList.destroyDescendants();
				
				var haveAnyFeatures = false;
				array.forEach(data.Features, function(feature)
				{
					detailsList.addChild(new dojox.mobile.ListItem({'label':feature}));
					haveAnyFeatures = true;
				});
				
				if(!haveAnyFeatures)
				{
					detailsList.addChild(new dojox.mobile.ListItem({'label':'Special Support Module'}));
				}
				
				new TransitionEvent(viewmodules, {
					moveTo: "viewmodule",
					transition: "slide",
					transitionDir: 1
				}).dispatch();
			},
			function(err) {
				showErrorTextDialog(err.toString());
			}
		);
	});
}
