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

var osslperms_returnview;
var osslperms_regionid;
var osslperms_selectedfunction;
var osslperms_block = false;

function osslperms_change_state(name, newstate, elementprefix, defvalue)
{
    if(osslperms_block)
    {
        return;
    }
    if(newstate == "on")
    {
        newstate = "true";
    }
    else if(newstate == "off")
    {
        newstate = "false";
    }
    else
    {
        newstate = "";
    }
    require(["dojo/_base/array", "dojo/request", "dijit/registry", "dojox/mobile/TransitionEvent"], 
        function(array, request, registry, TransitionEvent)
    {
        request("/admin/json", 
        {
            method:"POST",
            data: JSON.stringify(
            { 
                "method":"serverparam.set",
                "parameter":name,
                "value":newstate,
                "regionid":osslperms_regionid,
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
                        new TransitionEvent(viewosslperms, {
                            moveTo: "viewlogin",
                            transition: "slide",
                            transitionDir: -1
                        }).dispatch();
                        return;
                    }
                    showErrorDialog(data.reason);
                }
                else if(osslperms_regionid != "00000000-0000-0000-0000-000000000000" && newstate != "")
                {
                    if(!registry.byId(elementprefix + "_setdef"))
                    {
                        var catChild = registry.byId(elementprefix + "_cat");
                        var childWidget = new dojox.mobile.ListItem({
                            id:elementprefix + "_setdef", 
                            label:"Use global",
                            rightText:defvalue,
                            clickable:true});
                        catChild.addChild(childWidget);
                        childWidget.on("click", function() { osslperms_reset_state(
                            name,
                            elementprefix, 
                            defvalue); });
                    }
                }
            },
            function(err) {
            }
        );
    });
}

function osslperms_reset_state(name, elementprefix, defaultvalue)
{
    osslperms_change_state(name, "");
    osslperms_block = true;
    require(["dijit/registry"], function(registry)
    {
        registry.byId(elementprefix).set('value', defaultvalue);
        var widget = registry.byId(elementprefix + "_setdef");
        if(widget)
        {
            widget.destroyRecursive();
        }
    });
    osslperms_block = false;
}

function go_back_to_osslperms()
{
    require(["dojox/mobile/TransitionEvent"], function(TransitionEvent)
    {
        new TransitionEvent(viewosslperm, {
                        moveTo: "viewosslperms",
                        transition: 'slide',
                        transitionDir: -1
                    }).dispatch();    
    });
}

function osslperms_go_back()
{
    require(["dojox/mobile/TransitionEvent"], function(TransitionEvent)
    {
        new TransitionEvent(viewosslperms, {
                        moveTo: osslperms_returnview.id,
                        transition: 'slide',
                        transitionDir: -1
                    }).dispatch();    
    });
}

function osslperms_show(returnview, title, regionid)
{
    require(["dijit/registry", "dojox/mobile/TransitionEvent"], function(registry, TransitionEvent)
    {
        registry.byId('viewosslperms_title').set('label',title);
        osslperms_returnview = returnview;
        osslperms_regionid = regionid;
        
        new TransitionEvent(osslperms_returnview, {
                            moveTo: "viewosslperms",
                            transition: "slide",
                            transitionDir: 1
                        }).dispatch();
    });
}

