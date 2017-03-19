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
function initPackageAdmin()
{
    require(["dojo/_base/array", "dojo/request", "dijit/registry"], 
        function(array, request, registry)
    {
        var packageadminview = registry.byId("view_packageadmin");
        packageadminview.destroyDescendants();
        
        if(containsAdminAll || array.indexOf(login_data.rights, "packages.view")>=0)
        {
            packageadminview.addChild(new dojox.mobile.RoundRectCategory({label:"Current Installation"}));
            var list = new dojox.mobile.RoundRectList();
            packageadminview.addChild(list);
            childWidget = new dojox.mobile.ListItem({
                clickable:true,
                label:"Installed Packages"});
            list.addChild(childWidget);
            childWidget.on("click", switchToInstalledPackages);
        }
        if(containsAdminAll || array.indexOf(login_data.rights, "packages.install")>=0)
        {
            packageadminview.addChild(new dojox.mobile.RoundRectCategory({label:"Package Administration"}));
            var list = new dojox.mobile.RoundRectList();
            packageadminview.addChild(list);
            childWidget = new dojox.mobile.ListItem({
                clickable:true,
                label:"Available Packages"});
            list.addChild(childWidget);
            childWidget.on("click", switchToAvailablePackages);
            childWidget = new dojox.mobile.ListItem({
                clickable:true,
                label:"Update Package Feed"});
            list.addChild(childWidget);
            childWidget.on("click", updatePackageFeed);
        }
    });
}

/******************************************************************************/
function switchToInstalledPackages()
{
    require(["dojo/_base/array", "dojo/request", "dijit/registry", "dojox/mobile/TransitionEvent"], 
        function(array, request, registry, TransitionEvent)
    {
        list = registry.byId("list_installedpackages");
        list.destroyDescendants();
        request("/admin/json", 
        {
            method:"POST",
            data: JSON.stringify(
            { 
                "method":"packages.list.installed",
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
                        new TransitionEvent(packageadmin, {
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
                
                var hasUninstallRight = containsAdminAll ||
                    array.indexOf(rights, "packages.uninstall")>=0;
                
                array.forEach(data.list, function(pack)
                {
                    var childWidget = new dojox.mobile.ListItem({
                        id:"pkg_" + pack.name,
                        rightText:pack.version,
                        clickable:hasUninstallRight,
                        arrowClass:'mblDomButtonRedCircleMinus',
                        label:pack.name});
                    list.addChild(childWidget);
                    if(hasUninstallRight)
                    {
                        childWidget.on("click", function() { uninstallPackage(pack.name);});
                    }
                });
                
                new TransitionEvent(packageadmin, {
                    moveTo: "viewinstalledpackages",
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
function switchToAvailablePackages()
{
    var installedpackages = []
    require(["dojo/_base/array", "dojo/request", "dijit/registry", "dojox/mobile/TransitionEvent"], 
        function(array, request, registry, TransitionEvent)
    {
        list = registry.byId("list_installedpackages");
        list.destroyDescendants();
        request("/admin/json", 
        {
            method:"POST",
            data: JSON.stringify(
            { 
                "method":"packages.list.installed",
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
                        new TransitionEvent(packageadmin, {
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
                
                var hasUninstallRight = containsAdminAll ||
                    array.indexOf("packages.uninstall")>=0;
                
                array.forEach(data.list, function(pack)
                {
                    installedpackages.push(pack.name);
                });
                
                list = registry.byId("list_availablepackages");
                list.destroyDescendants();
                request("/admin/json", 
                {
                    method:"POST",
                    data: JSON.stringify(
                    { 
                        "method":"packages.list.available",
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
                                new TransitionEvent(packageadmin, {
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
                        
                        var hasInstallRight = containsAdminAll ||
                            array.indexOf(rights, "packages.install")>=0;
                        
                        array.forEach(data.list, function(pack)
                        {
                            var actArrowClass = 'mblDomButtonGreenCirclePlus';
                            if(array.indexOf(installedpackages, pack.name)>=0)
                            {
                                actArrowClass = 'mblDomButtonBlueCirclePlus';
                            }
                            var childWidget = new dojox.mobile.ListItem({
                                id:"pkginst_" + pack.name,
                                rightText:pack.version,
                                clickable:hasInstallRight,
                                arrowClass:actArrowClass,
                                label:pack.name});
                            list.addChild(childWidget);
                            if(hasInstallRight)
                            {
                                childWidget.on("click", function() { installPackage(pack.name);});
                            }
                        });
                        
                        new TransitionEvent(packageadmin, {
                            moveTo: "viewavailablepackages",
                            transition: "slide",
                            transitionDir: 1
                        }).dispatch();
                    },
                    function(err) {
                        showErrorTextDialog(err.toString());
                    }
                );
            },
            function(err) {
                showErrorTextDialog(err.toString());
            }
        );
    });
}

/******************************************************************************/
function updatePackageFeed(pkgid)
{
    require(["dojo/_base/array", "dojo/request", "dijit/registry", "dojox/mobile/TransitionEvent"], 
        function(array, request, registry, TransitionEvent)
    {
        list = registry.byId("list_installedpackages");
        list.destroyDescendants();
        request("/admin/json", 
        {
            method:"POST",
            data: JSON.stringify(
            { 
                "method":"packages.update.feed",
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
                        new TransitionEvent(packageadmin, {
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
function installPackage(pkgid)
{
    require(["dojo/_base/array", "dojo/request", "dijit/registry", "dojox/mobile/TransitionEvent"], 
        function(array, request, registry, TransitionEvent)
    {
        request("/admin/json", 
        {
            method:"POST",
            data: JSON.stringify(
            { 
                "method":"package.install",
                "package":pkgid,
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
                        new TransitionEvent(packageadmin, {
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
                else
                {
                    var item = registry.byId("pkginst_" + pkgid);
                    item.setArrow('mblDomButtonBlueCirclePlus');
                }
            },
            function(err) {
                showErrorTextDialog(err.toString());
            }
        );
    });
}

/******************************************************************************/
var selectedpackage;

function uninstallPackage(pkgid)
{
    require(["dijit/registry"], 
        function(registry)
    {
        selectedpackage = pkgid;
        registry.byId('confirmpackageuninstalldialog').show();
    });
}

/******************************************************************************/
function uninstallSelectedPackage()
{
    require(["dojo/_base/array", "dojo/request", "dijit/registry", "dojox/mobile/TransitionEvent"], 
        function(array, request, registry, TransitionEvent)
    {
        registry.byId('confirmpackageuninstalldialog').hide();
        list = registry.byId("list_installedpackages");
        request("/admin/json", 
        {
            method:"POST",
            data: JSON.stringify(
            { 
                "method":"package.uninstall",
                "package":selectedpackage,
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
                        new TransitionEvent(packageadmin, {
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