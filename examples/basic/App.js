import canvass from 'canvass';

/* Assume this javascript runs on every page of your application.
 *
 * If on the homepage, the experiment will trigger. This will get the variant from canvass
 * and set the correct variant for the users group. The page will then rerender with the
 * correct html :-)
 *
 * If on any other page, the experiment won't activate, so the default variant will render.
 */

// Initialise the experiment by adding it to canvass
canvass.addExperiment(require('experiments/MyPinkHomepageExperiment'));

// Set the page to by default render the Default variant
let variant = 'Default';

// Function to render the page's html
let renderPage = () => {
    let html;

    // If pink variant, set "Pink World"
    if (variant === 'Pink') {
        html = '<h1>Pink World</h1>';
    }

    // If default variant, set "Hello World"
    if (variant === 'Default') {
        html = '<h1>Hello World</h1>';
    }

    // Add html to the dom
    document.documentElement.innerHTML = html;
};

// Function to rerender the page after setting the correct variant for the user's group from the experiment
let renderExperiment = () => {
    variant = canvass.getExperiment('MyPinkHomepageExperiment').getVariant();
    renderPage();
};

// Check if the experiment is already active when the page loads
if (canvass.register['MyPinkHomepageExperiment'].getStatus() === 'ACTIVE') {
    renderExperiment();
}

// Add a listener so if the experiment becomes active, the page is rerendered
canvass.on('MyPinkHomepageExperiment.ACTIVE', () => renderExperiment());

// Render the page
renderPage();
