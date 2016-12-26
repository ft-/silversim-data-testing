// SilverSim is distributed under the terms of the
// GNU Affero General Public License v3

function send_command()
{
	require(["dojo/request", "dijit/registry"], function(request, registry)
	{
		var command = registry.byId("command_input").get('value');

		request("/admin/json", 
		{
			method:"POST",
			data: JSON.stringify(
			{ 
				"command":command,
				"method":"console.command",
				"sessionid":sessionid
			}),
			headers:
			{
				"Content-Type":"application/json"
			},
		}).then(
			function(response) 
			{
				registry.byId("command_output").set('innerHTML', "<pre>"+response+"</pre>");
			},
			function(err) {
			}
		);
	});
}
