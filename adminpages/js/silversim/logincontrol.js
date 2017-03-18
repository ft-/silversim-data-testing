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
