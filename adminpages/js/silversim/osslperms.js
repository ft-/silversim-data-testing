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
var osslperms_inited = false;
var osslperms_block = false;

function init_osslperms()
{
    if(osslperms_inited)
    {
        return;
    }
    osslperms_inited = true;
    require(["dijit/registry"], function(registry)
    {
        registry.byId("osslperm_estateownerallowed").on("stateChanged", 
            function(newstate) { osslperms_change_state("OSSL." + osslperms_selectedfunction + ".IsEstateOwnerAllowed", newstate) });
        registry.byId("osslperm_estatemanagerallowed").on("stateChanged", 
            function(newstate) { osslperms_change_state("OSSL." + osslperms_selectedfunction + ".IsEstateManagerAllowed", newstate) });
        registry.byId("osslperm_regionownerallowed").on("stateChanged", 
            function(newstate) { osslperms_change_state("OSSL." + osslperms_selectedfunction + ".IsRegionOwnerAllowed", newstate) });
        registry.byId("osslperm_parcelownerallowed").on("stateChanged", 
            function(newstate) { osslperms_change_state("OSSL." + osslperms_selectedfunction + ".IsParcelOwnerAllowed", newstate) });
        registry.byId("osslperm_parcelgroupmemberallowed").on("stateChanged", 
            function(newstate) { osslperms_change_state("OSSL." + osslperms_selectedfunction + ".IsParcelGroupMemberAllowed", newstate) });
        registry.byId("osslperm_everyoneallowed").on("stateChanged", 
            function(newstate) { osslperms_change_state("OSSL." + osslperms_selectedfunction + ".IsEveryoneAllowed", newstate) });
    });
}

function osslperms_change_state(name, newstate)
{
    if(osslperms_block)
    {
        return;
    }
    if(newstate == "on")
    {
        newstate = "true";
    }
    else
    {
        newstate = "false";
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
            },
            function(err) {
            }
        );
    });
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
    init_osslperms();
    require(["dojo/_base/array", "dojo/request", "dijit/registry", "dojox/mobile/TransitionEvent"], 
        function(array, request, registry, TransitionEvent)
    {
        osslperms_selectedfunction = functionid;
        registry.byId("viewosslperm_title").set('label', "OSSL Permissions for " + functionid)
        request("/admin/json", 
        {
            method:"POST",
            data: JSON.stringify(
            { 
                "method":"serverparams.get.explicitly",
                "parameters":[
                    {
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
                    }
                ],
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
                    osslperms_block = true;
                    registry.byId("osslperm_estateownerallowed").set("value", "off");
                    registry.byId("osslperm_estatemanagerallowed").set("value", "off");
                    registry.byId("osslperm_regionownerallowed").set("value", "off");
                    registry.byId("osslperm_parcelownerallowed").set("value", "off");
                    registry.byId("osslperm_parcelgroupmemberallowed").set("value", "off");
                    registry.byId("osslperm_everyoneallowed").set("value", "off");
                    array.forEach(data.values, function(pack)
                    {
                        if(pack.parameter == "OSSL." + functionid + ".IsEstateOwnerAllowed")
                        {
                            registry.byId("osslperm_estateownerallowed").set("value", pack.value == "true" ? "on" : "false");
                        }
                        else if(pack.parameter == "OSSL." + functionid + ".IsEstateManagerAllowed")
                        {
                            registry.byId("osslperm_estatemanagerallowed").set("value", pack.value == "true" ? "on" : "false");
                        }
                        else if(pack.parameter == "OSSL." + functionid + ".IsRegionOwnerAllowed")
                        {
                            registry.byId("osslperm_regionownerallowed").set("value", pack.value == "true" ? "on" : "false");
                        }
                        else if(pack.parameter == "OSSL." + functionid + ".IsParcelOwnerAllowed")
                        {
                            registry.byId("osslperm_parcelownerallowed").set("value", pack.value == "true" ? "on" : "false");
                        }
                        else if(pack.parameter == "OSSL." + functionid + ".IsParcelGroupMemberAllowed")
                        {
                            registry.byId("osslperm_parcelgroupmemberallowed").set("value", pack.value == "true" ? "on" : "false");
                        }
                        else if(pack.parameter == "OSSL." + functionid + ".IsEveryoneAllowed")
                        {
                            registry.byId("osslperm_everyoneallowed").set("value", pack.value == "true" ? "on" : "false");
                        }
                    });
                    osslperms_block = false;
                    
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
