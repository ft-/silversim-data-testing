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
function processLogin(e)
{
	require(["dojo/request","dojox/mobile/TransitionEvent","dijit/registry", "dojo/_base/array", "dojo/json"],
		processLoginStep1);
}

/******************************************************************************/
function processLoginStep1(request, TransitionEvent, registry, array)
{
	var username = registry.byId('user').get('value');
	request("/admin/json", 
	{
		method:"POST",
		data: JSON.stringify(
		{ 
			"method":"challenge",
			"user":username
		}),
		headers:
		{
			"Content-Type":"application/json"
		},
		handleAs:"json"
	}).then(
		function(challenge_data) 
		{
			processLoginStep2(request, TransitionEvent, registry, array, challenge_data);
		},
		function(err) {
		}
	);
}

/******************************************************************************/
function processLoginStep2(request, TransitionEvent, registry, array, challenge_data)
{
	var username = registry.byId('user').get('value');
	var password = registry.byId('pass').get('value');
	if(!challenge_data.success)
	{
		showErrorDialog(challenge_data.reason);
		return;
	}
	
	response = generateResponse(challenge_data.challenge, password);
	pass.value = "";
	user.value = "";
	sessionid = challenge_data.sessionid;
	
	request("/admin/json",
	{
		method:"POST",
		data: JSON.stringify(
		{
			"method":"login",
			"user":username,
			"response":response,
			"sessionid":challenge_data.sessionid
		}),
		headers:
		{
			"Content-Type":"application/json"
		},
		handleAs:"json"
	}).then(
		function(login_data) 
		{
			processLoginStep3(request, TransitionEvent, registry, array, login_data);
		},
		function(err)
		{
		}
	);
}

/******************************************************************************/
function processLoginStep3(request, TransitionEvent, registry, array, login_data)
{
	list = registry.byId("list_lslperms");
	request("/admin/json", 
	{
		method:"POST",
		data: JSON.stringify(
		{ 
			"method":"lsl.controlledperms",
			"sessionid":sessionid
		}),
		headers:
		{
			"Content-Type":"application/json"
		},
		handleAs:"json"
	}).then(
		function(perms_data) 
		{
			list.destroyDescendants();
			array.forEach(perms_data.list, function(pack)
			{
			    var childWidget = new dojox.mobile.ListItem({
				id:"lslperm_" + pack.name,
				clickable:true,
				label:pack.name});
			    list.addChild(childWidget);
			    dojo.connect(childWidget.labelNode, "click", function(e) { 
				//selectedpackage = pack.name;
				//viewInstalledDetails(pack.name);
			    });
			});
			
			processLoginStep4(request, TransitionEvent, registry, array, login_data);
		},
		function(err) {
			processLoginStep4(request, TransitionEvent, registry, array, login_data);
		}
	);
}

/******************************************************************************/
function processLoginStep4(request, TransitionEvent, registry, array, login_data)
{
	request("/admin/json", 
	{
		method:"POST",
		data: JSON.stringify(
		{ 
			"method":"webif.modules",
			"sessionid":sessionid
		}),
		headers:
		{
			"Content-Type":"application/json"
		},
		handleAs:"json"
	}).then(
		function(modules_data) 
		{
			processLoginStep5(request, TransitionEvent, registry, array, login_data, modules_data);
		},
		function(err) {
			processLogout(0);
		}
	);
}

