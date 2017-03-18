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
function switchToNpcRegionsList(transitionDirection, fromview)
{
	require(["dojo/_base/array", "dojo/request", "dijit/registry", "dojox/mobile/TransitionEvent"], 
		function(array, request, registry, TransitionEvent)
	{
		list = registry.byId("list_npc_regions");
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
			function(data) 
			{
				if(!data.success)
				{
					if(data.reason == 1)
					{
						new TransitionEvent(fromview, {
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
				
				array.forEach(data.regions, function(region)
				{
					var childWidget = new dojox.mobile.ListItem({
						clickable:region.IsOnline,
						label:region.Name});
					list.addChild(childWidget);
					if(!region.IsOnline)
					{
						childWidget.set('rightText','Offline');
					}
					childWidget.on("click", function() { switchToNpcList(region.ID, region.Name); });
				});
				
				new TransitionEvent(fromview, {
					moveTo: "viewnpc_regionslist",
					transition: "slide",
					transitionDir: transitionDirection
				}).dispatch();
			},
			function(err) {
				showErrorTextDialog(err.toString());
			}
		);
	});
}

var selectedNpcListRegionID;
var selectedNpcListRegionName;
var selectedNpcId;

/******************************************************************************/
function initNpcDetails()
{
	require(["dojo/_base/array", "dijit/registry"], function(array, registry)
	{
		view = registry.byId("view_npcdetails");
		view.destroyDescendants();
		
		var childWidget;

		childWidget = new dojox.mobile.RoundRectCategory({label:"Details"});
		view.addChild(childWidget);

		var formWidget = new dojox.mobile.RoundRectList();
		var listItem;
		view.addChild(formWidget);
		
		listItem = new dojox.mobile.ListItem({id:"npcdetail_id",label:"ID"});
		formWidget.addChild(listItem);

		listItem = new dojox.mobile.ListItem({id:"npcdetail_firstname",label:"First Name"});
		formWidget.addChild(listItem);

		listItem = new dojox.mobile.ListItem({id:"npcdetail_lastname",label:"Last Name"});
		formWidget.addChild(listItem);

		listItem = new dojox.mobile.ListItem({id:"npcdetail_owner",label:"Owner"});
		formWidget.addChild(listItem);

		listItem = new dojox.mobile.ListItem({id:"npcdetail_persistent",label:"Persistent"});
		formWidget.addChild(listItem);

		if(containsAdminAll ||array.indexOf(rights, "npcs.manage")>=0)
		{
			childWidget = new dojox.mobile.RoundRectCategory({label:"Actions"});
			view.addChild(childWidget);

			var formWidget = new dojox.mobile.RoundRectList();
			var listItem;
			view.addChild(formWidget);
			listItem = new dojox.mobile.ListItem({label:"Remove",arrowClass:'mblDomButtonRedCircleMinus',clickable:true});
			formWidget.addChild(listItem);
			listItem.on("click", function() {dijit.registry.byId('confirmnpcremovedialog').show();});
		}
	});
}

/******************************************************************************/
function switchToNpcList(regionid, regionname)
{
	selectedNpcListRegionID = regionid;
	selectedNpcListRegionName = regionname;
	require(["dijit/registry"], function(registry)
	{
		registry.byId('npclist_header').set('label', "NPCs on Region " + regionname);
	});
	switchToActualNpcList(1, viewnpc_regionslist);
}

/******************************************************************************/
function switchToActualNpcList(transitionDirection, fromview)
{
	require(["dojo/_base/array", "dojo/request", "dijit/registry", "dojox/mobile/TransitionEvent"], 
		function(array, request, registry, TransitionEvent)
	{
		list = registry.byId("list_npcs_in_region");
		list.destroyDescendants();
		request("/admin/json", 
		{
			method:"POST",
			data: JSON.stringify(
			{ 
				"method":"npcs.show",
				"regionid":selectedNpcListRegionID,
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
						new TransitionEvent(fromview, {
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
				
				array.forEach(data.npcs, function(npc)
				{
					var childWidget = new dojox.mobile.ListItem({
						clickable:true,
						label:npc.uui.firstname + " " + npc.uui.lastname});
					list.addChild(childWidget);
					childWidget.on("click", function() { switchToNpcDetails(npc.uui.id);});
				});
				
				new TransitionEvent(fromview, {
					moveTo: "viewnpclist",
					transition: "slide",
					transitionDir: transitionDirection
				}).dispatch();
			},
			function(err) {
				showErrorTextDialog(err.toString());
			}
		);
	});
}

/******************************************************************************/
function switchToNpcDetails(id)
{
	selectedNpcId = id;
	require(["dojo/_base/array", "dojo/request", "dijit/registry", "dojox/mobile/TransitionEvent"], 
		function(array, request, registry, TransitionEvent)
	{
		list = registry.byId("list_npcs_in_region");
		list.destroyDescendants();
		request("/admin/json", 
		{
			method:"POST",
			data: JSON.stringify(
			{ 
				"method":"npc.get",
				"npcid":selectedNpcId,
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
						new TransitionEvent(fromview, {
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
				
				var fieldToUpdate = 'rightText';
				if(containsAdminAll || array.indexOf(rights, "npcs.manage")>=0)
				{
					fieldToUpdate = 'value';
				}
				registry.byId("npcdetail_id").set('rightText',data.uui.id);
				registry.byId("npcdetail_firstname").set('rightText',data.uui.firstname);
				registry.byId("npcdetail_lastname").set('rightText',data.uui.lastname);
				registry.byId("npcdetail_owner").set('rightText',data.owner.fullname);
				if(data.persistent)
				{
					registry.byId("npcdetail_persistent").set('rightText','yes');
				}
				else
				{
					registry.byId("npcdetail_persistent").set('rightText','no');
				}
				
				new TransitionEvent(viewnpclist, {
					moveTo: "viewnpcdetails",
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
function removeNpc()
{
	
}
