# Canvass
> **canvass**
> /ˈkanvəs/
> *verb*
> 1. propose (an idea or plan) for discussion
> 2. solicit votes from (electors or members).

Canvass is an event based javascript library used to build and manage experiments (a/b/n tests) in your web applications.

You build an experiment by defining when and what different groups of users experience when using your application.

It currently optionally integrates with [Qubit](http://www.qubit.com/) for traffic allocation and data tracking, but you can write your own integration if you are using a different a/b testing platform.

## Features

 - Easy interface for defining and running experiments
 - Integrates with Qubit
 - Preview mode to let you control experiments when developing and testing

## What is an experiment?

An experiment defines what you would like to a/b test, when the experiment should start (called "triggers") and what each group of users should see (called "variants").

## Install

`npm install skybet/canvass`

## Usage

To start using canvass, simply import it as below and register an experiment.

```javascript
import canvass from 'canvass';
import Experiment from 'canvass/distribution/Experiment';

...
let myExperiment = new Experiment('MyExperiment', triggers, variants);

canvass.addExperiment(myExperiment);
```

For a full code example, see [examples/basic](examples/basic).

## Debugging
Canvass has a few nice features to help you debug your experiments:

### Logging
To enable debug logging, set the canvassDebug cookie:

`document.cookie="canvassDebug=1"`

### Preview Mode
Preview mode lets you control which experiments you see using a query string parameter. Some examples include:

`?canvassPreviewMode=all`

`?canvassPreviewMode=none`

`?canvassPreviewMode={"experimentId":<group>}`

See [Preview Mode](docs/PreviewMode.md) docs for more options.

### Seeing Inside Canvass
There is a helpful method on the window that you can use to get a human readable printout of the current status of Canvass and all of the registered experiments:

`window.canvass.printState()`

You can call this in your browser's javascript console.

## Contributing

Contributions are welcome; Please submit all pull requests against the master branch. If your pull request contains JavaScript patches or features, you should include relevant unit and integration tests. Thanks!

## Authors

- [Adam Blanchard](https://github.com/adamblanchard)
- [Steve Goode](https://github.com/stevangoode)

## Disclaimer
We are not affiliated or associated in any way with Qubit.

## License

 - [MIT License](http://opensource.org/licenses/MIT)