/******************************************************************************/
function processLoginStep5(request, TransitionEvent, registry, array, login_data, modules_data)
{
	if(!login_data.success)
	{
		showErrorDialog(login_data.reason);
		return;
	}
	
	var mainview = registry.byId("view_main");
	mainview.destroyDescendants();
	
	rights = login_data.rights;
	modules = modules_data.modules;
	containsAdminAll = array.indexOf(login_data.rights, "admin.all") >= 0;
	var childWidget;
	var sectionWidget;
	
	var have_regions_notice = (containsAdminAll || array.indexOf(login_data.rights, "regions.notice")>=0) && array.indexOf(modules_data.modules, "regions")>=0;
	var have_npc_view = (containsAdminAll || array.indexOf(login_data.rights, "npcs.view")>=0) && array.indexOf(modules_data.modules, "npcs")>=0;
	
	if( containsAdminAll ||
		(array.indexOf(login_data.rights, "issues.view")>=0 && login_data.numissues != 0) ||
		have_regions_notice ||
		array.indexOf(login_data.rights, "modules.view")>=0)
	{
		mainview.addChild(new dojox.mobile.RoundRectCategory({label:modules_data.title}));
		var list = new dojox.mobile.RoundRectList();
		mainview.addChild(list);
	
		if(containsAdminAll || array.indexOf(login_data.rights, "issues.view")>=0)
		{
			if(login_data.numissues != 0)
			{
				
				var numIssues = login_data.numissues != 0 ? login_data.numissues : "None";
				childWidget = new dojox.mobile.ListItem({
					clickable:true,
					rightText:numIssues,
					label:"Configuration Issues"});
				list.addChild(childWidget);
				childWidget.on("click", switchToConfigurationIssues);
			}
		}
        
        if(containsAdminAll || array.indexOf(login_data.rights, "packages.view")>=0)
        {
				childWidget = new dojox.mobile.ListItem({
					clickable:true,
					label:"Package Admin",
                    moveTo:"packageadmin",
                    transition:"slide"});
				list.addChild(childWidget);
        }
		
		if(containsAdminAll || array.indexOf(login_data.rights, "modules.view")>=0)
		{
				childWidget = new dojox.mobile.ListItem({
					clickable:true,
					label:"Configured Modules"});
				list.addChild(childWidget);
				childWidget.on("click", switchToModulesList);
		}
		
		if(have_regions_notice)
		{
			var listItem;
			listItem = new dojox.mobile.ListItem({
					label:'Send Simulator Notice',
					onclick:"dijit.registry.byId('simulatornoticedialog').show()",
					clickable:true,
					arrowClass:'mblDomButtonGrayKnob'});
			list.addChild(listItem);
		}
	}
	
	if(array.indexOf(modules_data.modules, "useraccounts")>=0)
	{
		if(containsAdminAll || array.indexOf(login_data.rights, "useraccounts.view")>=0 ||
			array.indexOf(login_data.rights, "useraccounts.create") >= 0 ||
			array.indexOf(login_data.rights, "useraccounts.delete") >= 0 ||
			array.indexOf(login_data.rights, "useraccounts.manage") >= 0)
		{
			mainview.addChild(new dojox.mobile.RoundRectCategory({label:"Accounts"}));
			var list = new dojox.mobile.RoundRectList();
			mainview.addChild(list);
			
			if(containsAdminAll || array.indexOf(login_data.rights, "useraccounts.create")>=0)
			{
				childWidget = new dojox.mobile.ListItem({
					clickable:true,
					label:"Add Account",
					moveTo:"viewaccountadd",
					transition:"slide"});
				list.addChild(childWidget);
			}
			childWidget = new dojox.mobile.ListItem({
				clickable:true,
				label:"List"});
			childWidget.on("click", function() { switchToAccounts(1, viewmain); });
			list.addChild(childWidget);
		}
	}
	
	if(array.indexOf(modules_data.modules, "estates")>=0)
	{
		if(containsAdminAll || array.indexOf(login_data.rights, "estates.view")>=0)
		{
			mainview.addChild(new dojox.mobile.RoundRectCategory({label:"Estates"}));
			var list = new dojox.mobile.RoundRectList();
			mainview.addChild(list);
			childWidget = new dojox.mobile.ListItem({
				clickable:true,
				label:"List"});
			list.addChild(childWidget);
			childWidget.on("click", function() {switchToEstatesList(1,viewmain); });
		}
	}
	
	if(array.indexOf(modules_data.modules, "regions")>=0)
	{
		if(containsAdminAll ||
			array.indexOf(login_data.rights, "regions.control")>=0 ||
			array.indexOf(login_data.rights, "regions.manage") >= 0 ||
			array.indexOf(login_data.rights, "regions.logincontrol")>=0 ||
			array.indexOf(login_data.rights, "regions.notice")>=0 ||
			array.indexOf(login_data.rights, "regions.agents.view")>=0 ||
			have_npc_view)
		{
			mainview.addChild(new dojox.mobile.RoundRectCategory({label:"Regions"}));
			var list = new dojox.mobile.RoundRectList();
			mainview.addChild(list);
			
			childWidget = new dojox.mobile.ListItem({
				clickable:true,
				label:"List"});
			list.addChild(childWidget);
			childWidget.on("click", function() { switchToRegionsList(1, viewmain); });
			
			if(containsAdminAll || array.indexOf(login_data.rights, "regions.control")>=0)
			{
				childWidget = new dojox.mobile.ListItem({
					clickable:true,
					label:"Start/Stop"});
				list.addChild(childWidget);
				childWidget.on("click", switchToRegionControl);
			}
			
			if(containsAdminAll || array.indexOf(login_data.rights, "regions.manage")>=0)
			{
				childWidget = new dojox.mobile.ListItem({
					clickable:true,
					label:"Auto-Start Enable"});
				list.addChild(childWidget);
				childWidget.on("click", switchToRegionEnable);
			}
			
			if(containsAdminAll || array.indexOf(login_data.rights, "regions.logincontrol")>=0)
			{
				childWidget = new dojox.mobile.ListItem({
					clickable:true,
					label:"Login Enable"});
				list.addChild(childWidget);
				childWidget.on("click", switchToLoginControl);
			}
			
			if(containsAdminAll ||array.indexOf(login_data.rights, "regions.agents.view")>=0)
			{
				childWidget = new dojox.mobile.ListItem({
					clickable:true,
					label:"Agents List per Region"});
				list.addChild(childWidget);
				childWidget.on("click", function() { switchToAgentRegionsList(1, viewmain);});
			}
			
			if(have_npc_view)
			{
				childWidget = new dojox.mobile.ListItem({
					clickable:true,
					label:"Npc List per Region"});
				list.addChild(childWidget);
				childWidget.on("click", function() { switchToNpcRegionsList(1, viewmain);});
			}
		}
	}
	
	if(array.indexOf(modules_data.modules, "console")>=0)
	{
		if(containsAdminAll || array.indexOf(login_data.rights, "console.access")>=0)
		{
			mainview.addChild(new dojox.mobile.RoundRectCategory({label:"Console"}));
			var list = new dojox.mobile.RoundRectList();
			mainview.addChild(list);
			
			childWidget = new dojox.mobile.ListItem({
				clickable:true,
				label:">>",
				moveTo:"viewconsole",
				transition:"slide"});
			list.addChild(childWidget);
		}
	}

	if(containsAdminAll || array.indexOf(login_data.rights, "log.view")>=0)
	{
		mainview.addChild(new dojox.mobile.RoundRectCategory({label:"Log"}));
		var list = new dojox.mobile.RoundRectList();
		mainview.addChild(list);
		
		childWidget = new dojox.mobile.ListItem({
			clickable:true,
			label:"Real-Time Display"});
		list.addChild(childWidget);
		childWidget.on("click", function() {switchToRealtimeLog(); });
	}
	
	initEstateDetails();
	initRegionDetails();
	initAgentDetails();
	initAccountDetails();
	initNpcDetails();
	initRealTimeLog();
    initPackageAdmin();
	
	new TransitionEvent(viewlogin, {
		moveTo: "viewmain",
		transition: "slide",
		transitionDir: 1
	}).dispatch();
}
