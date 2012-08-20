(function() {

var plugin = Echo.Plugin.manifest("SocialChatterEvent", "Echo.StreamServer.Controls.Stream.Item");

if (Echo.Plugin.isDefined(plugin)) return;

plugin.config = {
	"dateFormat": "yy-mm-dd",
	"timeFormat": "hh:mm tt",
	"ampm": true
};

plugin.init = function() {
	this.component.config.get("target").addClass(this.cssPrefix + "SocialChatterEvent");
	this.event = new Echo.SocialChatterEvent(this.component.get("data.object.content"));
	this.extendTemplate("insertAfter", "authorName", plugin.templates.main);
	this.component.addButtonSpec("SocialChatterEvent", this._assembleButton());
};

plugin.events = {
	"internal.Echo.StreamServer.Controls.Stream.Item.onDelete": function(topic, args) {
		this.publish("SocialChatter.onEventDelete", args);
	}
};

plugin.labels = {
	"unknown": "Unknown",
	"notProvided": "Not provided",
	"onAirEventOpen": "View Current Session",
	"upcomingEventOpen": "View this Upcoming Chat",
	"passedEventOpen": "View this Chat Archive",
	"eventName": "<b>Event title</b>",
	"eventStatus": "<b>Event status</b>",
	"upcoming": "upcoming event",
	"onAir": "<span class=\"echo-event-onair-label\">on air now!</span>",
	"passed": "passed event",
	"vipName": "<b>VIP guest name</b>",
	"vipInstructions": "<b>Instructions for VIP guest <small>(for Green Room tab)</small></b>",
	"eventDescription": "<b>Event description</b>",
	"eventDuration": "<b>Event duration</b>",
	"eventStart": "<b>Start date and time</b> <small>(in your timezone)</small>",
	"eventEnd": "<b>End date and time</b> <small>(in your timezone)</small>",
	"createdBy": "<b>Created by</b>",
	"creationDate": "<b>Creation date</b>",
	"viewFullEvent": "Show event details",
	"viewBriefEvent": "Hide event details"
};

plugin.templates.main = '<div class="{plugin.class:eventContainer}">' +
		'<div class="{plugin.class:eventBrief}">' +
			'<div class="{plugin.class:eventNameBrief}"></div>' +
			'<div class="{plugin.class:eventDescriptionBrief}"></div>' +
			'<div class="{plugin.class:eventStatus}"></div>' +
		'</div>' +
		'<div class="{plugin.class:eventFull}">' +
			'<div class="{plugin.class:eventInfo}">' +
				'<div class="{plugin.class:eventItem}">' +
					'<span class="{plugin.class:eventName}"></span>' +
				'</div>' +
				'<div class="{plugin.class:eventItem}">' +
					'<span class="{plugin.class:eventStatus}"></span>' +
				'</div>' +
				'<div class="{plugin.class:eventItem}">' +
					'<span class="{plugin.class:vipName}"></span>' +
				'</div>' +
				'<div class="{plugin.class:eventItem}">' +
					'<span class="{plugin.class:eventDescription}"></span>' +
				'</div>' +
				'<div class="{plugin.class:eventItem}">' +
					'<span class="{plugin.class:eventDuration}"></span>' +
				'</div>' +
				'<div class="{plugin.class:eventItem}">' +
					'<span class="{plugin.class:eventStart}"></span>' +
				'</div>' +
				'<div class="{plugin.class:eventItem}">' +
					'<span class="{plugin.class:eventEnd}"></span>' +
				'</div>' +
				'<div class="{plugin.class:eventItem}">' +
					'<span class="{plugin.class:eventCreatedBy}"></span>' +
				'</div>' +
				'<div class="{plugin.class:eventItem}">' +
					'<span class="{plugin.class:eventCreationDate}"></span>' +
				'</div>' +
				'<div class="{plugin.class:eventItem}">' +
					'<span class="{plugin.class:vipInstructions}"></span>' +
				'</div>' +
			'</div>' +
		'</div>' +
		'<div class="{plugin.class:eventButtonContainer}">' +
			'<button class="{plugin.class:eventButton}"></button>' +
		'</div>' +
	'</div>';

plugin.fields = ["eventName", "vipName", "vipInstructions", "vipPhoto", "eventDescription", "eventStart", "eventEnd"];

plugin.renderers.eventBrief = function(element) {
	return this.get("eventDisplay", "brief") === "full"
		? element.hide()
		: element.show();
};

plugin.renderers.eventFull = function(element) {
	return this.get("eventDisplay", "brief") === "full"
		? element.show()
		: element.hide();
};

Echo.Utils.foldl(plugin.renderers, ["eventName", "vipName", "eventStart", "eventEnd", "eventDescription"], function(field, acc) {
	acc[field] = function(element) {
		var event = this.event;
		if (field === "eventStart" || field === "eventEnd") {
			element.html(this.labels.get(field) + ": " + this._getFullDate(event.data[field]));
		} else {
			var prefix = this.labels.get(field) !== field
				? this.labels.get(field) + ": "
				: "";
			element.html(prefix + (event.data[field] || this.labels.get("unknown")));
		}
		return element;
	};
});

plugin.renderers.eventStatus = function(element) {
	var event = this.event;
	var status = event.getEventStatus();
	var content = this.labels.get("eventStatus") + ": " + this.labels.get(status);
	var extra;
	if (status == "upcoming") {
		extra = event.calcAnotherStartEvent();
	} else if (status == "passed") {
		extra = event.calcEndEvent();
	}
	if (extra)
		content += ". " + extra + ".";
	return element.html(content);
};

plugin.renderers.eventDuration = function(element) {
	var duration = this.event.getEventDuration();
	return element.html(this.labels.get("eventDuration") + ": " + this.event.displayDateDiff(duration, function(diff, period) {
		return diff + " " + period + (diff == 1 ? "" : "s");
	}));
};

plugin.renderers.eventCreatedBy = function(element) {
	return element.html(this.labels.get("createdBy") + ": " + this.component.get("data.actor.title"));
};

plugin.renderers.eventNameBrief = function(element) {
	return element.html(this.event.data.eventName || this.labels.get("unknown"));
};

plugin.renderers.eventDescriptionBrief = function(element) {
	return element.html(this.event.data.eventName || this.labels.get("unknown"));
};

plugin.renderers.eventCreationDate = function(element) {
	this.component._calcAge();
	return element.html(this.labels.get("creationDate") + ": " + this.component.get("age"));
};

plugin.renderers.vipInstructions = function(element) {
	return element.html(this.labels.get("vipInstructions") + ": " + (this.event.data.vipInstructions || this.labels.get("notProvided")));
};

plugin.renderers.eventButton = function(element) {
	if ($.isEmptyObject(this.event)) {
		return element.detach();
	}
	var self = this;
	new Echo.Button(element, {
		"label": this.labels.get(this.event.getEventStatus() + "EventOpen")
	});
	return element.click(function() {
		self.events.publish({
			"topic": "onBeforeEventOpen",
			"data": {
				"event": self.component.get("data")
			}
		});
	});
};

plugin.component.renderers.footer = function(element) {
	this.parentRenderer("footer", arguments);
	if (!this.component.user.is("admin") || this.component.user.any("role", ["vip"])) {
		element.hide();
	}
	return element;
};

plugin.component.renderers.avatar = function() {
	var item = this.component;
	var content = new Echo.SocialChatterEvent(item.get("data.object.content"));
	var initialAvatar = item.get("data.actor.avatar");
	var defaultAvatar = item.user.get("defaultAvatar");
	// re-define default avatar for the item
	this.component.user.set("defaultAvatar", "//cdn.echoenabled.com/clientapps/v2/social-chatter/images/vip.jpg");
	if (!$.isEmptyObject(content)) {
		item.set("data.actor.avatar", content.data.vipPhoto);
	}
	var element = this.parentRenderer("avatar", arguments);
	item.set("data.actor.avatar", initialAvatar);
	// reset default avatar
	this.component.user.set("defaultAvatar", defaultAvatar);
	return element;
};

plugin.component.renderers.authorName = plugin.component.renderers.body = function(element) {
	return element.remove();
};

plugin.methods._getFullDate = function(timestamp) {
	var d = new Date(timestamp);
	var date = {
		"h": d.getHours(),
		"i": d.getMinutes(),
		"d": d.getDate(),
		"m": d.getMonth() + 1,
		"yyyy": d.getFullYear()
	};
	date.dd = (date.d < 10 ? '0' : '') + date.d;
	date.mm = (date.m < 10 ? '0' : '') + date.m;
	date.ii = (date.i < 10 ? '0' : '') + date.i;
	date.hh = (date.h < 10 ? '0' : '') + date.h;

	return timestamp ? date.mm + "/" + date.dd + "/" + date.yyyy + " " +date.hh + ":" + date.ii : this.labels.get("unknown");
};

plugin.methods._assembleButton = function() {
	var self = this;
	return function() {
		var item = this;
		var action = "ToggleEventDetails";
		return {
			"name": action,
			"label": self.get("eventDisplay", "brief") === "brief"
				? self.labels.get("viewFullEvent")
				: self.labels.get("viewBriefEvent"),
			"visible": item.user.is("admin"),
			"callback": function() {
				var type = self.get("eventDisplay", "brief");
				self.set("eventDisplay", type === "brief" ? "full" : "brief");
				item.get("buttons." + plugin.name + "." + action + ".element")
					.empty()
					.append(
						self.get("eventDisplay", "brief") === "brief"
							? self.labels.get("viewFullEvent")
							: self.labels.get("viewBriefEvent")
					);
				$.map(["eventBrief", "eventFull"], function(type) {
					self.dom.render({
						"name": type,
						"recursive": true
					});
				});
			}
		};
	};
};

plugin.css =
	'.{plugin.class:eventItem} { margin: 5px 0px; }' +
	'.{plugin.class:eventContainer} { float: left; }' +
	'.echo-streamserver-controls-stream-SocialChatterEvent .{plugin.class:avatar}-wrapper { margin-top: 7px; }' +
	'.{plugin.class:eventButtonContainer} { padding: 15px 0 15px 0px; text-align: left; }' +
	'.{plugin.class:eventBrief} { padding: 5px 0 5px 0px; }' +
	'.{plugin.class:eventNameBrief} { font-size: 20px; font-weight: bold; }' +
	'.{plugin.class:eventDescriptionBrief} { font-size: 14px; margin: 10px 0px; }' +
	'.echo-products-socialchatter-view-eventsStream .{plugin.class:avatar}, .echo-products-socialchatter-view-eventsStream .{plugin.class:avatar} img { height: auto !important; }' +
	'.echo-products-socialchatter-view-eventsStream .{plugin.class:modeSwitch}, .echo-products-socialchatter-view-eventsStream .{plugin.class:status} { display: none !important; }' +
	'.echo-products-socialchatter-view-eventsStream .{plugin.class:subcontainer} { margin-left: 10px; }' +
	'.echo-event-onair-label { color: green; font-weight: bold; }';

Echo.Plugin.create(plugin);

})();
(function() {

var plugin = Echo.Plugin.manifest("SocialChatterEvent", "Echo.StreamServer.Controls.Submit");

if (Echo.Plugin.isDefined(plugin)) return;

plugin.config = {
	"dateFormat": "yy-mm-dd",
	"timeFormat": "hh:mm tt",
	"ampm": true
};

plugin.init = function() {
	this.component.config.get("target").addClass(this.cssPrefix + "SocialChatterEvent");
	this.extendTemplate("insertAfter", "header", plugin.templates.AdminNotice);
	this.extendTemplate("insertAfter", "text", plugin.templates.Metadata);
	this.extendTemplate("insertBefore", "body", plugin.templates.EventIcon);
	this._postAction();
};

plugin.labels = {
	"errorLoadingImageURL": "Error loading image URL",
	"eventTitle": "Event title",
	"VIPGuestName": "VIP guest name",
	"photoURL": "VIP/Event photo URL",
	"eventNameHint": "Type event name",
	"vipNameHint": "Type vip name",
	"vipPhotoHint": "Type vip photo url",
	"vipInstructionsHint": "Type instructions for your VIP guest. Instructions will be displayed as a note in the \"Green Room\" tab",
	"eventDescriptionHint": "Type event description",
	"eventStartHint": "Type event start date",
	"eventEndHint": "Type event end date",
	"changeEventIcon": "change icon",
	"vipInstructions": "<b>Instructions for VIP guest <small>(for Green Room tab)</small></b>",
	"eventDescription": "<b>Event description</b>",
	"eventStart": "<b>Start date and time</b> <small>(in your timezone)</small>",
	"eventEnd": "<b>End date and time</b> <small>(in your timezone)</small>",
	"eventSubmitNotice": "<b>Notes for administrators:</b> <div style=\"text-align: left; padding-left: 40px;\"><div style=\"margin: 10px 0 10px 0;\">1. fields marked with <span class=\"echo-submit-event-field-mandatory\">*</span> are mandatory</div><div style=\"margin-bottom: 10px;\">2. there might be multiple instances of passed and upcoming events, but only <b>one on air</b> event at a time. Please make sure that there are no time overlaps in events scheduling. Learn more about the Social Chatter application <a href='http://wiki.aboutecho.com/Echo%20Application%20-%20Echo%20Social%20Chatter' target='_blank'>here</a>.</div></ul>"
};

plugin.templates.AdminNotice = '<div class="{plugin.class:eventSubmitNotice}"></div>';

plugin.templates.EventIcon =
	'<div class="{plugin.class:eventIconContainer}">' +
		'<img class="{plugin.class:eventIcon}" src="//cdn.echoenabled.com/clientapps/v2/social-chatter/images/vip.jpg">' +
		'<div class="{plugin.class:eventIconError}">{plugin.label:errorLoadingImage}</div>' +
		'<div class="{plugin.class:changeEventIcon} echo-linkColor echo-clickable"></div>' +
	'</div>';

plugin.templates.Metadata =
	'<div class="{plugin.class:metadata-container}">' +
		'<div class="{plugin.class:field-title}">{plugin.label:eventTitle} <span class="{plugin.class:field-mandatory}">*</span></div>' +
		'<div class="{plugin.class:inputContainer} {class:border}">' +
			'<input type="text" class="{plugin.class:eventName} {class:text-input} echo-primaryFont">' +
		'</div>' +
	'</div>' +
	'<div class="{plugin.class:metadata-container}">' +
		'<div class="{class:field-title}">{plugin.label:VIPGuestName} <span class="{plugin.class:field-mandatory}">*</span></div>' +
		'<div class="{plugin.class:inputContainer} {class:border}">' +
			'<input type="text" class="{plugin.class:vipName} {class:text-input} echo-primaryFont">' +
		'</div>' +
	'</div>' +
	'<div class="{plugin.class:metadata-container}">' +
		'<div class="{class:field-title}">{plugin.label:photoURL}</div>' +
		'<div class="{plugin.class:inputContainer} {class:border}">' +
			'<input type="text" class="{plugin.class:vipPhoto} {class:text-input} echo-primaryFont">' +
		'</div>' +
	'</div>' +
	'<div class="{plugin.class:metadata-container}">' +
		'<div class="{class:field-title}">{plugin.label:eventStart} <span class="{plugin.class:field-mandatory">*</span></div>' +
		'<div class="{plugin.class:inputContainer} {class:border}">' +
			'<input type="text" class="{plugin.class:eventDateStart} {class:text-input} echo-primaryFont">' +
			'<i class="icon-th"></i>' +
			'<input type="text" class="{plugin.class:eventTimeStart} {class:text-input} echo-primaryFont">' +
			'<i class="icon-time"></i>' +
		'</div>' +
	'</div>' +
	'<div class="{plugin.class:metadata-container}">' +
		'<div class="{plugin.class:field-title}">{plugin.label:eventEnd} <span class="{plugin.class:field-mandatory}">*</span></div>' +
		'<div class="{plugin.class:inputContainer} {class:border}">' +
			'<input type="text" class="{plugin.class:eventDateEnd} {class:text-input} echo-primaryFont">' +
			'<i class="icon-th"></i>' +
			'<input type="text" class="{plugin.class:eventTimeEnd} {class:text-input} echo-primaryFont">' +
			'<i class="icon-time"></i>' +
		'</div>' +
	'</div>' +
	'<div class="{plugin.class:metadata-container}">' +
		'<div class="{plugin.class:field-title}">{plugin.label:eventDescription}</div>' +
		'<div class="{plugin.class:inputContainer} {class:border}">' +
			'<textarea class="{plugin.class:eventDescription} {class:text-area} echo-primaryFont"></textarea>' +
		'</div>' +
	'</div>' +
	'<div class="{plugin.class:metadata-container}">' +
		'<div class="{plugin.class:field-title}">{plugin.label:vipInstructions}</div>' +
		'<div class="{plugin.class:inputContainer} {class:border}">' +
			'<textarea class="{plugin.class:vipInstructions} {class:text-area} echo-primaryFont"></textarea>' +
		'</div>' +
	'</div>';

plugin.fields = ["eventName", "vipName", "vipInstructions", "vipPhoto",	"eventDescription",
	"eventDateStart", "eventTimeStart", "eventDateEnd", "eventTimeEnd"];

plugin.events = {
	"Echo.StreamServer.Controls.Submit.onPostComplete": function(topic, args) {
		var component = this.component;
		$.map(plugin.fields, function(field) {
			component.dom.render({"name": field});
		});
	}
};

plugin.mandatoryFields = ["eventName", "vipName", "eventStart", "eventEnd"];

$.extend(plugin.events,
	Echo.Utils.foldl({}, ["Post", "Edit"], function(action, acc) {
		acc["Echo.StreamServer.Controls.Submit.on" + action + "Init"] = function(topic, args) {
			var self = this;
			var postType = this.config.get("parent.type", this.component._getASURL("comment"));
			args.postData.content = [
				this.component._getActivity("post", postType, Echo.Utils.object2JSON(this._assembleContent()))
			];
		};
	})
);

plugin.renderers.changeEventIcon = function(element) {
	var self = this;
	return element.text(this.labels.get("changeEventIcon")).click(function() {
			self.dom.get("vipPhoto").focus().select();
		});
};

plugin.component.renderers.text = function(element) {
	var event = new Echo.SocialChatterEvent(this.component.get("data.object.content"));
	if ($.isEmptyObject(event)) {
		return this.parentRenderer("text", arguments);
	}
	// we need to put some value into textarea
	// to satisfy submission code requirements,
	// this value would be re-written by the plugin later
	return element.val(".").detach();
};

//plugin.renderers.eventInfo = function(element, extra) {
//	extra = extra || {};
//	var type = extra.type;
//	var event = new Echo.SocialChatterEvent(this.component.get("data.object.content"));
//	var value = event.data && event.data[type] && (type == "eventStart" || type == "eventEnd")
//		? this._getFullDate(event.data[type])
//		: event.data[type] || "";
//	if (!$.isEmptyObject(event)) {
//		this.dom.get(type)
//			.iHint({
//				"text": this.labels.get(type + "Hint"),
//				"className": "echo-secondaryColor"
//			})
//			.val($.trim(Echo.Utils.stripTags(value || "")))
//			.blur();
//	} else {
//		this.dom.get(type).detach();
//	}
//	return element;
//};

plugin.renderers.eventSubmitNotice = function(element) {
	return element.html('<span>' + this.labels.get("eventSubmitNotice") + '</span>');
};

$.map(["eventDateStart", "eventDateEnd" ,"eventTimeStart", "eventTimeEnd"], function(field) {

	var toMillisecond = function(hours, minutes, seconds) {
		hours = hours || 0;
		minutes = minutes || 0;
		seconds = seconds || 0;
		return (seconds + 60 * minutes + 60 * 60 * hours) * 1000;
	};

	var formatDatetime = function(timestasmp) {
		var dateObj = timestasmp ? new Date(timestasmp) : new Date();
		var date = {
			"h": dateObj.getHours(),
			"i": dateObj.getMinutes(),
			"d": dateObj.getDate(),
			"m": dateObj.getMonth() + 1,
			"yyyy": dateObj.getFullYear()
		};
		date.dd = (date.d < 10 ? '0' : '') + date.d;
		date.mm = (date.m < 10 ? '0' : '') + date.m;
		date.ii = (date.i < 10 ? '0' : '') + date.i;
		date.hh = (date.h < 10 ? '0' : '') + date.h;
		return {
			"time": date.hh + ":" + date.ii,
			"date": date.mm + "/" + date.dd + "/" + date.yyyy
		};
	};

	plugin.renderers[field] = function(element) {
		var self = this;
		this.dom.render({"name": "eventInfo", "extra": {"type": field}});
		var event = new Echo.SocialChatterEvent(this.component.get("data.object.content"));
		var normField = field.replace(/(time)|(date)/i, "");

		var checkDateInterval = function() {
			var start = self.get("eventsTimestamp.eventStart");
			var end = self.get("eventsTimestamp.eventEnd");
			if (start > end) {
				var datetime = formatDatetime(start);
				self.dom.get("eventDateEnd").val(datetime.date);
				self.dom.get("eventTimeEnd").val(datetime.time);
			}
		};

		var defaultDate;
		if (event.data[normField]) {
			defaultDate = new Date(event.data[normField]);
			this.set("eventsTimestamp." + normField, event.data[normField]);
		} else {
			defaultDate = new Date();
			this.set("eventsTimestamp." + normField, defaultDate.valueOf());
		}

		var time = toMillisecond(defaultDate.getHours(), defaultDate.getMinutes());
		self.set("eventsTime." + normField, time);
		self.set("eventsDate." + normField, defaultDate.valueOf() - time);

		var datetime = formatDatetime(defaultDate);

		if (field === "eventDateStart" || field === "eventDateEnd") {
			element.val(datetime.date)
				.datepicker()
				.on("changeDate", function(ev) {
					self.set("eventsDate." + normField, ev.date.valueOf());
					self.set("eventsTimestamp." + normField, self.get("eventsTime." + normField) + self.get("eventsDate." + normField));
					checkDateInterval();
				}).on("change", function() {
					console.log("change");
					checkDateInterval();
				});
		} else {
			element.val(datetime.time).timepicker({
				"minuteStep": 1,
				"secondStep": 5,
				"showInputs": false,
				"showMeridian": false,
				"defaultTime": "value"
			}).on("change", function() {
					var time = $(this).val();
					var timeArray = time.split(':');
					var hour = parseInt(timeArray[0], 10) || 0;
					var minute = parseInt(timeArray[1], 10) || 0;

					if (hour > 23) {
						hour = 23;
					} else if (hour < 0) {
						hour = 0;
					}

					if (minute < 0) {
						minute = 0;
					} else if (minute > 59) {
						minute = 59;
					}
					var millisecond = toMillisecond(hour, minute);
					self.set("eventsTime." + normField, millisecond);
					self.set("eventsTimestamp." + normField, self.get("eventsTime." + normField) + self.get("eventsDate." + normField));
					checkDateInterval();
			});
		}
		return element;
	};
});

$.map(plugin.fields, function(field) {
	plugin.renderers[field] = plugin.renderers[field] || function(element) {
		var self = this;
		this.dom.render({"name": "eventInfo", "extra": {"type": field}});
		// exclusion for "vipPhoto" element name
		if (field === "vipPhoto") {
			var content = this.component.get("data.object.content");
			if (content) {
				var event = new Echo.SocialChatterEvent(content);
				if (event.data.vipPhoto) {
					this.dom.get("eventIcon").attr("src", event.data.vipPhoto);
				}
			}
			element.focus(function() {
				self.dom.get("eventIconError").hide();
				element.parent().removeClass("echo-input-error");
			}).blur(function() {
				var _element = $(this);
				if (_element.val()) {
					self.dom.get("eventIcon")
						.attr("src", _element.val())
						.one("error", function() {
							element.parent().addClass("echo-input-error");
							self.dom.get("eventIconError").show();
							self.dom.get("eventIcon")
								.attr("src", "//cdn.echoenabled.com/clientapps/v2/social-chatter/images/vip.jpg");
						});
				}
			})
		}
	};
});

plugin.methods._assembleContent = function() {
	var self = this;
	return Echo.Utils.foldl({}, plugin.fields, function(name, acc) {
		if (name == "eventStart" || name == "eventEnd") {
			acc[name] = self.get("eventsTimestamp." + name);
			return;
		}
		acc[name] = self.dom.get(name).val();
	});
};

plugin.methods._postAction = function() {
	var component = this.component;
	component.posting = component.posting || {};
	component.posting.action = function() {
		var highlighted;
		$.map(plugin.mandatoryFields, function(v) {
			var element = component.dom.get(v);
			highlighted = component.highlightMandatory(element);
			return !highlighted;
		});
		if (highlighted) return;
		component.post();
	}
};

//plugin.methods._getFullDate = function(timestamp) {
//	var d = new Date(timestamp);
//	return (timestamp
//		? $.datepicker.formatDate(this.config.get("dateFormat"), d)
//		+ " " + $.datepicker.formatTime(this.config.get("timeFormat"),  {
//			"hour": d.getHours(),
//			"minute": d.getMinutes(),
//			"second": d.getSeconds(),
//			"millisec": d.getMilliseconds()
//		}, {
//			"ampm": this.config.get("ampm")
//		})
//		: this.labels.get("unknown"));
//};

plugin.css =
	'.ui-timepicker-div .ui-widget-header { margin-bottom: 8px; }' +
	'.ui-timepicker-div dl { text-align: left; }' +
	'.ui-timepicker-div dl dt { height: 25px; margin-bottom: -25px; }' +
	'.ui-timepicker-div dl dd { margin: 0 10px 10px 65px; }' +
	'.ui-timepicker-div td { font-size: 90%; }' +
	'.ui-tpicker-grid-label { background: none; border: none; margin: 0; padding: 0; }' +
	'.{plugin.class:SocialChatterEvent} .{class:content} { border: 0px; }' +
	'.{plugin.class:SocialChatterEvent} .{class:post-container} { float: left; margin: 0px 15px 0px 5px; }' +
	'.{plugin.class:SocialChatterEvent} .{class:cancelButton-container} { float: left; }' +
	'.{plugin.class:SocialChatterEvent} .echo-input-error { border: 1px solid red; }' +
	'.{plugin.class:SocialChatterEvent} .{plugin.class:eventIconError} { display: none; color: red; font-size: 12px; margin: 10px 0px; text-align: center; }' +
	'.{plugin.class:SocialChatterEvent} .{plugin.class:eventIconContainer} { text-align: center; width: 175px; float: left; margin-right: 20px; }' +
	'.{plugin.class:SocialChatterEvent} .{plugin.class:eventIconContainer} img { margin: 20px 0px 10px 0px; max-width: 120px; }' +
	'.{plugin.class:SocialChatterEvent} .{plugin.class:changeEventIcon} { text-align: center; }' +
	'.{plugin.class:SocialChatterEvent} .{class:body} { float: left; }' +
	'.{plugin.class:SocialChatterEvent} .{class:controls} { clear: both; margin-left: 195px; margin-bottom: 15px; }' +
	'.{plugin.class:SocialChatterEvent} .{class:body} { margin-right: 20px; }' +
	'.{plugin.class:field-title} { font-size: 14px; font-weight: bold; margin-bottom: 5px; }' +
	'.{plugin.class:eventSubmitNotice} { background-color: #D9EDF7; border: 1px solid #BCE8F1; border-radius: 4px 4px 4px 4px; color: #3A87AD;  padding: 15px; text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5); font-size: 14px; line-height: 16px; text-align: center; }' +
	'.{plugin.class:eventSubmitNotice} a { color: #3A87AD; cursor: pointer; text-decoration: underline; }' +
	'.{plugin.class:field-mandatory} { color: red; font-weight: bold; }' +
	'.{plugin.class:inputContainer} { margin-bottom: 15px; width: 300px; padding: 5px; }' +
	'.{plugin.class:inputContainer} .icon-time { margin: -4px 0 0 -22.5px; pointer-events: none; position: relative; }' +
	'.{plugin.class:inputContainer} .icon-th { margin: -4px 0 0 -22.5px; pointer-events: none; position: relative; }' +
	'.{plugin.class:eventTimeStart}, .{plugin.class:eventTimeEnd} { width: 90px; margin-left: 20px; }' +
	'.{plugin.class:eventDateStart}, .{plugin.class:eventDateEnd} { width: 100px; }';

Echo.Plugin.create(plugin);

})();
