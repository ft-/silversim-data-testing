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
					label:"Running"});
				formWidget.addChild(listItem);
				var sw = new dojox.mobile.Switch({id:"regiondetail_running"});
				listItem.addChild(sw);
				sw.on("stateChanged", function(val) { if(selectedRegionID) startStopRegion(selectedRegionID, val);});
			}
			
			if(containsAdminAll || array.indexOf(rights, "regions.control")>=0)
			{
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
			
			childWidget = new dojox.mobile.Button({label:'Update'});
			listItem = new dojox.mobile.ListItem({});
			formWidget.addChild(listItem);
			listItem.set('rightText', '');
			childWidget.placeAt(listItem.rightTextNode);
			childWidget.startup();
			childWidget.on("click", function() { updateRegionData(); });
			
			var formWidget = new dojox.mobile.RoundRectList();
			var listItem;
			view.addChild(formWidget);
			listItem = new dojox.mobile.ListItem({label:"Delete",arrowClass:'mblDomButtonRedCircleMinus',clickable:true});
			formWidget.addChild(listItem);
			listItem.on("click", function() {dijit.registry.byId('confirmregiondeletedialog').show();});
		}
		else
		{
			listItem = new dojox.mobile.ListItem({id:"regiondetail_name",label:"Name"});
			formWidget.addChild(listItem);
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

				registry.byId("regiondetail_nameinfo").set('label', "Region " + data.region.Name);
				var fieldToUpdate = 'rightText';
				if(containsAdminAll || array.indexOf(rights, "regions.manage")>=0)
				{
					fieldToUpdate = 'value';
				}
				registry.byId("regiondetail_owner").set(fieldToUpdate,data.region.Owner);
				registry.byId("regiondetail_name").set(fieldToUpdate,data.region.Name);
				
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
