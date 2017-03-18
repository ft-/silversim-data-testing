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