function osslperm_select(functionid)
{
    require(["dojo/_base/array", "dojo/request", "dijit/registry", "dojox/mobile/TransitionEvent"], 
        function(array, request, registry, TransitionEvent, style)
    {
        var defregionid = "00000000-0000-0000-0000-000000000000";
        osslperms_selectedfunction = functionid;
        registry.byId("viewosslperm_title").set('label', "OSSL Permissions for " + functionid)
        registry.byId("viewosslperm_switches").destroyDescendants();
        reqparams = [{
                        "parameter":"OSSL." + functionid + ".AllowedCreators",
                        "regionid":osslperms_regionid,
                    },
                    {
                        "parameter":"OSSL." + functionid + ".AllowedOwners",
                        "regionid":osslperms_regionid,
                    },
                    {
                        "parameter":"OSSL." + functionid + ".IsEstateOwnerAllowed",
                        "regionid":osslperms_regionid,
                    },
                    {
                        "parameter":"OSSL." + functionid + ".IsEstateManagerAllowed",
                        "regionid":osslperms_regionid,
                    },
                    {
                        "parameter":"OSSL." + functionid + ".IsRegionOwnerAllowed",
                        "regionid":osslperms_regionid,
                    },
                    {
                        "parameter":"OSSL." + functionid + ".IsParcelOwnerAllowed",
                        "regionid":osslperms_regionid,
                    },
                    {
                        "parameter":"OSSL." + functionid + ".IsParcelGroupMemberAllowed",
                        "regionid":osslperms_regionid,
                    },
                    {
                        "parameter":"OSSL." + functionid + ".IsEveryoneAllowed",
                        "regionid":osslperms_regionid,
                    }]
        if(osslperms_regionid != "00000000-0000-0000-0000-000000000000")
        {
            reqparams = reqparams.concat([
                    {
                        "parameter":"OSSL." + functionid + ".AllowedCreators",
                        "regionid":defregionid,
                    },
                    {
                        "parameter":"OSSL." + functionid + ".AllowedOwners",
                        "regionid":defregionid,
                    },
                    {
                        "parameter":"OSSL." + functionid + ".IsEstateOwnerAllowed",
                        "regionid":defregionid,
                    },
                    {
                        "parameter":"OSSL." + functionid + ".IsEstateManagerAllowed",
                        "regionid":defregionid,
                    },
                    {
                        "parameter":"OSSL." + functionid + ".IsRegionOwnerAllowed",
                        "regionid":defregionid,
                    },
                    {
                        "parameter":"OSSL." + functionid + ".IsParcelOwnerAllowed",
                        "regionid":defregionid,
                    },
                    {
                        "parameter":"OSSL." + functionid + ".IsParcelGroupMemberAllowed",
                        "regionid":defregionid,
                    },
                    {
                        "parameter":"OSSL." + functionid + ".IsEveryoneAllowed",
                        "regionid":defregionid,
                    }
                ]);
        }
        
        request("/admin/json", 
        {
            method:"POST",
            data: JSON.stringify(
            { 
                "method":"serverparams.get.explicitly",
                "parameters":reqparams,
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
                        new TransitionEvent(viewosslperms, {
                            moveTo: "viewlogin",
                            transition: "slide",
                            transitionDir: -1
                        }).dispatch();
                        return;
                    }
                    showErrorDialog(data.reason);
                }
                else
                {
                    var def_isestateownerallowed = "off";
                    var def_isestatemanagerallowed = "off";
                    var def_isregionownerallowed = "off";
                    var def_isparcelownerallowed = "off";
                    var def_isparcelgroupmemberallowed = "off";
                    var def_iseveryoneallowed = "off";
                    var def_allowedcreators = "";
                    var def_allowedowners = "";
                    
                    array.forEach(data.values, function(pack)
                    {
                        if(pack.parameter == "OSSL." + functionid + ".IsEstateOwnerAllowed")
                        {
                            if(pack.regionid == defregionid)
                            {
                                def_isestateownerallowed = pack.value == "true" ? "on" : "off";
                            }
                        }
                        else if(pack.parameter == "OSSL." + functionid + ".IsEstateManagerAllowed")
                        {
                            if(pack.regionid == defregionid)
                            {
                                def_isestatemanagerallowed = pack.value == "true" ? "on" : "off";
                            }
                        }
                        else if(pack.parameter == "OSSL." + functionid + ".IsRegionOwnerAllowed")
                        {
                            if(pack.regionid == defregionid)
                            {
                                def_isregionownerallowed = pack.value == "true" ? "on" : "off";
                            }
                        }
                        else if(pack.parameter == "OSSL." + functionid + ".IsParcelOwnerAllowed")
                        {
                            if(pack.regionid == defregionid)
                            {
                                def_isparcelownerallowed = pack.value == "true" ? "on" : "off";
                            }
                        }
                        else if(pack.parameter == "OSSL." + functionid + ".IsParcelGroupMemberAllowed")
                        {
                            if(pack.regionid == defregionid)
                            {
                                def_isparcelgroupmemberallowed = pack.value == "true" ? "on" : "off";
                            }
                        }
                        else if(pack.parameter == "OSSL." + functionid + ".IsEveryoneAllowed")
                        {
                            if(pack.regionid == defregionid)
                            {
                                def_iseveryoneallowed = pack.value == "true" ? "on" : "off";
                            }
                        }
                        else if(pack.parameter == "OSSL." + functionid + ".AllowedCreators")
                        {
                            if(pack.regionid == defregionid)
                            {
                                def_allowedcreators = pack.value;
                            }
                        }
                        else if(pack.parameter == "OSSL." + functionid + ".AllowedOwners")
                        {
                            if(pack.regionid == defregionid)
                            {
                                def_allowedowners = pack.value;
                            }
                        }
                    });
                    
                    var isestateownerallowed = def_isestateownerallowed;
                    var isestatemanagerallowed = def_isestatemanagerallowed;
                    var isregionownerallowed = def_isregionownerallowed;
                    var isparcelownerallowed = def_isparcelownerallowed;
                    var isparcelgroupmemberallowed = def_isparcelgroupmemberallowed;
                    var iseveryoneallowed = def_iseveryoneallowed;
                    var allowedowners = def_allowedowners;
                    var allowedcreators = def_allowedcreators;
                    var allowedowners_regionid = defregionid;
                    var allowedcreators_regionid = defregionid;
                    
                    var show_def_isestateownerallowed = false;
                    var show_def_isestatemanagerallowed = false;
                    var show_def_isregionownerallowed = false;
                    var show_def_isparcelownerallowed = false;
                    var show_def_isparcelgroupmemberallowed = false;
                    var show_def_iseveryoneallowed = false;
                    
                    array.forEach(data.values, function(pack)
                    {
                        if(pack.parameter == "OSSL." + functionid + ".IsEstateOwnerAllowed")
                        {
                            if(pack.regionid == osslperms_regionid)
                            {
                                isestateownerallowed = pack.value == "true" ? "on" : "off";
                                show_def_isestateownerallowed = true;
                            }
                        }
                        else if(pack.parameter == "OSSL." + functionid + ".IsEstateManagerAllowed")
                        {
                            if(pack.regionid == osslperms_regionid)
                            {
                                isestatemanagerallowed = pack.value == "true" ? "on" : "off";
                                show_def_isestatemanagerallowed = true;
                            }
                        }
                        else if(pack.parameter == "OSSL." + functionid + ".IsRegionOwnerAllowed")
                        {
                            if(pack.regionid == osslperms_regionid)
                            {
                                iseregionownerallowed = pack.value == "true" ? "on" : "off";
                                show_def_isregionownerallowed = true;
                            }
                        }
                        else if(pack.parameter == "OSSL." + functionid + ".IsParcelOwnerAllowed")
                        {
                            if(pack.regionid == osslperms_regionid)
                            {
                                isestateownerallowed = pack.value == "true" ? "on" : "off";
                                show_def_isparcelownerallowed = true;
                            }
                        }
                        else if(pack.parameter == "OSSL." + functionid + ".IsParcelGroupMemberAllowed")
                        {
                            if(pack.regionid == osslperms_regionid)
                            {
                                isparcelgroupmemberallowed = pack.value == "true" ? "on" : "off";
                                show_def_isparcelgroupmemberallowed = true;
                            }
                        }
                        else if(pack.parameter == "OSSL." + functionid + ".IsEveryoneAllowed")
                        {
                            if(pack.regionid == osslperms_regionid)
                            {
                                iseveryoneallowed = pack.value == "true" ? "on" : "off";
                                show_def_iseveryoneallowed = true;
                            }
                        }
                        else if(pack.parameter == "OSSL." + functionid + ".AllowedCreators")
                        {
                            if(pack.regionid == osslperms_regionid)
                            {
                                allowedcreators = pack.value;
                                allowedcreators_regionid = pack.regionid;
                            }
                        }
                        else if(pack.parameter == "OSSL." + functionid + ".AllowedOwners")
                        {
                            if(pack.regionid == osslperms_regionid)
                            {
                                allowedowners = pack.value;
                                allowedowners_regionid = pack.regionid;
                            }
                        }
                    });
                                        
                    var list = registry.byId("viewosslperm_switches");
                    
                    //---------------------------------------------------------
                    var formWidget = new dojox.mobile.RoundRectList({id:"viewosslperm_estateownerallowed_cat"});
                    list.addChild(formWidget)
                    
                    var childWidget = new dojox.mobile.ListItem({
                        label:"Is estate owner allowed"});
                    formWidget.addChild(childWidget);
                    var sw = new dojox.mobile.Switch({
                        id:"viewosslperm_estateownerallowed", 
                        value:isestateownerallowed});
                    childWidget.addChild(sw);
                    sw.on("stateChanged", function(val) {osslperms_change_state(
                        "OSSL." + osslperms_selectedfunction + ".IsEstateOwnerAllowed", 
                        val, 
                        "viewosslperm_estateownerallowed",
                        def_isestateownerallowed); });
                    
                    if(osslperms_regionid != defregionid && show_def_isestateownerallowed)
                    {
                        var childWidget = new dojox.mobile.ListItem({
                            id:"viewosslperm_estateownerallowed_setdef", 
                            label:"Use global",
                            rightText:def_isestateownerallowed,
                            clickable:true});
                        formWidget.addChild(childWidget);
                        childWidget.on("click", function() { osslperms_reset_state(
                            "OSSL." + osslperms_selectedfunction + ".IsEstateOwnerAllowed", 
                            "viewosslperm_estateownerallowed", 
                            def_isestateownerallowed); });
                    }
                    
                    //---------------------------------------------------------
                    var formWidget = new dojox.mobile.RoundRectList({id:"viewosslperm_estatemanagerallowed_cat"});
                    list.addChild(formWidget)
                    
                    var childWidget = new dojox.mobile.ListItem({
                        label:"Is estate manager allowed"});
                    formWidget.addChild(childWidget);
                    var sw = new dojox.mobile.Switch({
                        id:"viewosslperm_estatemanagerallowed", 
                        value:isestatemanagerallowed});
                    childWidget.addChild(sw);
                    sw.on("stateChanged", function(val) {osslperms_change_state(
                        "OSSL." + osslperms_selectedfunction + ".IsEstateManagerAllowed", 
                        val,
                        "viewosslperm_estatemanagerallowed",
                        def_isestatemanagerallowed); });

                    if(osslperms_regionid != defregionid && show_def_isestatemanagerallowed)
                    {
                        var childWidget = new dojox.mobile.ListItem({
                            id:"viewosslperm_estatemanagerallowed_setdef", 
                            label:"Use global",
                            rightText:def_isestatemanagerallowed,
                            clickable:true});
                        formWidget.addChild(childWidget);
                        childWidget.on("click", function() { osslperms_reset_state(
                            "OSSL." + osslperms_selectedfunction + ".IsEstateManagerAllowed", 
                            "viewosslperm_estatemanagerallowed", 
                            def_isestatemanagerallowed); });
                    }
                    
                    //---------------------------------------------------------
                    var formWidget = new dojox.mobile.RoundRectList({id:"viewosslperm_regionownerallowed_cat"});
                    list.addChild(formWidget)
                    
                    var childWidget = new dojox.mobile.ListItem({
                        label:"Is region owner allowed"});
                    formWidget.addChild(childWidget);
                    var sw = new dojox.mobile.Switch({
                        id:"viewosslperm_regionownerallowed", 
                        value:isregionownerallowed});
                    childWidget.addChild(sw);
                    sw.on("stateChanged", function(val) {osslperms_change_state(
                        "OSSL." + osslperms_selectedfunction + ".IsRegionOwnerAllowed", 
                        val,
                        "viewosslperm_regionownerallowed",
                        def_isregionownerallowed); });
                    
                    if(osslperms_regionid != defregionid && show_def_isregionownerallowed)
                    {
                        var childWidget = new dojox.mobile.ListItem({
                            id:"viewosslperm_regionownerallowed_setdef", 
                            label:"Use global",
                            rightText:def_isregionownerallowed,
                            clickable:true});
                        formWidget.addChild(childWidget);
                        childWidget.on("click", function() { osslperms_reset_state(
                            "OSSL." + osslperms_selectedfunction + ".IsRegionOwnerAllowed", 
                            "viewosslperm_regionownerallowed", 
                            def_isregionownerallowed); });
                    }
                    
                    //---------------------------------------------------------
                    var formWidget = new dojox.mobile.RoundRectList({id:"viewosslperm_parcelownerallowed_cat"});
                    list.addChild(formWidget)
                    
                    var childWidget = new dojox.mobile.ListItem({
                        label:"Is parcel owner allowed"});
                    formWidget.addChild(childWidget);
                    var sw = new dojox.mobile.Switch({
                        id:"viewosslperm_parcelownerallowed", 
                        value:isparcelownerallowed});
                    childWidget.addChild(sw);
                    sw.on("stateChanged", function(val) {osslperms_change_state(
                        "OSSL." + osslperms_selectedfunction + ".IsParcelOwnerAllowed", 
                        val,
                        "viewosslperm_parcelownerallowed",
                        def_isparcelownerallowed);});
                    
                    if(osslperms_regionid != defregionid && show_def_isparcelownerallowed)
                    {
                        var childWidget = new dojox.mobile.ListItem({
                            id:"viewosslperm_parcelownerallowed_setdef", 
                            label:"Use global",
                            rightText:def_isparcelownerallowed,
                            clickable:true});
                        formWidget.addChild(childWidget);
                        childWidget.on("click", function() { osslperms_reset_state(
                            "OSSL." + osslperms_selectedfunction + ".IsParcelOwnerAllowed", 
                            "viewosslperm_parcelownerallowed", 
                            def_isparcelownerallowed); });
                    }
                    
                    //---------------------------------------------------------
                    var formWidget = new dojox.mobile.RoundRectList({id:"viewosslperm_parcelgroupmemberallowed_cat"});
                    list.addChild(formWidget)
                    
                    var childWidget = new dojox.mobile.ListItem({
                        label:"Is parcel group member allowed"});
                    formWidget.addChild(childWidget);
                    var sw = new dojox.mobile.Switch({
                        id:"viewosslperm_parcelgroupmemberallowed", 
                        value:isparcelgroupmemberallowed});
                    childWidget.addChild(sw);
                    sw.on("stateChanged", function(val) {osslperms_change_state(
                        "OSSL." + osslperms_selectedfunction + ".IsParcelGroupMemberAllowed", 
                        val,
                        "viewosslperm_parcelgroupmemberallowed",
                        def_isparcelgroupmemberallowed); });
                    
                    if(osslperms_regionid != defregionid && show_def_isparcelgroupmemberallowed)
                    {
                        var childWidget = new dojox.mobile.ListItem({
                            id:"viewosslperm_parcelgroupmemberallowed_setdef", 
                            label:"Use global",
                            rightText:def_isparcelgroupmemberallowed,
                            clickable:true});
                        formWidget.addChild(childWidget);
                        childWidget.on("click", function() { osslperms_reset_state(
                            "OSSL." + osslperms_selectedfunction + ".IsParcelGroupMemberAllowed", 
                            "viewosslperm_parcelgroupmemberallowed", 
                            def_isparcelgroupmemberallowed); });
                    }
                    
                    //---------------------------------------------------------
                    var formWidget = new dojox.mobile.RoundRectList({id:"viewosslperm_everyoneallowed_cat"});
                    list.addChild(formWidget)
                    
                    var childWidget = new dojox.mobile.ListItem({
                        label:"Is everyone allowed"});
                    formWidget.addChild(childWidget);
                    var sw = new dojox.mobile.Switch({
                        id:"viewosslperm_everyoneallowed", 
                        value:iseveryoneallowed});
                    childWidget.addChild(sw);
                    sw.on("stateChanged", function(val) {osslperms_change_state(
                        "OSSL." + osslperms_selectedfunction + ".IsEveryoneAllowed", 
                        val,
                        "viewosslperm_everyoneallowed",
                        def_iseveryoneallowed); });
                    
                    if(osslperms_regionid != defregionid && show_def_iseveryoneallowed)
                    {
                        var childWidget = new dojox.mobile.ListItem({
                            id:"viewosslperm_everyoneallowed_setdef", 
                            label:"Use global",
                            rightText:def_iseveryoneallowed,
                            clickable:true});
                        formWidget.addChild(childWidget);
                        childWidget.on("click", function() { osslperms_reset_state(
                            "OSSL." + osslperms_selectedfunction + ".IsEveryoneAllowed", 
                            "viewosslperm_everyoneallowed", 
                            def_iseveryoneallowed); });
                    }
                   
                    ossl_update_allowedcreators(allowedcreators, allowedcreators_regionid);
                    ossl_update_allowedowners(allowedowners, allowedowners_regionid);
                    
                    new TransitionEvent(viewosslperms, {
                                    moveTo: "viewosslperm",
                                    transition: 'slide',
                                    transitionDir: 1
                                }).dispatch();    
                }
            },
            function(err) {
            }
        );
    });
}

