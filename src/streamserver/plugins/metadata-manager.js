(function(jQuery) {
"use strict";

var $ = jQuery;

/**
 * @class Echo.StreamServer.Controls.Stream.Item.Plugins.MetadataManager
 * Provides the ability to add buttons to the Echo Stream control items
 * adding/removing markers/tags. By default those buttons will be available
 * for moderators and administrators, though the visibility of tag controls
 * can be configured via special param.
 *
 * 	new Echo.StreamServer.Controls.Stream({
 * 		"target": document.getElementById("echo-stream"),
 * 		"appkey": "test.echoenabled.com",
 * 		"plugins": [{
 * 			"name": "MetadataManager"
 * 		}]
 * 	});
 *
 * @extends Echo.Plugin
 */
var plugin = Echo.Plugin.manifest("MetadataManager", "Echo.StreamServer.Controls.Stream.Item");

if (Echo.Plugin.isDefined(plugin)) return;

plugin.init = function() {
	var self = this, item = this.component;
	$.each(this.config.get("controls"), function(i, control) {
		item.addButtonSpec("MetadataManager", self._assembleButton("Mark", control));
		item.addButtonSpec("MetadataManager", self._assembleButton("Unmark", control));
	});
};

/**
 * @cfg {Array} controls
 * Specifies the list of buttons which should be added to the Echo Stream item.
 *
 * @cfg {String} controls.marker
 * Specifies the value of marker to be set.
 *
 * @cfg {String} controls.tag
 * Specifies the value of tag to be set.
 *
 * @cfg {String} controls.labelMark
 * Specifies the button label to perform the corresponding action.
 * 
 * @cfg {String} controls.labelUnmark
 * Specifies the button label to undo the corresponding action.
 *
 * @cfg {Object|Function} controls.visible
 * Specifies the visibility condition. Applicable only for tags.
 * Can be either an object or a function. In case of a function type,
 * the function is called within the Item context ("this" points to the current item).
 *
 * Example: simple marker control.
 *
 * 	new Echo.StreamServer.Controls.Stream({
 * 		"target": document.getElementById("echo-stream"),
 * 		"appkey": "test.echoenabled.com",
 * 		"plugins": [{
 * 			"name": "MetadataManager"
 * 			"controls": [{
 * 				"marker": "sticky",
 * 				"labelMark": "Pin",
 * 				"labelUnmark": "Unpin"
 * 			}]
 * 		}]
 * 	});
 *
 * Example: simple tag control.
 *
 * 	new Echo.StreamServer.Controls.Stream({
 * 		"target": document.getElementById("echo-stream"),
 * 		"appkey": "test.echoenabled.com",
 * 		"plugins": [{
 * 			"name": "MetadataManager"
 * 			"controls": [{
 * 				"tag": "football",
 * 				"labelMark": "Set Football tag",
 * 				"labelUnmark": "Unset Football tag"
 * 			}]
 * 		}]
 * 	});
 *
 * Example: tag control with visibility condition defined as an object.
 *
 * 	new Echo.StreamServer.Controls.Stream({
 * 		"target": document.getElementById("echo-stream"),
 * 		"appkey": "test.echoenabled.com",
 * 		"plugins": [{
 * 			"name": "MetadataManager"
 * 			"controls": [{
 * 				"tag": "football",
 * 				"labelMark": "Set Football tag",
 * 				"labelUnmark": "Unset Football tag",
 * 				"visible": {
 * 					"user.markers": ["top_commenter", "top_visitor"],
 * 					"user.state": ["Untouched", "ModeratorApproved"]
 * 					"user.roles": ["Moderator"]
 * 				}
 * 			}]
 * 		}]
 * 	});
 *
 * Example: tag control with visibility condition defined as a function 
 *
 * 	new Echo.StreamServer.Controls.Stream({
 * 		"target": document.getElementById("echo-stream"),
 * 		"appkey": "test.echoenabled.com",
 * 		"plugins": [{
 * 			"name": "MetadataManager"
 * 			"controls": [{
 * 				"tag": "football",
 * 				"labelMark": "Set Football tag",
 * 				"labelUnmark": "Unset Football tag",
 * 				"visible": function() {
					var item = this;
 * 					var user = item.user;
 * 					if (user.get("state") === "Untouched") return true;
 * 					return false;
 * 				}
 * 			}]
 * 		}]
 * 	});
 */
plugin.labels = {
	/**
	 * @echo_label
	 */
	"markProcessing": "Adding {type} {marker}...",
	/**
	 * @echo_label
	 */
	"unmarkProcessing": "Removing {type} {marker}..."
};

plugin.methods._assembleButton = function(action, control) {
	var self = this;
	var type = control.marker ? "marker" : "tag";
	var marker = (control.marker || control.tag);
	var name = action + "As" + Echo.Utils.capitalize(marker.replace(/[^a-z0-9_-]/ig, ''));
	var callback = function() {
		var item = this;
		var operation = action.toLowerCase();
		item.get("buttons." + plugin.name + "." + name + ".element")
			.empty()
			.append(self.labels.get(operation + "Processing", {"type": type, "marker": marker}));
		var verb = type === "tag" ? operation.replace(/mark/g, "tag") : operation;
		var activity = {
			"verbs": ["http://activitystrea.ms/schema/1.0/" + verb],
			"targets": [{"id": item.get("data.object.id")}],
			"object": {
				"objectTypes": [
					"http://activitystrea.ms/schema/1.0/" + type
				],
				"content": marker
			}
		};
		var publishCompleteEvent = self._prepareCompleteEventPublish({
			"name": name,
			"type": type,
			"action": action
		});
		Echo.StreamServer.API.request({
			"endpoint": "submit",
			"secure": this.config.get("useSecureAPI", false, true),
			"submissionProxyURL": item.config.get("submissionProxyURL"),
			"onData": function(response) {
				/**
				* @event onMarkComplete
				* @echo_event Echo.StreamServer.Controls.Stream.Item.Plugins.MetadataManager.onMarkComplete
				* Triggered when the Mark action is finished.
				*/
				/**
				* @event onUnmarkComplete
				* @echo_event Echo.StreamServer.Controls.Stream.Item.Plugins.MetadataManager.onUnmarComplete
				* Triggered when the Unmark action is finished.
				*/
				publishCompleteEvent("Complete", response);
				self.requestDataRefresh();
			},
			"onError": function(response) {
				/**
				* @event onMarkError
				* @echo_event Echo.StreamServer.Controls.Stream.Item.Plugins.MetadataManager.onMarkError
				* Triggered when the Mark action completed with error.
				*/
				/**
				* @event onUnmarkError
				* @echo_event Echo.StreamServer.Controls.Stream.Item.Plugins.MetadataManager.onUnmarError
				* Triggered when the Unmark action completed with error.
				*/
				publishCompleteEvent("Error", response);
			},
			"data": {
				"appkey": item.config.get("appkey"),
				"content": activity,
				"target-query": item.config.get("parent.query", ""),
				"sessionID": item.user.get("sessionID", "")
			}
		}).send();
	};
	return function() {
		var item = this;
		return {
			"name": name,
			"label": control["label" + action],
			"visible": self._isButtonVisible(control, marker, action, type),
			"once": true,
			"callback": callback
		};
	};
};

plugin.methods._prepareCompleteEventPublish = function(args) {
	var self = this;
	var item = this.component;
	var publishArgs = {
		"data": {
			"item": {
				"data": item.get("data"),
				"target": item.get("view.content")
			},
			"type": args.type,
			"name": args.name
		}
	};
	return function(state, response) {
		self.events.publish(
			$.extend(true, publishArgs, {
				"topic": "on" + args.action + state,
				"data": {
					"response": response
				}
			})
		);
	};
};

plugin.methods._isButtonVisible = function(control, marker, action, type) {
	var item = this.component;
	var visible = (!~$.inArray(marker, item.get("data.object." + type + "s") || [])) ^ (action === "Unmark");
	if (!visible || !item.user.is("logged")) return false;
	if (item.user.is("admin")) return true;
	var customProxyURL = item.config.get("submissionProxyURL");
	if (type === "marker" && !customProxyURL) return false;
	control.visible = item.invoke(control.visible);
	if ($.isEmptyObject(control.visible)) return false;
	var isVisible = true;
	$.each(["state", "roles", "markers"], function(i, field) {
		var values = control.visible["user." + field];
		if (values) {
			values = typeof values === "string" ? [values] : values;
			if (!item.user.any(field, values)) {
				isVisible = false;
				return false; // break
			}
		}
	});
	return !!isVisible;
};

Echo.Plugin.create(plugin);

})(Echo.jQuery);
