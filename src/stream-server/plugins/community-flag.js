(function($) {

if (Echo.Utils.isComponentDefined("Echo.Plugins.CommunityFlag")) return;

var plugin = Echo.Plugin.skeleton("CommunityFlag");

plugin.applications = ["Echo.StreamServer.Controls.Stream.Item"];

plugin.config = {
	"showUsers": true
};

plugin.labels = {
	"flaggedThis": " flagged this.",
	"flagControl": "Flag",
	"unflagControl": "Unflag",
	"flagProcessing": "Flagging...",
	"unflagProcessing": "Unflagging..."
};

plugin.init = function() {
	this.extendRenderer("flags", plugin.renderers.Item.users);
	this.extendTemplate(plugin.template, "insertAsLastChild", "data");
	this.component.addButtonSpec("CommunityFlag", this._assembleButton("Flag"));
	this.component.addButtonSpec("CommunityFlag", this._assembleButton("Unflag"));
};

plugin.template = '<div class="{class:flags}"></div>';

plugin.renderers = {"Item": {}};

plugin.renderers.Item.users = function(element, dom) {
	var plugin = this, item = this.component;
	var flags = item.get("data.object.flags", []);
	if (!flags.length || !item.user.is("admin") || !plugin.config.get("showUserList")) {
		return element.hide();
	}
	var flagsPerPage = 5;
	var visibleUsersCount = plugin.get("facepile")
		? plugin.get("facepile").getVisibleUsersCount()
		: flagsPerPage;
	var config = plugin.config.assemble({
		"target": element,
		"data": {
			"entries": flags,
			"itemsPerPage": flagsPerPage
		},
		"initialUsersCount": visibleUsersCount,
		"suffixText": plugin.labels.get("flaggedThis")
	});
	plugin.set("facepile", new Echo.StreamServer.Controls.FacePile(config));
	return element.show();
};

plugin.methods._assembleButton = function(name) {
	var plugin = this, item = this.component;
	var callback = function() {
		var item = this;
		item.buttons[plugin.manifest.name + "." + name].element
			.empty()
			.append(plugin.labels.get(name.toLowerCase() + "Processing"));
		var activity = {
			"verbs": ["http://activitystrea.ms/schema/1.0/" + name.toLowerCase()],
			"targets": [{"id": item.get("data.object.id")}]
		};
		var request = Echo.StreamServer.API.request({
			"endpoint": "submit",
			"submissionProxyURL": plugin.config.get("submissionProxyURL", "", true),
			"data": {
				"content": activity,
				"appkey": item.config.get("appkey"),
				"sessionID": item.user.get("sessionID"),
				"target-query": item.config.get("parent.query")
			},
			"onData": function() {
				plugin.events.publish({
					"topic": "on" + name + "Complete",
					"data": {
						"item": {
							"data": item.data,
							"target": item.dom.content
						}
					}
				});
				plugin.requestDataRefresh();
			}
		})
		request.send();
	};
	return function() {
		var item = this;
		var flags = item.get("data.object.flags");
		var label = plugin.labels.get(name.toLowerCase() + "Control");
		var action = plugin._myFlags(flags).length > 0 ? "Unflag" : "Flag";
		return {
			"name": name,
			"label": '<span class="echo-clickable">' + label + '</span>' +
				(item.user.is("admin") && flags.length ? " (" + flags.length + ")" : ""),
			"visible": item.user.is("logged") && action == name,
			"onetime": true,
			"callback": callback
		};
	};
};

plugin.methods._myFlags = function(flags) {
	var item = this.component;
	return $.map(flags, function(entry) {
		if (item.user.has("identity", entry.actor.id)) return entry;
	});
};

plugin.css = '.{class:flags} { background: url(//cdn.echoenabled.com/images/curation/status/communityflagged.png) no-repeat 0px 4px; padding: 0px 0px 4px 21px; }';

Echo.Plugin.create(plugin);

})(jQuery);