var allowedowners_permlist = [];
var allowedcreators_permlist = [];

function ossl_update_allowedcreators(result, usedregioniddata)
{
    require(["dojo/_base/array", "dijit/registry"],
        function(array, registry)
    {
        var defregionid = "00000000-0000-0000-0000-000000000000";
        var list = registry.byId("list_allowedcreators");
        list.destroyDescendants();

        if(osslperms_regionid != defregionid && usedregioniddata != defregionid)
        {
            var childWidget = new dojox.mobile.ListItem({
                id:"viewosslperm_allowedcreators_setdef", 
                label:"Use global",
                clickable:true});
            list.addChild(childWidget);
            childWidget.on("click", function() { osslperms_reset_list(
                "OSSL." + osslperms_selectedfunction + ".AllowedCreators", 
                ossl_update_allowedcreators); });
        }
        
        if(result != "")
        {
            allowedcreators_permlist = result.split(",");
        }
        else
        {
            allowedcreators_permlist = []
        }
        array.forEach(allowedcreators_permlist, function(uui)
        {
            var childWidget = new dojox.mobile.ListItem({
                label:uui,
                arrowClass:"mblDomButtonRedCircleMinus",
                clickable:true});
            list.addChild(childWidget);
        });
        
        var childWidget = new dojox.mobile.ListItem({
            label:"Add new entry",
            arrowClass:"mblDomButtonGreenCirclePlus",
            clickable:true});
        list.addChild(childWidget);
    });
}

