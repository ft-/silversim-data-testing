// SilverSim is distributed under the terms of the
// GNU Affero General Public License v3

/******************************************************************************/
function switchToRegionsList(transitionDirection, fromview)
{
	require(["dojo/_base/array", "dojo/request", "dijit/registry", "dojox/mobile/TransitionEvent"], 
		function(array, request, registry, TransitionEvent)
	{
		list = registry.byId("list_regions");
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
				
				var hasDetailsRight = containsAdminAll ||
					array.indexOf("regions.manage")>=0 ||
					array.indexOf("region.notice")>=0 ||
					array.indexOf("regions.view")>=0;
				
				array.forEach(data.regions, function(region)
				{
					var childWidget = new dojox.mobile.ListItem({
						id:"region_"+region.ID, 
						clickable:hasDetailsRight,
						label:region.Name});
					list.addChild(childWidget);
					if(hasDetailsRight)
					{
						childWidget.on("click", function() { switchToRegionDetails(region.ID);});
					}
				});

				if(containsAdminAll || array.indexOf(rights, "regions.manage")>=0)
				{
					if(!registry.byId('region_add_button'))
					{
						var tbWidget = new dojox.mobile.ToolBarButton({id:'region_add_button',icon:'mblDomButtonWhitePlus', style:'float:right',clickable:true});
						registry.byId('regions_header').addChild(tbWidget);
						tbWidget.on("click", function() { switchToRegionAdd(); });
					}
				}
				else
				{
					var tbWidget = registry.byId('region_add_button');
					tbWidget.getEnclosingWidget().removeChild(tbWidget);
					tbWidget.destroy();
				}
				
				new TransitionEvent(fromview, {
					moveTo: "viewregionslist",
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
var selectedRegionID;

/******************************************************************************/
function updateRegionOwner()
{
	require(["dijit/registry", "dojo/request"], function(registry, request)
	{
		registry.byId('regionnoticedialog').hide();
		request("/admin/json", 
		{
			method:"POST",
			data: JSON.stringify(
			{ 
				"method":"region.change.owner",
				"id":selectedRegionID,
				"owner":registry.byId('regiondetail_owner').get('value'),
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
						new TransitionEvent(viewregionslist, {
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
				showErrorTextDialog(err.toString());
			}
		);
	});
}

/******************************************************************************/
function updateRegionData()
{
	require(["dijit/registry", "dojo/request"], function(registry, request)
	{
		request("/admin/json", 
		{
			method:"POST",
			data: JSON.stringify(
			{ 
				"method":"region.change",
				"id":selectedRegionID,
				"port":parseInt(registry.byId('regiondetail_port').get('value')),
				"name":registry.byId('regiondetail_name').get('value'),
				"productname":registry.byId('regiondetail_productname').get('value'),
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
						new TransitionEvent(viewregionslist, {
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
				showErrorTextDialog(err.toString());
			}
		);
	});
}

/******************************************************************************/
function updateRegionLocation()
{
	require(["dijit/registry", "dojo/request"], function(registry, request)
	{
		request("/admin/json", 
		{
			method:"POST",
			data: JSON.stringify(
			{ 
				"method":"region.change.location",
				"id":selectedRegionID,
				"location":registry.byId('regiondetail_location').get('value'),
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
						new TransitionEvent(viewregionslist, {
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
				showErrorTextDialog(err.toString());
			}
		);
	});
}

/******************************************************************************/
function sendRegionNotice()
{
	require(["dijit/registry", "dojo/request"], function(registry, request)
	{
		registry.byId('regionnoticedialog').hide();
		request("/admin/json", 
		{
			method:"POST",
			data: JSON.stringify(
			{ 
				"method":"region.notice",
				"id":selectedRegionID,
				"message":registry.byId('region_notice_text').get('value'),
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
						new TransitionEvent(viewregionslist, {
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
				showErrorTextDialog(err.toString());
			}
		);
	});
}

/******************************************************************************/
var selectedRegionAddAccess = 'mature';
function selectRegionAddAccess(access)
{
	selectedRegionAddAccess = access;
}

/******************************************************************************/
var selectedRegionAddEstate;
var activeRegionEstate;
function selectRegionAddEstate(estateid)
{
	selectedRegionAddEstate = estateid;
}

/******************************************************************************/
function addRegionData()
{
	require(["dijit/registry", "dojo/request", "dojo/json"], function(registry, request)
	{
		var json_obj = 
			{ 
				"method":"region.create",
				"name":registry.byId('regionadd_name').get('value'),
				"owner":registry.byId('regionadd_owner').get('value'),
				"port":parseInt(registry.byId('regionadd_port').get('value')),
				"location":registry.byId('regionadd_location').get('value'),
				"size":registry.byId('regionadd_size').get('value'),
				"estateid":selectedRegionAddEstate,
				"status":registry.byId('regionadd_autostart').get('value')=="on"?"enabled":"disabled",
				"access":selectedRegionAddAccess,
				"sessionid":sessionid
			};
		var productname = registry.byId('regionadd_productname').get('value');
		if(productname != "")
		{
			json_obj.productname = productname;
		}
		var json_data = JSON.stringify(json_obj);
		
		request("/admin/json", 
		{
			method:"POST",
			data: json_data,
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
						new dojox.mobile.TransitionEvent(viewestateadd, {
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

				switchToRegionsList(-1, viewregionadd);
			},
			function(err) {
				showErrorTextDialog(err.toString());
			}
		);
		
	});
}

/******************************************************************************/
function switchToRegionAdd()
{
	require(["dojo/_base/array", "dojo/request", "dijit/registry", "dojox/mobile/TransitionEvent"], 
		function(array, request, registry, TransitionEvent)
	{
		list = registry.byId("regionadd_estateselector");
		list.destroyDescendants();
		request("/admin/json", 
		{
			method:"POST",
			data: JSON.stringify(
			{ 
				"method":"region.get.estates",
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
				
				var haveEstates = false;
				array.forEach(data.estates, function(estate)
				{
					var childWidget = new dojox.mobile.ListItem({
						id:"regionadd_estate_"+estate.ID, 
						clickable:true,
						noArrow:true,
						checked:!haveEstates,
						label:estate.Name});
					list.addChild(childWidget);
					childWidget.on("click", function() { selectRegionAddEstate(estate.ID);});
					if(!haveEstates)
					{
						selectedRegionAddEstate = estate.ID;
					}
					haveEstates = true;
				});
				
				if(!haveEstates)
				{
					showErrorTextDialog("Please create an estate first.");
				}
				else
				{
					registry.byId('regionadd_autostart').set('value','on');
				
					new TransitionEvent(viewregionslist, {
						moveTo: "viewregionadd",
						transition: "slide",
						transitionDir: 1
					}).dispatch();
				}
			},
			function(err) {
				showErrorTextDialog(err.toString());
			}
		);
	});
}

/******************************************************************************/
function selectRegionChangeEstate(estateID, estateName)
{
	require(["dojo/_base/array", "dojo/request", "dijit/registry", "dojox/mobile/TransitionEvent"], 
		function(array, request, registry, TransitionEvent)
	{
		request("/admin/json", 
		{
			method:"POST",
			data: JSON.stringify(
			{ 
				"method":"region.change.estate",
				"id":selectedRegionID,
				"estateid":estateID,
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
						new TransitionEvent(viewregionestatechangelist, {
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
				
				
				registry.byId('regiondetail_estate').set('rightText', estateName);
			
				new TransitionEvent(viewregionestatechangelist, {
					moveTo: "viewregiondetails",
					transition: "slide",
					transitionDir: -1
				}).dispatch();
			},
			function(err) {
				showErrorTextDialog(err.toString());
			}
		);
	});
}

/******************************************************************************/
function selectRegionChangeAccess(access, accessName)
{
	require(["dojo/_base/array", "dojo/request", "dijit/registry", "dojox/mobile/TransitionEvent"], 
		function(array, request, registry, TransitionEvent)
	{
		request("/admin/json", 
		{
			method:"POST",
			data: JSON.stringify(
			{ 
				"method":"region.change.access",
				"id":selectedRegionID,
				"access":access,
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
						new TransitionEvent(viewregionestatechangelist, {
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
				
				
				registry.byId('regiondetail_access').set('rightText', accessName);
			
				new TransitionEvent(viewregionestatechangelist, {
					moveTo: "viewregiondetails",
					transition: "slide",
					transitionDir: -1
				}).dispatch();
			},
			function(err) {
				showErrorTextDialog(err.toString());
			}
		);
	});
}

/******************************************************************************/
function switchToRegionEstateChange()
{
	require(["dojo/_base/array", "dojo/request", "dijit/registry", "dojox/mobile/TransitionEvent"], 
		function(array, request, registry, TransitionEvent)
	{
		list = registry.byId("list_estates_change_region");
		list.destroyDescendants();
		request("/admin/json", 
		{
			method:"POST",
			data: JSON.stringify(
			{ 
				"method":"region.get.estates",
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
				
				var haveEstates = false;
				array.forEach(data.estates, function(estate)
				{
					var childWidget = new dojox.mobile.ListItem({
						id:"regionchangeestate_estate_"+estate.ID, 
						clickable:true,
						noArrow:true,
						checked:activeRegionEstate==estate.ID,
						label:estate.Name});
					list.addChild(childWidget);
					childWidget.on("click", function() { selectRegionChangeEstate(estate.ID, estate.Name);});
					haveEstates = true;
				});
				
				if(!haveEstates)
				{
					showErrorTextDialog("Please create an estate first.");
				}
				else
				{
				
					new TransitionEvent(viewregiondetails, {
						moveTo: "viewregionestatechangelist",
						transition: "slide",
						transitionDir: 1
					}).dispatch();
				}
			},
			function(err) {
				showErrorTextDialog(err.toString());
			}
		);
	});
}

/******************************************************************************/
function initRegionDetails()
{
	require(["dojo/_base/array", "dijit/registry"], function(array, registry)
	{
		view = registry.byId("view_regiondetails");
		view.destroyDescendants();
		
		var childWidget;
		if(containsAdminAll || 
			array.indexOf(rights, "region.notice")>=0 ||
			array.indexOf(rights, "regions.control")>=0 ||
			array.indexOf(rights, "regions.logincontrol")>=0)
		{
			var formWidget;
			var listItem;
			formWidget = new dojox.mobile.RoundRectList();
			view.addChild(formWidget);

			if(containsAdminAll || array.indexOf(rights, "region.notice")>=0)
			{
				listItem = new dojox.mobile.ListItem({
					label:"Send Region Notice",
					onclick:"dijit.registry.byId('regionnoticedialog').show()",
					clickable:true,
					arrowClass:'mblDomButtonGrayKnob'});
				formWidget.addChild(listItem);
			}
			
			if(containsAdminAll || array.indexOf(rights, "regions.control")>=0)
			{
				listItem = new dojox.mobile.ListItem({
					label:"Trigger Restart",
					clickable:true,
                    arrowClass:'mblDomButtonSilverCircleOrangeButton'});
				formWidget.addChild(listItem);
				listItem.on("click", function(val) { if(selectedRegionID) dijit.registry.byId('confirmregionrestartdialog').show();});

				listItem = new dojox.mobile.ListItem({
					label:"Cancel Restart",
					clickable:true,
                    arrowClass:'mblDomButtonSilverCircleGrayButton'});
				formWidget.addChild(listItem);
				listItem.on("click", function(val) { if(selectedRegionID) cancelRestartRegion(selectedRegionID);});
			
				listItem = new dojox.mobile.ListItem({
					label:"Running"});
				formWidget.addChild(listItem);
				var sw = new dojox.mobile.Switch({id:"regiondetail_running"});
				listItem.addChild(sw);
				sw.on("stateChanged", function(val) { if(selectedRegionID) startStopRegion(selectedRegionID, val);});
			
				listItem = new dojox.mobile.ListItem({
					label:"Auto-Start"});
				formWidget.addChild(listItem);
				var sw = new dojox.mobile.Switch({id:"regiondetail_autostart"});
				listItem.addChild(sw);
				sw.on("stateChanged", function(val) { if(selectedRegionID) enableDisableRegion(selectedRegionID, val);});
			}
			
			if(containsAdminAll || array.indexOf(rights, "regions.logincontrol")>=0)
			{
				listItem = new dojox.mobile.ListItem({
					label:"Logins enabled"});
				formWidget.addChild(listItem);
				var sw = new dojox.mobile.Switch({id:"regiondetail_loginsenabled"});
				listItem.addChild(sw);
				sw.on("stateChanged", function(val) { if(selectedRegionID) enableDisableLogins(selectedRegionID, val);});
			}
		}

		childWidget = new dojox.mobile.RoundRectCategory({label:"Owner"});
		view.addChild(childWidget);

		var formWidget = new dojox.mobile.RoundRectList();
		var listItem;
		view.addChild(formWidget);
		
		if(containsAdminAll || array.indexOf(rights, "regions.manage")>=0)
		{
			childWidget = new dojox.mobile.TextBox({id:"regiondetail_owner", style:'width:200px;'});
			listItem = new dojox.mobile.ListItem({label:"Name"});
			formWidget.addChild(listItem);
			listItem.set('rightText', '');
			childWidget.placeAt(listItem.rightTextNode);
			childWidget.startup();
			
			childWidget = new dojox.mobile.Button({label:'Change Owner'});
			listItem = new dojox.mobile.ListItem({});
			formWidget.addChild(listItem);
			listItem.set('rightText', '');
			childWidget.placeAt(listItem.rightTextNode);
			childWidget.startup();
			childWidget.on('click', function() { updateRegionOwner(); });
			
		}
		else
		{
			listItem = new dojox.mobile.ListItem({id:"regiondetail_owner",label:"Name"});
			formWidget.addChild(listItem);
		}
		
		childWidget = new dojox.mobile.RoundRectCategory({label:"Details"});
		view.addChild(childWidget);

		var formWidget = new dojox.mobile.RoundRectList();
		var listItem;
		view.addChild(formWidget);
		
		if(containsAdminAll || array.indexOf(rights, "regions.manage")>=0)
		{
			childWidget = new dojox.mobile.TextBox({id:"regiondetail_name", style: 'width: 200px;'});
			listItem = new dojox.mobile.ListItem({label:"Name"});
			formWidget.addChild(listItem);
			listItem.set('rightText', '');
			childWidget.placeAt(listItem.rightTextNode);
			childWidget.startup();
			
			childWidget = new dojox.mobile.TextBox({id:"regiondetail_port", style: 'width: 200px;'});
			listItem = new dojox.mobile.ListItem({label:"Port"});
			formWidget.addChild(listItem);
			listItem.set('rightText', '');
			childWidget.placeAt(listItem.rightTextNode);
			childWidget.startup();
			
			childWidget = new dojox.mobile.TextBox({id:"regiondetail_productname", style: 'width: 200px;'});
			listItem = new dojox.mobile.ListItem({label:"Product Name"});
			formWidget.addChild(listItem);
			listItem.set('rightText', '');
			childWidget.placeAt(listItem.rightTextNode);
			childWidget.startup();
			
			childWidget = new dojox.mobile.Button({label:'Change'});
			listItem = new dojox.mobile.ListItem({});
			formWidget.addChild(listItem);
			listItem.set('rightText', '');
			childWidget.placeAt(listItem.rightTextNode);
			childWidget.startup();
			childWidget.on("click", function() { updateRegionData(); });
			
		}
		else
		{
			listItem = new dojox.mobile.ListItem({id:"regiondetail_name",label:"Name"});
			formWidget.addChild(listItem);
			listItem = new dojox.mobile.ListItem({id:"regiondetail_port",label:"Port"});
			formWidget.addChild(listItem);
			listItem = new dojox.mobile.ListItem({id:"regiondetail_productname",label:"Product Name"});
			formWidget.addChild(listItem);
		}

		childWidget = new dojox.mobile.RoundRectCategory({label:"Location"});
		view.addChild(childWidget);

		var formWidget = new dojox.mobile.RoundRectList();
		var listItem;
		view.addChild(formWidget);
		
		if(containsAdminAll || array.indexOf(rights, "regions.manage")>=0)
		{
			childWidget = new dojox.mobile.TextBox({id:"regiondetail_location", style: 'width: 200px;'});
			listItem = new dojox.mobile.ListItem({label:"Position"});
			formWidget.addChild(listItem);
			listItem.set('rightText', '');
			childWidget.placeAt(listItem.rightTextNode);
			childWidget.startup();
			
			childWidget = new dojox.mobile.Button({label:'Relocate'});
			listItem = new dojox.mobile.ListItem({});
			formWidget.addChild(listItem);
			listItem.set('rightText', '');
			childWidget.placeAt(listItem.rightTextNode);
			childWidget.startup();
			childWidget.on("click", function() { updateRegionLocation(); });
		}
		else
		{
			listItem = new dojox.mobile.ListItem({id:"regiondetail_location",label:"Position"});
			formWidget.addChild(listItem);
		}

		childWidget = new dojox.mobile.RoundRectCategory({label:"Access Level"});
		view.addChild(childWidget);

		var formWidget = new dojox.mobile.RoundRectList();
		var listItem;
		view.addChild(formWidget);
		
		if(containsAdminAll || array.indexOf(rights, "regions.manage")>=0)
		{
			listItem = new dojox.mobile.ListItem({id:"regiondetail_access",label:"Access",moveTo:'viewregionaccesschangelist'});
			formWidget.addChild(listItem);
			listItem.set('rightText', '');
		}
		else
		{
			listItem = new dojox.mobile.ListItem({id:"regiondetail_access",label:"Access"});
			formWidget.addChild(listItem);
			listItem.set('rightText', '');
		}
		
		childWidget = new dojox.mobile.RoundRectCategory({label:"Estate Information"});
		view.addChild(childWidget);

		var formWidget = new dojox.mobile.RoundRectList();
		var listItem;
		view.addChild(formWidget);
		
		if(containsAdminAll || array.indexOf(rights, "regions.manage")>=0)
		{
			listItem = new dojox.mobile.ListItem({id:"regiondetail_estate",label:"Estate",clickable:true});
			formWidget.addChild(listItem);
			listItem.set('rightText', '');
			listItem.on('click', function() { switchToRegionEstateChange(); });
		}
		else
		{
			listItem = new dojox.mobile.ListItem({id:"regiondetail_estate",label:"Estate"});
			formWidget.addChild(listItem);
			listItem.set('rightText', '');
		}
		
		if(containsAdminAll ||array.indexOf(rights, "regions.manage")>=0)
		{
			childWidget = new dojox.mobile.RoundRectCategory({label:"Actions"});
			view.addChild(childWidget);

			var formWidget = new dojox.mobile.RoundRectList();
			var listItem;
			view.addChild(formWidget);
			listItem = new dojox.mobile.ListItem({label:"Delete",arrowClass:'mblDomButtonRedCircleMinus',clickable:true});
			formWidget.addChild(listItem);
			listItem.on("click", function() {dijit.registry.byId('confirmregiondeletedialog').show();});
		}
	});
}

/******************************************************************************/
function deleteRegion()
{
	require(["dijit/registry", "dojo/request", "dojo/json"], function(registry, request)
	{
		registry.byId('confirmregiondeletedialog').hide();
		request("/admin/json", 
		{
			method:"POST",
			data: JSON.stringify(
			{ 
				"method":"region.delete",
				"id":selectedRegionID,
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
						new dojox.mobile.TransitionEvent(viewregiondetails, {
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
				switchToRegionsList(-1, viewregiondetails);
			},
			function(err) {
				showErrorTextDialog(err.toString());
			}
		);
	});
}

/******************************************************************************/
function restartRegion(regionid)
{
	require(["dijit/registry", "dojo/request", "dojo/json"], function(registry, request)
	{
		registry.byId('confirmregionrestartdialog').hide();
        var seconds = parseInt(registry.byId('region_restart_time').get('value'));
		request("/admin/json", 
		{
			method:"POST",
			data: JSON.stringify(
			{ 
				"method":"region.restart",
				"id":regionid,
				"seconds":seconds,
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
						new dojox.mobile.TransitionEvent(viewregiondetails, {
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
			},
			function(err) {
				showErrorTextDialog(err.toString());
			}
		);
	});
}

/******************************************************************************/
function cancelRestartRegion(regionid)
{
	require(["dijit/registry", "dojo/request", "dojo/json"], function(registry, request)
	{
		request("/admin/json", 
		{
			method:"POST",
			data: JSON.stringify(
			{ 
				"method":"region.restart.abort",
				"id":regionid,
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
						new dojox.mobile.TransitionEvent(viewregiondetails, {
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
			},
			function(err) {
				showErrorTextDialog(err.toString());
			}
		);
	});
}

/******************************************************************************/
function switchToRegionDetails(regionid)
{
	selectedRegionID = undefined;
	require(["dojo/_base/array", "dojo/request", "dijit/registry", "dojox/mobile/TransitionEvent"], 
		function(array, request, registry, TransitionEvent)
	{
		request("/admin/json", 
		{
			method:"POST",
			data: JSON.stringify(
			{ 
				"method":"region.get",
				"id":regionid,
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
						new TransitionEvent(viewregiondetails, {
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

				registry.byId("change_estate_region_header").set('label', "Select Estate for Region " + data.region.Name);
				registry.byId("change_access_region_header").set('label', "Select Access for Region " + data.region.Name);
				registry.byId("regiondetail_nameinfo").set('label', "Region " + data.region.Name);
				var fieldToUpdate = 'rightText';
				if(containsAdminAll || array.indexOf(rights, "regions.manage")>=0)
				{
					fieldToUpdate = 'value';
				}
				registry.byId("regiondetail_owner").set(fieldToUpdate,data.region.Owner);
				registry.byId("regiondetail_name").set(fieldToUpdate,data.region.Name);
				registry.byId("regiondetail_location").set(fieldToUpdate,data.region.Location);
				registry.byId("regiondetail_port").set(fieldToUpdate,data.region.ServerPort);
				registry.byId("regiondetail_productname").set(fieldToUpdate,data.region.ProductName);
				switch(data.region.Access)
				{
					case "pg": 
						registry.byId("regiondetail_access").set('rightText','PG');
						registry.byId("list_access_change_region_adult").set('checked',false);
						registry.byId("list_access_change_region_mature").set('checked',false);
						registry.byId("list_access_change_region_pg").set('checked',true);
						break;
					case "mature": 
						registry.byId("regiondetail_access").set('rightText','Mature');
						registry.byId("list_access_change_region_adult").set('checked',false);
						registry.byId("list_access_change_region_mature").set('checked',true);
						registry.byId("list_access_change_region_pg").set('checked',false);
						break;
					case "adult": 
						registry.byId("regiondetail_access").set('rightText','Adult');
						registry.byId("list_access_change_region_adult").set('checked',true);
						registry.byId("list_access_change_region_mature").set('checked',false);
						registry.byId("list_access_change_region_pg").set('checked',false);
						break;
					default:
						registry.byId("regiondetail_access").set('rightText','Unknown');
						break;
				}
				
				if(data.estate)
				{
					registry.byId("regiondetail_estate").set('rightText',data.estate.Name);
					activeRegionEstate = data.estate.ID;
				}
				else
				{
					registry.byId("regiondetail_estate").set('rightText', '');
				}
				
				if(containsAdminAll || array.indexOf(rights, "regions.control")>=0)
				{
					registry.byId("regiondetail_running").set('value', data.region.IsOnline ? "on" : "off");
					registry.byId("regiondetail_autostart").set('value', (data.region.Flags & 4) != 0 ? "on" : "off");
				}
				
				if(containsAdminAll || array.indexOf(rights, "regions.logincontrol")>=0)
				{
					registry.byId("regiondetail_loginsenabled").set('value', data.region.IsLoginsEnabled ? "on" : "off");
				}
				
				selectedRegionID = regionid;
				new TransitionEvent(viewregionslist, {
					moveTo: "viewregiondetails",
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
