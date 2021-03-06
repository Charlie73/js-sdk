# High-level overview

## About
Echo offers a collection of [powerful Cloud Services](http://aboutecho.com/WhatWeOffer/EchoPlatform) that do the heavy lifting for real-time, social applications. This SDK is designed to make it easy for JavaScript app developers to consume these cloud services while producing more interoperable and consistent apps by addressing the following general app development challenges:


- JS API - Easier access to server-side APIs via the client side
- GUI Library - More consistent look and feel between apps (Bootstrap)
- UI Controls - A Core set of UI Controls for common app/interaction patterns
- Component Manifest - Consistent app architecture for plugin extensibility, consistent configuration handling and app interoperability
- Echo Loader - Simplified dependency loading to reduce script conflicts and redundancies
- Configuration storage and overrides (coming soon)
- Centralized deployment management and administration (coming soon)

## Main features

### JS API - Easier access to server-side APIs via the client side
A well documented client-side API for interacting with the Echo Cloud Services quickly and easily right from the page using Javascript ([learn more](#!/api/Echo.API.Request)).

### GUI Library - More consistent look and feel between apps
Echo JS SDK 3.0 uses [Twitter Bootstrap](http://twitter.github.com/bootstrap/) as the new UI framework. By employing an industry-standard UI framework with well defined UI rules, should help the apps look stylish and consistent, yet provide a lot of room for customizations by our publishers ([learn more](#!api/Echo.GUI)).

### UI Controls - A Core set of Controls for common app/interaction patterns
These controls quickly deliver core pieces of App UI based on common feature scenarios such as activity streams, submission, facepiles, counters and more.

#### [Echo.StreamServer.Controls.Stream](#!/api/Echo.StreamServer.Controls.Stream)
Echo Stream control which encapsulates interaction with the Echo Search API and displays live updating search results in a standard ‘news feed’ style format.

#### [Echo.StreamServer.Controls.Submit](#!/api/Echo.StreamServer.Controls.Submit)
Echo Submit control which encapsulates interaction with the Echo Submit API and provides a simple ‘submit/comment form’ style interaction.

#### [Echo.StreamServer.Controls.Counter](#!/api/Echo.StreamServer.Controls.Counter)
Echo Counter class which encapsulates interaction with the Echo Count API and provides a simple live updating number.

#### [Echo.StreamServer.Controls.FacePile](#!/api/Echo.StreamServer.Controls.FacePile)
Echo FacePile control displays users (actors) returned in any activity stream and displays a live updating collection of avatars and names.

#### [Echo.IdentityServer.Controls.Auth](#!/api/Echo.IdentityServer.Controls.Auth)
Echo Auth control displays the user login status and allows them sign in using different social identities.

#### [Guide: Building a Control](#!/guide/how_to_develop_control)

### Component Manifest - Consistent app architecture for plugin extensibility, consistent configuration handling and app interoperability

In order to ensure consistency between various components built by different developers, we have introduced a Component Manifest which describes the core attributes of the given component, such as templates, renderers, events, dependencies etc.

Components build using this approach inherit a number of distinct advantages including:

- Better app consistency and interoperability. Multiple apps can be deployed on the same page (or combined together) without script conflicts and errors.
- Supports for plugins that can modify the given component’s behavior.


[Guide: Building a Control](#!/guide/how_to_develop_control)

[Guide: Developing a Plugin](#!/guide/how_to_develop_plugin)

[Guide: Developing an App](#!/guide/how_to_develop_app)

### Echo Loader - Simplified dependency loading to reduce script conflicts and redundancies

In order to minimize the footprint of JavaScript files on a given page (particularly important for SEO and mobile web) and avoid script conflicts the JS SDK provides a class which contains the logic for downloading appropriate JS and CSS dependencies (as described in the Component Manifest) on the fly ([learn more](#!/api/Echo.Loader)).

## Other Features

### Built in Minification

All SDK files are served from our CDN minified by default, which reduces the size of the scripts by 25-85% of the original versions (min+gzip compared to dev+gzip). Non-minified versions of the files are also provided to simplify the development and debug process.

### More fault tolerant jQuery support

One of the common issues faced JS App Development is jQuery incompatibility. Different versions of jQuery software located on the same page would sometimes cause conflicts, bugs and other problems. In SDK 3.0 we’ve introduced a dedicated namespace for jQuery and isolated it from accidental overrides.

### Open source code available on GitHub

The SDK code is open source (located on GitHub). We look forward to having the community monitor and participate in SDK development moving forward.

The GitHub repo can be found [here](https://github.com/EchoAppsTeam/js-sdk/)

### Extensive test suites

100% of the public interfaces are covered with automated tests (over 1k and counting), which should increase quality and predictability moving forward.

Test Suites can be found [here](http://echoappsteam.github.com/js-sdk/tests/)

### Extensive documentation

Inline documentation for all public functions using JSDuck is included. We have also added several guides and tutorials and are planning to extend the SDK knowledge base moving forward.

Documentation can be found [here](http://echoappsteam.github.com/js-sdk/docs/)

## Get Started

Check out the documentation on [GitHub](http://echoappsteam.github.com/js-sdk/docs/).

To get started with the SDK [contact us](http://aboutecho.com/AboutEcho/Contact)!
