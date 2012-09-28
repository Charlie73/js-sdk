Ext.data.JsonP.how_to_develop_control({
  "guide": "<h1>How to develop a control</h1>\n<div class='toc'>\n<p><strong>Contents</strong></p>\n<ol>\n<li><a href='#!/guide/how_to_develop_control-section-1'>Introduction</a></li>\n<li><a href='#!/guide/how_to_develop_control-section-2'>Creating the control skeleton</a></li>\n<li><a href='#!/guide/how_to_develop_control-section-3'>Control init function</a></li>\n<li><a href='#!/guide/how_to_develop_control-section-4'>Control configuration</a></li>\n<li><a href='#!/guide/how_to_develop_control-section-5'>Defining control template</a></li>\n<li><a href='#!/guide/how_to_develop_control-section-6'>Adding helper methods</a></li>\n<li><a href='#!/guide/how_to_develop_control-section-7'>Control installation</a></li>\n<li><a href='#!/guide/how_to_develop_control-section-8'>Complete control source code</a></li>\n<li><a href='#!/guide/how_to_develop_control-section-9'>Features which aren't described in this guide</a></li>\n<li><a href='#!/guide/how_to_develop_control-section-10'>More examples</a></li>\n</ol>\n</div>\n\n<p>Echo JS SDK provides the ability to package a certain set of the discrete functionality allows into a JavaScript class which is called the <em>Control</em> in the SDK terminology. This page will guide you through the steps of custom control creation.</p>\n\n<h2 id='how_to_develop_control-section-1'>Introduction</h2>\n\n<p>Let's imagine that we want to create the control for displaying a number of items matching the specified query.</p>\n\n<h2 id='how_to_develop_control-section-2'>Creating the control skeleton</h2>\n\n<p>First of all, let's prepare the JavaScript closure to allocate a separate namespace for our control's code. This step is common for all controls. You can find the detailed information on how to create the JS closure in the <a href=\"#!/guide/terminology-section-3\">\"Terminology and dev tips\" guide</a>. So we have the following code as a starting point:</p>\n\n<pre class='inline-example '><code>(function(jQuery) {\n\"use strict\";\n\nvar $ = jQuery;\n\n// component code goes here\n\n})(Echo.jQuery);\n</code></pre>\n\n<p>Now let's add the control definition. Echo JS SDK contains a special <a href=\"#!/api/Echo.Control\">Echo.Control</a> class to facilitate the control creation, we'll use some functions to add the control definition:</p>\n\n<pre class='inline-example '><code>(function(jQuery) {\n\"use strict\";\n\nvar $ = jQuery;\n\nvar counter = <a href=\"#!/api/Echo.Control-static-method-manifest\" rel=\"Echo.Control-static-method-manifest\" class=\"docClass\">Echo.Control.manifest</a>(\"<a href=\"#!/api/Echo.StreamServer.Controls.Counter\" rel=\"Echo.StreamServer.Controls.Counter\" class=\"docClass\">Echo.StreamServer.Controls.Counter</a>\");\n\nif (<a href=\"#!/api/Echo.Control-static-method-isDefined\" rel=\"Echo.Control-static-method-isDefined\" class=\"docClass\">Echo.Control.isDefined</a>(counter)) return;\n\n<a href=\"#!/api/Echo.Control-static-method-create\" rel=\"Echo.Control-static-method-create\" class=\"docClass\">Echo.Control.create</a>(counter);\n\n})(Echo.jQuery);\n</code></pre>\n\n<p>We called the <a href=\"#!/api/Echo.Control-static-method-manifest\">\"Echo.Control.manifest\"</a> function and passed the name of the control as an argument. We checked whether the control was already initialized or not, to avoid multiple control re-definitions in case the control script was included into the page source several times. After that we passed the manifest generated into the <a href=\"#!/api/Echo.Control-static-method-create\">Echo.Control.create</a> function to generate the control JS class out of the static manifest declaration.</p>\n\n<p>At that point we can consider the control skeleton ready and start adding the business logic into it.</p>\n\n<h2 id='how_to_develop_control-section-3'>Control init function</h2>\n\n<p>There are 2 possible scenarios of our control initialization:</p>\n\n<ul>\n<li><p>when there is no data available and we need to make an API call to get it</p></li>\n<li><p>when the data is here and we just need to render it (it's usually the case when we count the items which were already delivered to the client side or we request the data during another API call, for example by making a \"mux\" request)</p></li>\n</ul>\n\n\n<p>In order to fulfill both use-cases we need to add the corresponding check into the control initialization function, for example as shown below:</p>\n\n<pre class='inline-example '><code>(function(jQuery) {\n\"use strict\";\n\nvar $ = jQuery;\n\nvar counter = <a href=\"#!/api/Echo.Control-static-method-manifest\" rel=\"Echo.Control-static-method-manifest\" class=\"docClass\">Echo.Control.manifest</a>(\"<a href=\"#!/api/Echo.StreamServer.Controls.Counter\" rel=\"Echo.StreamServer.Controls.Counter\" class=\"docClass\">Echo.StreamServer.Controls.Counter</a>\");\n\nif (<a href=\"#!/api/Echo.Control-static-method-isDefined\" rel=\"Echo.Control-static-method-isDefined\" class=\"docClass\">Echo.Control.isDefined</a>(counter)) return;\n\ncounter.init = function() {\n    // data can be defined explicitly\n    // in this case we do not make API requests\n    if ($.isEmptyObject(this.get(\"data\"))) {\n        this._request();\n    } else {\n        this.render();\n        this.ready();\n    }\n};\n\n<a href=\"#!/api/Echo.Control-static-method-create\" rel=\"Echo.Control-static-method-create\" class=\"docClass\">Echo.Control.create</a>(counter);\n\n})(Echo.jQuery);\n</code></pre>\n\n<p>So, if the data parameter is empty we should fetch it from the server through the <a href=\"#!/api/Echo.StreamServer.API.Request-method-constructor\">\"Echo.StreamServer.API.Request\"</a> class. Definition of the _request method will be described below. Else, if the data parameter is defined, we should <a href=\"#!/api/Echo.Control-method-render\">\"render\"</a> control and call <a href=\"#!/api/Echo.Control-method-ready\">\"ready\"</a> method to detect that control is ready. All functions that defined in the manifest namespace have control context (this variable pointed to control instance) if it this is not described explicit.</p>\n\n<h2 id='how_to_develop_control-section-4'>Control configuration</h2>\n\n<p>Most of controls should contain several configuration parameters that defines a control behavior, state etc. Also we want to define a default value of the parameters in case it is omitted in the control configuration while installing it. In order to do it we add the \"config\" object to the control manifest with the name of the config field as a key and a default as its value, so the code of the control will look like:</p>\n\n<pre class='inline-example '><code>(function(jQuery) {\n\"use strict\";\n\nvar $ = jQuery;\n\nvar counter = <a href=\"#!/api/Echo.Control-static-method-manifest\" rel=\"Echo.Control-static-method-manifest\" class=\"docClass\">Echo.Control.manifest</a>(\"<a href=\"#!/api/Echo.StreamServer.Controls.Counter\" rel=\"Echo.StreamServer.Controls.Counter\" class=\"docClass\">Echo.StreamServer.Controls.Counter</a>\");\n\nif (<a href=\"#!/api/Echo.Control-static-method-isDefined\" rel=\"Echo.Control-static-method-isDefined\" class=\"docClass\">Echo.Control.isDefined</a>(counter)) return;\n\ncounter.init = function() {\n    // data can be defined explicitly\n    // in this case we do not make API requests\n    if ($.isEmptyObject(this.get(\"data\"))) {\n        this._request();\n    } else {\n        this.render();\n        this.ready();\n    }\n};\n\ncounter.config = {\n    \"data\": undefined,\n    \"liveUpdatesTimeout\": 10,\n    \"infoMessages\": {\"layout\": \"compact\"}\n};\n\n<a href=\"#!/api/Echo.Control-static-method-create\" rel=\"Echo.Control-static-method-create\" class=\"docClass\">Echo.Control.create</a>(counter);\n\n})(Echo.jQuery);\n</code></pre>\n\n<p>If we need more options in future, they can be appended as additional fields into the \"config\" hash.\nLet's describe config parameters:</p>\n\n<ul>\n<li>\"data\" defines a default value that used to display items count;</li>\n<li>\"liveUpdatesTimeout\" defines a timeout that used by the <a href=\"#!/api/Echo.StreamServer.API.Request\" rel=\"Echo.StreamServer.API.Request\" class=\"docClass\">Echo.StreamServer.API.Request</a> class for the recurring server request for data;</li>\n<li>\"infoMessages\" defines messages layout for control. This parameter describes in <a href=\"#!/api/Echo.Control-cfg-infoMessages\">\"Echo.Control\"</a></li>\n</ul>\n\n\n<p>Now everywhere in the control's code we'll be able to use the following call:</p>\n\n<pre class='inline-example '><code>this.config.get(\"liveUpdatesTimeout\"); // assuming that \"this\" points to the control instance\n</code></pre>\n\n<p>to get the value of the \"liveUpdatesTimeout\" config parameter or any other defined during the control installation or to access the default value otherwise. Note: the \"this\" var should point to the control instance.</p>\n\n<h2 id='how_to_develop_control-section-5'>Defining control template</h2>\n\n<p>Now we can define html template for the control UI. It should be a string value which may contains html elements (DOM structure) and placeholder. According to control initialization this value will be compiled by the <a href=\"#!/api/Echo.Control-method-substitute\">\"Echo.Control.substitute\"</a> method. This method compiles placeholders to the string values.\nThere's two ways for the template defining:</p>\n\n<ul>\n<li>we can pass to the manifest object value \"template\" which is function. This function can prepare a template string and should return it. Returned value will be compiled;</li>\n<li>we can pass a \"templates\" object that can contains a several templates by the \"templates\" object key. By default, if template value is ommited in the manifest, will be used templates.main value;</li>\n</ul>\n\n\n<p>In our case we need a simple template which contains a count items number. Let's put the template into control's code:</p>\n\n<pre class='inline-example '><code>(function(jQuery) {\n\"use strict\";\n\nvar $ = jQuery;\n\nvar counter = <a href=\"#!/api/Echo.Control-static-method-manifest\" rel=\"Echo.Control-static-method-manifest\" class=\"docClass\">Echo.Control.manifest</a>(\"<a href=\"#!/api/Echo.StreamServer.Controls.Counter\" rel=\"Echo.StreamServer.Controls.Counter\" class=\"docClass\">Echo.StreamServer.Controls.Counter</a>\");\n\nif (<a href=\"#!/api/Echo.Control-static-method-isDefined\" rel=\"Echo.Control-static-method-isDefined\" class=\"docClass\">Echo.Control.isDefined</a>(counter)) return;\n\ncounter.init = function() {\n    // data can be defined explicitly\n    // in this case we do not make API requests\n    if ($.isEmptyObject(this.get(\"data\"))) {\n        this._request();\n    } else {\n        this.render();\n        this.ready();\n    }\n};\n\ncounter.config = {\n    \"data\": undefined,\n    \"liveUpdatesTimeout\": 10,\n    \"infoMessages\": {\"layout\": \"compact\"}\n};\n\ncounter.templates.main = \"&lt;span&gt;{data:count}&lt;/span&gt;\";\n\n<a href=\"#!/api/Echo.Control-static-method-create\" rel=\"Echo.Control-static-method-create\" class=\"docClass\">Echo.Control.create</a>(counter);\n\n})(Echo.jQuery);\n</code></pre>\n\n<p>Important note: as you can see, the template contains the placeholder \"{data:count}\". This placeholder will be processed by the template engine (due to \"substitute\" method describes above) before thw template is inserted into control UI. You can find the general description of the rendering engine in the <a href=\"#!/guide/terminology\">\"Terminlogy and dev tips\" guide</a>. In addition to the basic placeholders supported by the rendering engine, the base controls functionality also provides the ability to define the following placeholders:</p>\n\n<ul>\n<li>{class:KEY} - the placeholder will be replaced with the CSS class name + the KEY value</li>\n<li>{label:KEY} - the placeholder to access the corresponding label text using the KEY as a key</li>\n<li>{config:KEY} - the placeholder to access the config value using the KEY as a key</li>\n<li>{self:KEY} - provides the ability to access the control field using the KEY as a key</li>\n</ul>\n\n\n<h2 id='how_to_develop_control-section-6'>Adding helper methods</h2>\n\n<p>Now we can define a helper functions which will be doing some actions. For example: for sending request to the server we should define helper function. There is a special place for the helper functions in the control definition: it's called the \"methods\" object. The method to sending request might look like:</p>\n\n<pre class='inline-example '><code>counter.methods._request = function() {\n    var request = this.get(\"request\");\n    if (!request) {\n        request = Echo.StreamServer.API.request({\n            \"endpoint\": \"count\",\n            \"data\": {\n                \"q\": this.config.get(\"query\"),\n                \"appkey\": this.config.get(\"appkey\")\n            },\n            \"liveUpdatesTimeout\": this.config.get(\"liveUpdatesTimeout\"),\n            \"recurring\": true,\n            \"onError\": $.proxy(this._error, this),\n            \"onData\": $.proxy(this._update, this)\n        });\n        this.set(\"request\", request);\n    }\n    request.send();\n};\n</code></pre>\n\n<p>Few important notes here:</p>\n\n<ul>\n<li><p>we added the underscore before the name of the function to indicate that this function is private and nobody should call it outside the control's code</p></li>\n<li><p>we try to get request object through the <a href=\"#!/api/Echo.Control-method-get\">\"get\"</a> method defined in the <a href=\"#!/api/Echo.Control\" rel=\"Echo.Control\" class=\"docClass\">Echo.Control</a> class. This object should be instantiated from <a href=\"#!/api/Echo.StreamServer.API.Request\" rel=\"Echo.StreamServer.API.Request\" class=\"docClass\">Echo.StreamServer.API.Request</a> class for request items count number. We use a <a href=\"#!/api/Echo.StreamServer.API.Request-static-method-request\">\"static method request\"</a> to instantiating. After request object definition we store it to the internal through the <a href=\"#!/api/Echo.Control-method-set\">\"set\"</a>.</p></li>\n<li><p>the \"_request\" function will be available in the control's code as \"this._request()\", assuming that \"this\" points to the control instance</p></li>\n</ul>\n\n\n<p>As you can see, in the request object definition we defining handlers \"onError\" and \"onData\" which executed by request object. This handlers we can define also through helper methods. \"onData\" event we should compare current count number with responsed count number and reflect it by displaying instead, and \"onError\" we have some cases to reflect it:</p>\n\n<ul>\n<li><p>if \"errorCode\" field of the responsed JSON object equals \"more_than\", then we should displaying it without any extra information such as error indication</p></li>\n<li><p>if we get another \"errorCode\" we can reflect it by the type of error (critical or not) and request type. This request options defined in the <a href=\"#!/api/Echo.API.Transport\">\"Echo.API.Transport\"</a> class.</p></li>\n</ul>\n\n\n<p>Let's try to defining these methods:</p>\n\n<pre class='inline-example '><code>counter.methods._update = function(data) {\n    if ($.isEmptyObject(this.data) || this.data.count != data.count) {\n        this.events.publish({\n            \"topic\": \"onUpdate\",\n            \"data\": {\n                \"data\": data,\n                \"query\": this.config.get(\"query\"),\n                \"target\": this.config.get(\"target\").get(0)\n            }\n        });\n        this.set(\"data\", data);\n        this.render();\n        this.ready();\n    }\n};\n\ncounter.methods._error = function(data, options) {\n    this.events.publish({\n        \"topic\": \"onError\",\n        \"data\": {\n            \"data\": data,\n            \"query\": this.config.get(\"query\"),\n            \"target\": this.config.get(\"target\").get(0)\n        }\n    });\n    if (data.errorCode === \"more_than\") {\n        this.set(\"data.count\", data.errorMessage + \"+\");\n        this.render();\n    } else {\n        if (typeof options.critical === \"undefined\" || options.critical || options.requestType === \"initial\") {\n            this.showMessage({\"type\": \"error\", \"data\": data, \"message\": data.errorMessage});\n        }\n    }\n    this.ready();\n};\n</code></pre>\n\n<p>We passed logic of these methods described below, nothing interest but publishing events. Each control instance has a internal object called \"events\" which is instance of <a href=\"#!/api/Echo.Events\">\"Echo.Events\"</a> class within own auto-defining context. It means that we can publish some events to informate other applications for some actions. We are published events according to request events.</p>\n\n<h2 id='how_to_develop_control-section-7'>Control installation</h2>\n\n<p>In order to install the control, the following steps should be taken:</p>\n\n<ul>\n<li><p>the control script should bw delivired to the client side (for example, using the &lt;script&gt; tag inclusion)</p></li>\n<li><p>the control should be called by the control class using operator \"new\", such as below:</p></li>\n</ul>\n\n\n<p>&nbsp;</p>\n\n<pre class='inline-example '><code>new <a href=\"#!/api/Echo.StreamServer.Controls.Counter\" rel=\"Echo.StreamServer.Controls.Counter\" class=\"docClass\">Echo.StreamServer.Controls.Counter</a>({\n    ...\n    \"liveUpdatesTimeout\": 5,\n    ...\n});\n</code></pre>\n\n<h2 id='how_to_develop_control-section-8'>Complete control source code</h2>\n\n<pre class='inline-example '><code>(function(jQuery) {\n\"use strict\";\n\nvar $ = jQuery;\n\nvar counter = <a href=\"#!/api/Echo.Control-static-method-manifest\" rel=\"Echo.Control-static-method-manifest\" class=\"docClass\">Echo.Control.manifest</a>(\"<a href=\"#!/api/Echo.StreamServer.Controls.Counter\" rel=\"Echo.StreamServer.Controls.Counter\" class=\"docClass\">Echo.StreamServer.Controls.Counter</a>\");\n\nif (<a href=\"#!/api/Echo.Control-static-method-isDefined\" rel=\"Echo.Control-static-method-isDefined\" class=\"docClass\">Echo.Control.isDefined</a>(counter)) return;\n\ncounter.init = function() {\n    // data can be defined explicitly\n    // in this case we do not make API requests\n    if ($.isEmptyObject(this.get(\"data\"))) {\n        this._request();\n    } else {\n        this.render();\n        this.ready();\n    }\n};\n\ncounter.config = {\n    \"data\": undefined,\n    \"liveUpdatesTimeout\": 10,\n    \"infoMessages\": {\"layout\": \"compact\"}\n};\n\ncounter.templates.main = \"&lt;span&gt;{data:count}&lt;/span&gt;\";\n\ncounter.methods._request = function() {\n    var request = this.get(\"request\");\n    if (!request) {\n        request = Echo.StreamServer.API.request({\n            \"endpoint\": \"count\",\n            \"data\": {\n                \"q\": this.config.get(\"query\"),\n                \"appkey\": this.config.get(\"appkey\")\n            },\n            \"liveUpdatesTimeout\": this.config.get(\"liveUpdatesTimeout\"),\n            \"recurring\": true,\n            \"onError\": $.proxy(this._error, this),\n            \"onData\": $.proxy(this._update, this)\n        });\n        this.set(\"request\", request);\n    }\n    request.send();\n};\n\ncounter.methods._update = function(data) {\n    if ($.isEmptyObject(this.data) || this.data.count != data.count) {\n        this.events.publish({\n            \"topic\": \"onUpdate\",\n            \"data\": {\n                \"data\": data,\n                \"query\": this.config.get(\"query\"),\n                \"target\": this.config.get(\"target\").get(0)\n            }\n        });\n        this.set(\"data\", data);\n        this.render();\n        this.ready();\n    }\n};\n\ncounter.methods._error = function(data, options) {\n    this.events.publish({\n        \"topic\": \"onError\",\n        \"data\": {\n            \"data\": data,\n            \"query\": this.config.get(\"query\"),\n            \"target\": this.config.get(\"target\").get(0)\n        }\n    });\n    if (data.errorCode === \"more_than\") {\n        this.set(\"data.count\", data.errorMessage + \"+\");\n        this.render();\n    } else {\n        if (typeof options.critical === \"undefined\" || options.critical || options.requestType === \"initial\") {\n            this.showMessage({\"type\": \"error\", \"data\": data, \"message\": data.errorMessage});\n        }\n    }\n    this.ready();\n};\n\n<a href=\"#!/api/Echo.Control-static-method-create\" rel=\"Echo.Control-static-method-create\" class=\"docClass\">Echo.Control.create</a>(counter);\n\n})(Echo.jQuery);\n</code></pre>\n\n<h2 id='how_to_develop_control-section-9'>Features which aren't described in this guide</h2>\n\n<p>If you look at the <a href=\"#!/api/Echo.Control-static-method-manifest\">\"manifest\"</a> doc you can see that we ommit some manifest fields. It is so because described fields are quite enough for Counter control.</p>\n\n<h3>Events</h3>\n\n<p>Each Echo component is an independent part of the system and can communicate with each other on subscribe-publish basis. One application can subscribe to the expected event and the other application can publish it and the event data will be delivered to the subscribed applications. This model is very similar to the DOM events model when you can add event listener and perform some actions when a certain event is fired. All the events are powered by the <a href=\"#!/api/Echo.Events\">Echo.Events library</a>.</p>\n\n<p>There are lots of events going on during the control and control life. The list of the events for each component can be found on the respective page in the documentation. The control definition structure provides the interface to subscribe to the necessary events. The events subscriptions should be defined inside the \"events\" hash using the event name as a key and the event handler as a value, for example:</p>\n\n<pre class='inline-example '><code>control.events = {\n    \"<a href=\"#!/api/Echo.StreamServer.Controls.Stream-event-onDataReceive\" rel=\"Echo.StreamServer.Controls.Stream-event-onDataReceive\" class=\"docClass\">Echo.StreamServer.Controls.Stream.onDataReceive</a>\": function(topic, args) {\n        // ... some actions ...\n    }\n};\n</code></pre>\n\n<h3>Labels</h3>\n\n<p>The control manifest provides a special location for the labels: it's the \"labels\" hash with the label key as the field name and the label text as a value. So the \"labels\" hash might look like:</p>\n\n<pre class='inline-example '><code>control.labels = {\n    \"someLabel\": \"Some label value\"\n};\n</code></pre>\n\n<p>The label text will be available in the control's code using the following construction:</p>\n\n<pre class='inline-example '><code>this.labels.get(\"someLabel\"); // assuming that \"this\" points to the control instance\n</code></pre>\n\n<h3>CSS rules</h3>\n\n<p>To make the UI look nice, we should add some CSS rules. There is a special placeholder for the CSS rules in the control definition. The field is called \"css\". The value of this field is a CSS string. Here are CSS rules for our control:</p>\n\n<pre class='inline-example '><code>control.css =\n    '.{class:some_class_name} { some-rules; }' +\n    '.{class:some_class_name} { some-rules; }';\n</code></pre>\n\n<p>Note that you can use the same placeholders inside the CSS definition string.</p>\n\n<h3>Renderers</h3>\n\n<p>If you want to execute some action while element renderered, you can use renderers mechanism. Control manifest specifies the location for the renderers, it's the \"renderers\" hash. The renderer for the some element may look like:</p>\n\n<pre class='inline-example '><code>control.renderers.someElement = function(element) {\n    // some code goes here\n};\n</code></pre>\n\n<p>Renderer name should be call according to defined element in the template. So, if you have template like:</p>\n\n<pre class='inline-example '><code>control.template =\n    '&lt;div class=\"{class:someElement}\"&gt;&lt;/div&gt;' +\n    '&lt;div class=\"{class:someElement2}\"&gt;&lt;/div&gt;';\n</code></pre>\n\n<p>you can add renderers for these elements like:</p>\n\n<pre class='inline-example '><code>control.renderers.someElement = function(element) {\n    // some code goes here\n};\n\ncontrol.renderers.someElement2 = function(element) {\n    // some code goes here\n};\n</code></pre>\n\n<h2 id='how_to_develop_control-section-10'>More examples</h2>\n\n<p>Each bundled Echo control uses the same mechanisms described in this guide. Bundled Echo controls are good examples which you can use as a pattern for your own controls:</p>\n\n<ul>\n<li><a href=\"http://cdn.echoenabled.com/sdk/v3/streamserver/controls/stream.js\">Stream</a></li>\n<li><a href=\"http://cdn.echoenabled.com/sdk/v3/streamserver/controls/facepile.js\">FacePile</a></li>\n<li><a href=\"http://cdn.echoenabled.com/sdk/v3/streamserver/controls/submit.js\">Submit</a></li>\n<li>and more (please look at Echo controls documentation pages)</li>\n</ul>\n\n",
  "title": "How to develop a control"
});