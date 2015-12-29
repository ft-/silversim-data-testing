/******************************************************************************/
function switchToEstatesList(transitionDirection, fromview)
{
	require(["dojo/_base/array", "dojo/request", "dijit/registry", "dojox/mobile/TransitionEvent"], 
		function(array, request, registry, TransitionEvent)
	{
		list = registry.byId("list_estates");
		list.destroyDescendants();
		request("/admin/json", 
		{
			method:"POST",
			data: JSON.stringify(
			{ 
				"method":"estates.list",
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
					array.indexOf("estates.manage")>=0 ||
					array.indexOf("estate.notice")>=0 ||
					array.indexOf("estates.view")>=0;
				
				array.forEach(data.estates, function(estate)
				{
					var childWidget = new dojox.mobile.ListItem({
						id:"estate_"+estate.ID, 
						clickable:hasDetailsRight,
						label:estate.Name});
					list.addChild(childWidget);
					if(hasDetailsRight)
					{
						childWidget.on("click", function() { switchToEstateDetails(estate.ID);});
					}
				});

				if(containsAdminAll || array.indexOf(rights, "estates.manage")>=0)
				{
					if(!registry.byId('estate_add_button'))
					{
						var tbWidget = new dojox.mobile.ToolBarButton({id:'estate_add_button',icon:'mblDomButtonWhitePlus', style:'float:right',moveTo:'viewestateadd',transition:'slide',transitionDir:1});
						registry.byId('estates_header').addChild(tbWidget);
					}
				}
				else
				{
					var tbWidget = registry.byId('estate_add_button');
					tbWidget.getEnclosingWidget().removeChild(tbWidget);
					tbWidget.destroy();
				}
				
				new TransitionEvent(fromview, {
					moveTo: "viewestateslist",
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
var selectedEstateID;

/******************************************************************************/
function sendEstateNotice()
{
	require(["dijit/registry", "dojo/request"], function(registry, request)
	{
		registry.byId('estatenoticedialog').hide();
		request("/admin/json", 
		{
			method:"POST",
			data: JSON.stringify(
			{ 
				"method":"estate.notice",
				"id":selectedEstateID,
				"message":registry.byId('estate_notice_text').get('value'),
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
						new TransitionEvent(viewestateslist, {
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
function initEstateDetails()
{
	require(["dojo/_base/array", "dijit/registry"], function(array, registry)
	{
		view = registry.byId("view_estatedetails");
		view.destroyDescendants();
		
		var childWidget;
		if(containsAdminAll || array.indexOf(rights, "estate.notice")>=0)
		{
			var formWidget;
			var listItem;
			formWidget = new dojox.mobile.RoundRectList();
			view.addChild(formWidget);
			listItem = new dojox.mobile.ListItem({
				label:"Send Estate Notice",
				onclick:"dijit.registry.byId('estatenoticedialog').show()",
				clickable:true,
				arrowClass:'mblDomButtonGrayKnob'});
			formWidget.addChild(listItem);
		}

		childWidget = new dojox.mobile.RoundRectCategory({label:"Owner"});
		view.addChild(childWidget);

		var formWidget = new dojox.mobile.RoundRectList();
		var listItem;
		view.addChild(formWidget);
		
		if(containsAdminAll || array.indexOf(rights, "estates.manage")>=0)
		{
			childWidget = new dojox.mobile.TextBox({id:"estatedetail_owner", style:'width:200px;'});
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
			childWidget.on('click', updateEstateOwner);
			
		}
		else
		{
			listItem = new dojox.mobile.ListItem({id:"estatedetail_owner",label:"Name"});
			formWidget.addChild(listItem);
		}
		
		childWidget = new dojox.mobile.RoundRectCategory({label:"Details"});
		view.addChild(childWidget);

		var formWidget = new dojox.mobile.RoundRectList();
		var listItem;
		view.addChild(formWidget);
		
		if(containsAdminAll || array.indexOf(rights, "estates.manage")>=0)
		{
			childWidget = new dojox.mobile.TextBox({id:"estatedetail_name", style: 'width: 200px;'});
			listItem = new dojox.mobile.ListItem({label:"Name"});
			formWidget.addChild(listItem);
			listItem.set('rightText', '');
			childWidget.placeAt(listItem.rightTextNode);
			childWidget.startup();
			
			childWidget = new dojox.mobile.TextBox({id:"estatedetail_pricepermeter", style: 'width: 200px;'});
			listItem = new dojox.mobile.ListItem({label:"Price Per Meter"});
			formWidget.addChild(listItem);
			listItem.set('rightText', '');
			childWidget.placeAt(listItem.rightTextNode);
			childWidget.startup();
			
			childWidget = new dojox.mobile.TextBox({id:"estatedetail_billablefactor", style: 'width: 200px;'});
			listItem = new dojox.mobile.ListItem({label:"Billable Factor"});
			formWidget.addChild(listItem);
			listItem.set('rightText', '');
			childWidget.placeAt(listItem.rightTextNode);
			childWidget.startup();
			
			childWidget = new dojox.mobile.TextBox({id:"estatedetail_abuseemail", style: 'width: 200px;'});
			listItem = new dojox.mobile.ListItem({label:"Abuse Email"});
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
			childWidget.on("click", function() { updateEstateData(); });
			
			var formWidget = new dojox.mobile.RoundRectList();
			var listItem;
			view.addChild(formWidget);
			listItem = new dojox.mobile.ListItem({label:"Delete",arrowClass:'mblDomButtonRedCircleMinus',clickable:true});
			formWidget.addChild(listItem);
			listItem.on("click", function() {deleteEstate();});
		}
		else
		{
			listItem = new dojox.mobile.ListItem({id:"estatedetail_name",label:"Name"});
			formWidget.addChild(listItem);
			
			listItem = new dojox.mobile.ListItem({id:"estatedetail_pricepermeter",label:"Price Per Meter"});
			formWidget.addChild(listItem);
			
			listItem = new dojox.mobile.ListItem({id:"estatedetail_billablefactor",label:"Billable Factor"});
			formWidget.addChild(listItem);
			
			listItem = new dojox.mobile.ListItem({id:"estatedetail_abuseemail",label:"Abuse Email"});
			formWidget.addChild(listItem);
		}
		
	});
}

/******************************************************************************/
function addEstateData()
{
	require(["dijit/registry", "dojo/request", "dojo/json"], function(registry, request)
	{
		var name = registry.byId('estateadd_name').get('value');
		var owner = registry.byId('estateadd_owner').get('value');
		var pricepermeter = registry.byId('estateadd_pricepermeter').get('value');
		var billablefactor = registry.byId('estateadd_billablefactor').get('value');
		var abuseemail = registry.byId('estateadd_abuseemail').get('value');
		if(pricepermeter=="")
		{
			pricepermeter = 1;
		}
		else
		{
			pricepermeter = parseInt(pricepermeter);
		}
		if(billablefactor=="")
		{
			billablefactor = 1.;
		}
		else
		{
			billablefactor = parseFloat(billablefactor);
		}
		
		var json_data = JSON.stringify(
			{ 
				"method":"estate.create",
				"parentestateid":1,
				"name":name,
				"owner":owner,
				"pricepermeter":pricepermeter,
				"billablefactor":billablefactor,
				"abuseemail":abuseemail,
				"sessionid":sessionid
			});
		
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

				switchToEstatesList(-1, viewestateadd);
			},
			function(err) {
				showErrorTextDialog(err.toString());
			}
		);
		
	});
}

/******************************************************************************/
function updateEstateData()
{
	require(["dijit/registry", "dojo/request"], function(registry, request)
	{
		var estateName = registry.byId("estatedetail_name").get('value');
		var pricePerMeter = parseInt(registry.byId("estatedetail_pricepermeter").get('value'));
		var billableFactor = parseFloat(registry.byId("estatedetail_billablefactor").get('value'));
		var abuseEmail = registry.byId("estatedetail_abuseemail").get('value');
		request("/admin/json", 
		{
			method:"POST",
			data: JSON.stringify(
			{ 
				"method":"estate.update",
				"id":selectedEstateID,
				"name":estateName,
				"pricepermeter":pricePerMeter,
				"billablefactor":billableFactor,
				"abuseemail":abuseEmail,
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
						new dojox.mobile.TransitionEvent(viewestatedetails, {
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

				registry.byId("estatedetail_nameinfo").set('label', "Estate " + estateName);
			},
			function(err) {
				showErrorTextDialog(err.toString());
			}
		);
	});
}

/******************************************************************************/
function updateEstateOwner()
{
	require(["dijit/registry", "dojo/request"], function(registry, request)
	{
		var estateName = registry.byId("estatedetail_name").get('value');
		var estateOwner = registry.byId("estatedetail_owner").get('value');
		request("/admin/json", 
		{
			method:"POST",
			data: JSON.stringify(
			{ 
				"method":"estate.update",
				"id":selectedEstateID,
				"name":estateName,
				"owner":estateOwner,
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
						new dojox.mobile.TransitionEvent(viewestatedetails, {
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

				registry.byId("estatedetail_nameinfo").set('label', "Estate " + estateName);
			},
			function(err) {
				showErrorTextDialog(err.toString());
			}
		);
	});
}

/******************************************************************************/
function deleteEstate()
{
	require(["dijit/registry", "dojo/request", "dojo/json"], function(registry, request)
	{
		request("/admin/json", 
		{
			method:"POST",
			data: JSON.stringify(
			{ 
				"method":"estate.delete",
				"id":parseInt(selectedEstateID),
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
						new dojox.mobile.TransitionEvent(viewestatedetails, {
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
				switchToEstatesList(-1, viewestatedetails);
			},
			function(err) {
				showErrorTextDialog(err.toString());
			}
		);
	});
}

/******************************************************************************/
function switchToEstateDetails(estateid)
{
	selectedEstateID = estateid;
	require(["dojo/_base/array", "dojo/request", "dijit/registry", "dojox/mobile/TransitionEvent"], 
		function(array, request, registry, TransitionEvent)
	{
		request("/admin/json", 
		{
			method:"POST",
			data: JSON.stringify(
			{ 
				"method":"estate.get",
				"id":estateid,
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

				registry.byId("estatedetail_nameinfo").set('label', "Estate " + data.estate.Name);
				if(containsAdminAll || array.indexOf(rights, "estates.manage")>=0)
				{
					registry.byId("estatedetail_owner").set('value',data.estate.Owner);
					registry.byId("estatedetail_name").set('value',data.estate.Name);
					registry.byId("estatedetail_pricepermeter").set('value',data.estate.PricePerMeter);
					registry.byId("estatedetail_billablefactor").set('value',data.estate.BillableFactor);
					registry.byId("estatedetail_abuseemail").set('value',data.estate.AbuseEmail);
				}
				else
				{
					registry.byId("estatedetail_owner").set('rightText',data.estate.Owner);
					registry.byId("estatedetail_name").set('rightText',data.estate.Name);
					registry.byId("estatedetail_pricepermeter").set('rightText',data.estate.PricePerMeter);
					registry.byId("estatedetail_billablefactor").set('rightText',data.estate.BillableFactor);
					registry.byId("estatedetail_abuseemail").set('rightText',data.estate.AbuseEmail);
				}

				var detailsList = registry.byId('estatedetails_regionmap');
				var haveNoRegionAvail = true;
				var view = registry.byId("view_estatedetails");
				
				if(detailsList)
				{
					detailsList.destroyDescendants();
				}
				
				array.forEach(data.regions, function(region)
				{
					haveNoRegionAvail = false;
					if(!detailsList)
					{
						view.addChild(new dojox.mobile.RoundRectCategory({label:"Connected Regions"}));
						detailsList = new dojox.mobile.RoundRectList({id:'estatedetails_regionmap'});
						view.addChild(detailsList);
					}
					if(region.Name)
					{
						detailsList.addChild(new dojox.mobile.ListItem({'label':region.Name}));
					}
					else
					{
						detailsList.addChild(new dojox.mobile.ListItem({'label':"? " + region.ID}));
					}
				});

				if(detailsList && haveNoRegionAvail)
				{
					view.removeChild(detailsList);
					detailsList.destroy();
				}
				
				new TransitionEvent(viewestateslist, {
					moveTo: "viewestatedetails",
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