function ossl_update_allowedowners(result, usedregioniddata)
{
    require(["dojo/_base/array", "dijit/registry"],
        function(array, registry)
    {
        var defregionid = "00000000-0000-0000-0000-000000000000";
        var list = registry.byId("list_allowedowners");
        list.destroyDescendants();

        if(osslperms_regionid != defregionid && usedregioniddata != defregionid)
        {
            var childWidget = new dojox.mobile.ListItem({
                id:"viewosslperm_allowedowners_setdef", 
                label:"Use global",
                clickable:true});
            list.addChild(childWidget);
            childWidget.on("click", function() { osslperms_reset_list(
                "OSSL." + osslperms_selectedfunction + ".AllowedOwners", 
                ossl_update_allowedowners); });
        }

        if(result != "")
        {
            allowedowners_permlist = result.split(",");
        }
        else
        {
            allowedowners_permlist = []
        }
        array.forEach(allowedowners_permlist, function(uui)
        {
            var childWidget = new dojox.mobile.ListItem({
                label:uui,
                arrowClass:"mblDomButtonRedCircleMinus",
                clickable:true});
            list.addChild(childWidget);
        });
        
        var childWidget = new dojox.mobile.ListItem({
            label:"Add new entry",
            arrowClass:"mblDomButtonGreenCirclePlus",
            clickable:true});
        list.addChild(childWidget);
    });
}

