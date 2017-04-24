# Canvass

An event based javascript library used to build and manage experiments (a/b/n tests).

You build an experiment by defining when and what different groups of users experience when using your application.

It currently optionally integrates with [Qubit](http://www.qubit.com/) for traffic allocation and data tracking, but it's possible to write your own integration if you use a different a/b testing platform.

## Features

 - Easy interface for defining and running experiments
 - Integrates with Qubit
 - Preview mode to let you control experiments when developing and testing

## What is an experiment?

An experiment defines what you would like to a/b test, when the experiment should start (called "triggers"), and what each group of users should see (called "variants").

## Install

`npm install canvass`

## Usage

To start using canvass, simply import it as below and register an experiment.

```javascript
import canvass from 'canvass';
import Experiment from 'canvass/distribution/Experiment';

...
let myExperiment = new Experiment('MyExperiment', triggers, variants);

canvass.addExperiment(myExperiment);
```

For a full code example, see [examples/basic/App.js](examples/basic/App.js).

## Contributing

Contributions are welcome; Please submit all pull requests against the master branch. If your pull request contains JavaScript patches or features, you should include relevant unit and integration tests. Thanks!

## Authors

Adam Blanchard <adamgoodie@gmail.com> https://github.com/adamblanchard
Steve Goode // TODO insert steve deets here if we wants

## License

 - **MIT** : http://opensource.org/licenses/MIT
