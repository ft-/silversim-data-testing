/******************************************************************************/
function switchToEstatesList(transitionDirection)
{
	require(["dojo/_base/array", "dojo/request", "dijit/registry", "dojox/mobile/TransitionEvent"], 
		function(array, request, registry, TransitionEvent)
	{
		list = registry.byId("list_estates");
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
						new TransitionEvent(viewestateslist, {
							moveTo: "viewlogin",
							transition: "slide",
							transitionDir: -1
						}).dispatch();
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
				
				new TransitionEvent(viewmain, {
					moveTo: "viewestateslist",
					transition: "slide",
					transitionDir: transitionDirection
				}).dispatch();
			},
			function(err) {
			}
		);
	});
}

/******************************************************************************/
var selectedEstateID;

/******************************************************************************/
function estateSendNotice()
{
	require(["dojo/registry", "dojo/request"], function(registry, request)
	{
		request("/admin/json", 
		{
			method:"POST",
			data: JSON.stringify(
			{ 
				"method":"estate.notice",
				"id":selectedEstateID,
				"message":registry.byId('estatedetail_regionnotice').get('value'),
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
					}
					return;
				}
				alert("Error: " + data.reason);
			},
			function(err) {
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
		array.forEach(view.getChildren(),
		function(child)
		{
			view.removeChild(child);
			child.destroy();
		});
		
		var childWidget;
		if(containsAdminAll || array.indexOf(rights, "estate.notice")>=0)
		{
			childWidget = new dojox.mobile.RoundRectCategory({label:"Send Notice"});
			view.addChild(childWidget);
			var formWidget;
			var listItem;
			formWidget = new dojox.mobile.RoundRectList();
			childWidget = new dojox.mobile.TextBox({id: "estatedetail_regionnotice", placeHolder: "Enter notice here"});
			listItem = new dojox.mobile.ListItem();
			formWidget.addChild(listItem);
			listItem.addChild(childWidget);
			childWidget = new dojox.mobile.Button({label:"Send"});
			childWidget.on("click", function() { sendEstateNotice(); });
			listItem.addChild(childWidget);
			view.addChild(formWidget);
		}

		childWidget = new dojox.mobile.RoundRectCategory({label:"Details"});
		view.addChild(childWidget);

		var formWidget = new dojox.mobile.RoundRectList();
		var listItem;
		view.addChild(formWidget);
		
		if(containsAdminAll || array.indexOf(rights, "estates.manage")>=0)
		{
			
			childWidget = new dojox.mobile.TextBox({id:"estatedetail_name"});
			listItem = new dojox.mobile.ListItem({label:"Name"});
			formWidget.addChild(listItem);
			listItem.addChild(childWidget);
			
			childWidget = new dojox.mobile.TextBox({id:"estatedetail_pricepermeter"});
			listItem = new dojox.mobile.ListItem({label:"Price Per Meter"});
			formWidget.addChild(listItem);
			listItem.addChild(childWidget);
			
			childWidget = new dojox.mobile.TextBox({id:"estatedetail_billablefactor"});
			listItem = new dojox.mobile.ListItem({label:"Billable Factor"});
			formWidget.addChild(listItem);
			listItem.addChild(childWidget);
			
			childWidget = new dojox.mobile.TextBox({id:"estatedetail_abuseemail"});
			listItem = new dojox.mobile.ListItem({label:"Abuse Email"});
			formWidget.addChild(listItem);
			listItem.addChild(childWidget);
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
					return;
				}

				if(containsAdminAll || array.indexOf(rights, "estates.manage")>=0)
				{
					registry.byId("estatedetail_name").set('value',data.estate.Name);
					registry.byId("estatedetail_pricepermeter").set('value',data.estate.PricePerMeter);
					registry.byId("estatedetail_billablefactor").set('value',data.estate.BillableFactor);
					registry.byId("estatedetail_abuseemail").set('value',data.estate.AbuseEmail);
				}
				else
				{
					registry.byId("estatedetail_name").set('rightText',data.estate.Name);
					registry.byId("estatedetail_pricepermeter").set('rightText',data.estate.PricePerMeter);
					registry.byId("estatedetail_billablefactor").set('rightText',data.estate.BillableFactor);
					registry.byId("estatedetail_abuseemail").set('rightText',data.estate.AbuseEmail);
				}
				
				
				new TransitionEvent(viewmain, {
					moveTo: "viewestatedetails",
					transition: "slide",
					transitionDir: 1
				}).dispatch();
			},
			function(err) {
			}
		);
	});
}