function osslperms_reset_list(parameter, updatefunc)
{
    require(["dojo/_base/array", "dojo/request", "dijit/registry", "dojox/mobile/TransitionEvent"], 
        function(array, request, registry, TransitionEvent)
    {
        request("/admin/json", 
        {
            method:"POST",
            data: JSON.stringify(
            { 
                "method":"serverparam.set",
                "parameter":parameter,
                "value":"",
                "regionid":osslperms_regionid,
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
                        new TransitionEvent(viewosslperms, {
                            moveTo: "viewlogin",
                            transition: "slide",
                            transitionDir: -1
                        }).dispatch();
                        return;
                    }
                    showErrorDialog(data.reason);
                }
                else
                {
                    osslperms_read_list(parameter, updatefunc);
                }
            },
            function(err) {
            }
        );
    });
}

function osslperms_read_list(parameter, updatefunc)
{
    require(["dojo/_base/array", "dojo/request", "dijit/registry", "dojox/mobile/TransitionEvent"], 
        function(array, request, registry, TransitionEvent)
    {
        request("/admin/json", 
        {
            method:"POST",
            data: JSON.stringify(
            { 
                "method":"serverparam.get",
                "parameter":parameter,
                "value":"",
                "regionid":osslperms_regionid,
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
                        new TransitionEvent(viewosslperms, {
                            moveTo: "viewlogin",
                            transition: "slide",
                            transitionDir: -1
                        }).dispatch();
                        return;
                    }
                    else if(data.reason == 2)
                    {
                        updatefunc("", "00000000-0000-0000-0000-000000000000");
                        return;
                    }
                    showErrorDialog(data.reason);
                }
                else
                {
                    updatefunc(data.value, data.regionid);
                }
            },
            function(err) {
            }
        );
    });
}
