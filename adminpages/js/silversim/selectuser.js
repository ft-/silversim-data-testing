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

var selectuser_returnview;
var handle_selectuser_okay;
var selectuser_current_details;

function selectuser_go_back()
{
    require(["dojox/mobile/TransitionEvent"], function(TransitionEvent)
    {
        new TransitionEvent(viewselectuser, {
                        moveTo: selectuser_returnview.id,
                        transition: 'slide',
                        transitionDir: -1
                    }).dispatch();    
    });
}

function selectuser_go_finish()
{
    require(["dojox/mobile/TransitionEvent"], function(TransitionEvent)
    {
        new TransitionEvent(viewselectuser, {
                        moveTo: selectuser_returnview.id,
                        transition: 'slide',
                        transitionDir: -1
                    }).dispatch();    
    });
    handle_selectuser_okay(selectuser_current_details);
}

function selectuser_new(details)
{
    selectuser_current_details = details;
    require(["dijit/registry"], function(registry)
    {
       registry.byId('viewselectuser_fullname').set('rightText', details.fullname); 
    });
}

function selectuser_show(returnview, details, title)
{
    require(["dijit/registry", "dojox/mobile/TransitionEvent"], function(registry, TransitionEvent)
    {
        list = registry.byId("list_foundusers");
        list.destroyDescendants();
        
        registry.byId('viewselectuser_title').set('label',title);
        registry.byId('viewselectuser_query').set('value', '');
        registry.byId('viewselectuser_id').set('value', '');
        registry.byId('viewselectuser_firstname').set('value', '');
        registry.byId('viewselectuser_lastname').set('value', '');
        if(details)
        {
            registry.byId('viewselectuser_fullname').set('rightText', details.fullname);
        }
        else
        {
            registry.byId('viewselectuser_fullname').set('rightText', '');
        }
        selectuser_returnview = returnview;
        selectuser_current_details = details;
        
        new TransitionEvent(selectuser_returnview, {
                            moveTo: "viewselectuser",
                            transition: "slide",
                            transitionDir: 1
                        }).dispatch();
    });
}

function selectuser_byuuid()
{
    require(["dojo/_base/array", "dojo/request", "dijit/registry", "dojox/mobile/TransitionEvent"], 
        function(array, request, registry, TransitionEvent)
    {
        list = registry.byId("list_foundusers");
        list.destroyDescendants();
        request("/admin/json", 
        {
            method:"POST",
            data: JSON.stringify(
            { 
                "method":"avatarname.getdetails",
                "uuid":registry.byId('viewselectuser_id').get('value'),
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
                
                var childitem = new dojox.mobile.ListItem({
                    label:data.user.fullname,
                    noArrow:true,
                    clickable:true});
                list.addChild(childitem);
                childitem.on('click', function() { selectuser_new(data.user); });
            },
            function(err) {
                showErrorTextDialog(err.toString());
            }
        );
    });
}


function selectuser_byname(e)
{
    require(["dojo/_base/array", "dojo/request", "dijit/registry", "dojox/mobile/TransitionEvent"], 
        function(array, request, registry, TransitionEvent)
    {
        list = registry.byId("list_foundusers");
        list.destroyDescendants();
        request("/admin/json", 
        {
            method:"POST",
            data: JSON.stringify(
            { 
                "method":"avatarname.search.exact",
                "firstname":registry.byId('viewselectuser_firstname').get('value'),
                "lastname":registry.byId('viewselectuser_lastname').get('value'),
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
                
                var childitem = new dojox.mobile.ListItem({
                    label:data.user.fullname,
                    noArrow:true,
                    clickable:true});
                list.addChild(childitem);
                childitem.on('click', function() { selectuser_new(data.user); });
            },
            function(err) {
                showErrorTextDialog(err.toString());
            }
        );
    });
}

function selectuser_byquery(e)
{
    require(["dojo/_base/array", "dojo/request", "dijit/registry", "dojox/mobile/TransitionEvent"], 
        function(array, request, registry, TransitionEvent)
    {
        list = registry.byId("list_foundusers");
        list.destroyDescendants();
        request("/admin/json", 
        {
            method:"POST",
            data: JSON.stringify(
            { 
                "method":"avatarname.search",
                "query":registry.byId('viewselectuser_query').get('value'),
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
                
                array.forEach(data.uuis, function(user)
                {
                    var childitem = new dojox.mobile.ListItem({
                        label:user.fullname,
                        noArrow:true,
                        clickable:true});
                    list.addChild(childitem);
                    childitem.on('click', function() { selectuser_new(user); });
                });
            },
            function(err) {
                showErrorTextDialog(err.toString());
            }
        );
    });
}
