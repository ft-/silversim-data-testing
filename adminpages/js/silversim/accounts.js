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
function switchToAccounts(transitionDirection, fromview)
{
	require(["dojo/_base/array", "dojo/request", "dijit/registry", "dojox/mobile/TransitionEvent"], 
		function(array, request, registry, TransitionEvent)
	{
		list = registry.byId("list_accounts");
		list.destroyDescendants();
		request("/admin/json", 
		{
			method:"POST",
			data: JSON.stringify(
			{ 
				"method":"useraccounts.search",
				"query":"",
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
					array.indexOf(rights, "useraccounts.manage")>=0 ||
					array.indexOf(rights, "useraccounts.delete")>=0 ||
					array.indexOf(rights, "useraccounts.create")>=0;
				
				array.forEach(data.accounts, function(account)
				{
					var childWidget = new dojox.mobile.ListItem({
						id:"account_"+account.id, 
						clickable:hasDetailsRight,
						label:account.firstname + " " + account.lastname});
					list.addChild(childWidget);
					if(hasDetailsRight)
					{
						childWidget.on("click", function() { switchToAccountDetails(account.id);});
					}
				});

				if(containsAdminAll || array.indexOf(rights, "useraccounts.create")>=0)
				{
					if(!registry.byId('account_add_button'))
					{
						var tbWidget = new dojox.mobile.ToolBarButton({id:'account_add_button',icon:'mblDomButtonWhitePlus', style:'float:right',clickable:true});
						registry.byId('accounts_header').addChild(tbWidget);
						tbWidget.on("click", function() { switchToAccountsAdd(); });
					}
				}
				else
				{
					var tbWidget = registry.byId('account_add_button');
					tbWidget.getEnclosingWidget().removeChild(tbWidget);
					tbWidget.destroy();
				}
				
				new TransitionEvent(fromview, {
					moveTo: "viewaccounts",
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
function initAccountDetails()
{
	require(["dojo/_base/array", "dijit/registry"], function(array, registry)
	{
		view = registry.byId("view_accountdetails");
		view.destroyDescendants();
		
		var childWidget;

		childWidget = new dojox.mobile.RoundRectCategory({label:"Details"});
		view.addChild(childWidget);

		var formWidget = new dojox.mobile.RoundRectList();
		var listItem;
		view.addChild(formWidget);
		
		listItem = new dojox.mobile.ListItem({id:"accountdetail_id",label:"ID"});
		formWidget.addChild(listItem);

		listItem = new dojox.mobile.ListItem({id:"accountdetail_firstname",label:"First Name"});
		formWidget.addChild(listItem);

		listItem = new dojox.mobile.ListItem({id:"accountdetail_lastname",label:"Last Name"});
		formWidget.addChild(listItem);

		if(containsAdminAll || array.indexOf(rights, "useraccounts.manage")>=0)
		{
			childWidget = new dojox.mobile.TextBox({id:"accountdetail_userlevel", style: 'width: 200px;'});
			listItem = new dojox.mobile.ListItem({label:"User Level"});
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
			childWidget.on("click", function() { updateAccountUserLevelData(); });
			
			childWidget = new dojox.mobile.TextBox({id:"accountdetail_usertitle", style: 'width: 200px;'});
			listItem = new dojox.mobile.ListItem({label:"User Title"});
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
			childWidget.on("click", function() { updateAccountUserTitleData(); });
			
			childWidget = new dojox.mobile.TextBox({id:"accountdetail_email", style: 'width: 200px;'});
			listItem = new dojox.mobile.ListItem({label:"Email"});
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
			childWidget.on("click", function() { updateAccountEmailData(); });
		}
		else
		{
			listItem = new dojox.mobile.ListItem({id:"accountdetail_userlevel",label:"User Level"});
			formWidget.addChild(listItem);
			listItem = new dojox.mobile.ListItem({id:"accountdetail_usertitle",label:"User Title"});
			formWidget.addChild(listItem);
			listItem = new dojox.mobile.ListItem({id:"accountdetail_email",label:"Email"});
			formWidget.addChild(listItem);
		}

		if(containsAdminAll ||array.indexOf(rights, "useraccounts.delete")>=0)
		{
			childWidget = new dojox.mobile.RoundRectCategory({label:"Actions"});
			view.addChild(childWidget);

			var formWidget = new dojox.mobile.RoundRectList();
			var listItem;
			view.addChild(formWidget);
			listItem = new dojox.mobile.ListItem({label:"Delete",arrowClass:'mblDomButtonRedCircleMinus',clickable:true});
			formWidget.addChild(listItem);
			listItem.on("click", function() {dijit.registry.byId('confirmaccountdeletedialog').show();});
		}
	});
}

/******************************************************************************/
var selectedaccountid;

/******************************************************************************/
function switchToAccountDetails(accountid)
{
	selectedaccountid = undefined;
	require(["dojo/_base/array", "dojo/request", "dijit/registry", "dojox/mobile/TransitionEvent"], 
		function(array, request, registry, TransitionEvent)
	{
		request("/admin/json", 
		{
			method:"POST",
			data: JSON.stringify(
			{ 
				"method":"useraccount.get",
				"id":accountid,
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

				registry.byId("accountdetail_nameinfo").set('label', "Account " + data.account.firstname + " " + data.account.lastname);
				var fieldToUpdate = 'rightText';
				if(containsAdminAll || array.indexOf(rights, "useraccounts.manage")>=0)
				{
					fieldToUpdate = 'value';
				}
				registry.byId("accountdetail_id").set('rightText',data.account.id);
				registry.byId("accountdetail_firstname").set('rightText',data.account.firstname);
				registry.byId("accountdetail_lastname").set('rightText',data.account.lastname);
				registry.byId("accountdetail_userlevel").set(fieldToUpdate,data.account.userlevel);
				registry.byId("accountdetail_usertitle").set(fieldToUpdate,data.account.usertitle);
				registry.byId("accountdetail_email").set(fieldToUpdate,data.account.email);
				
				selectedaccountid = accountid;
				new TransitionEvent(viewaccounts, {
					moveTo: "viewaccountdetails",
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
function updateAccountUserLevelData()
{
	require(["dijit/registry", "dojo/request", "dojo/json"], function(registry, request)
	{
		request("/admin/json", 
		{
			method:"POST",
			data: JSON.stringify(
			{ 
				"method":"useraccount.change",
				"id":selectedaccountid,
				"userlevel":registry.byId('accountdetail_userlevel').get('value'),
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
						new dojox.mobile.TransitionEvent(viewaccountdetails, {
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
function updateAccountUserTitleData()
{
	require(["dijit/registry", "dojo/request", "dojo/json"], function(registry, request)
	{
		request("/admin/json", 
		{
			method:"POST",
			data: JSON.stringify(
			{ 
				"method":"useraccount.change",
				"id":selectedaccountid,
				"usertitle":registry.byId('accountdetail_usertitle').get('value'),
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
						new dojox.mobile.TransitionEvent(viewaccountdetails, {
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
function updateAccountEmailData()
{
	require(["dijit/registry", "dojo/request", "dojo/json"], function(registry, request)
	{
		request("/admin/json", 
		{
			method:"POST",
			data: JSON.stringify(
			{ 
				"method":"useraccount.change",
				"id":selectedaccountid,
				"email":registry.byId('accountdetail_email').get('value'),
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
						new dojox.mobile.TransitionEvent(viewaccountdetails, {
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
function deleteAccount()
{
	require(["dijit/registry", "dojo/request", "dojo/json"], function(registry, request)
	{
		registry.byId('confirmaccountdeletedialog').hide();
		request("/admin/json", 
		{
			method:"POST",
			data: JSON.stringify(
			{ 
				"method":"useraccount.delete",
				"id":selectedaccountid,
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
						new dojox.mobile.TransitionEvent(viewaccountdetails, {
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
				switchToAccounts(-1, viewaccountdetails);
			},
			function(err) {
				showErrorTextDialog(err.toString());
			}
		);
	});
}

/******************************************************************************/
function addAccountData()
{
	selectedaccountid = undefined;
	require(["dojo/_base/array", "dojo/request", "dijit/registry", "dojox/mobile/TransitionEvent"], 
		function(array, request, registry, TransitionEvent)
	{
		if(registry.byId('accountadd_password').get('value') != 
			registry.byId('accountadd_password2').get('value'))
		{
			showErrorTextDialog("Passwords do not match");
			return;
		}
		request("/admin/json", 
		{
			method:"POST",
			data: JSON.stringify(
			{ 
				"method":"useraccount.create",
				"firstname":registry.byId('accountadd_firstname').get('value'),
				"lastname":registry.byId('accountadd_lastname').get('value'),
				"userlevel":registry.byId('accountadd_userlevel').get('value'),
				"usertitle":registry.byId('accountadd_usertitle').get('value'),
				"password":registry.byId('accountadd_password').get('value'),
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
						new TransitionEvent(viewaccountadd, {
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
				
				registry.byId("accountdetail_nameinfo").set('label', "Account " + data.account.firstname + " " + data.account.lastname);
				var fieldToUpdate = 'rightText';
				if(containsAdminAll || array.indexOf(rights, "useraccounts.manage")>=0)
				{
					fieldToUpdate = 'value';
				}
				registry.byId("accountdetail_id").set('rightText',data.account.id);
				registry.byId("accountdetail_firstname").set('rightText',data.account.firstname);
				registry.byId("accountdetail_lastname").set('rightText',data.account.lastname);
				registry.byId("accountdetail_userlevel").set(fieldToUpdate,registry.byId('accountadd_userlevel').get('value'));
				registry.byId("accountdetail_usertitle").set(fieldToUpdate,registry.byId('accountadd_usertitle').get('value'));
				
				selectedaccountid = data.account.id;
				new TransitionEvent(viewaccounts, {
					moveTo: "viewaccountdetails",
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