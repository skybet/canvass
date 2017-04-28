/*
 * Javascript Application
 */
import canvass from 'canvass';

// Initialise the experiment by adding it to canvass
canvass.addExperiment(require('experiments/MyPinkHomepageExperiment'));

// Function to rerender the page after setting the correct variant for the user's group from the experiment
let renderExperiment = () => {
    // Get the variant from the experiment. This will return the correct one for the user's group
    const variant = canvass.getExperiment('MyPinkHomepageExperiment').getVariant();

    // If the user is in the Pink variant, change the background color appropriately
    if (variant === 'Pink') {
        document.body.style.background = 'pink';
    } else if (variant === 'Default') {
        // Do nothing if the user is in the control group
    }
};

// Add a listener so if the trigger fires and the experiment becomes active, the experiment is rendered
canvass.on('MyPinkHomepageExperiment.ACTIVE', () => renderExperiment());
