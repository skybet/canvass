import Experiment from 'canvass/distribution/Experiment';
import ButtonClickTrigger from 'ButtonClickTrigger';

// Define the trigger by creating a new home page trigger
let trigger = new ButtonClickTrigger();

/* For the control group, return Default variant. In this case, it's just a string
 * that is used by the App.js
 *
 * For group 1, return the Pink variant.
 */
let variants = {
    0: 'Default',
    1: 'Pink',
};

/* Instantiate an experiment object with the id PinkHomepageExperiment with our
 * trigger and variants.
 *
 * Export it by default so we can get it just by requiring it in index.js
 */
export default new Experiment('PinkHomepageExperiment', [trigger], variants);
