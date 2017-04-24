import BaseTrigger from 'canvass/distribution/Toolkit/BaseTrigger';

// Extends BaseTrigger and overrides the abstract methods setup() and isTriggered()
export default class HomePageTrigger extends BaseTrigger {

    displayName = 'HomePageTrigger';

    // This is called when initialising the experiment
    setup() {
        // Check if the trigger is satisfied on start.
        this.checkTrigger();

        // Add a listener for future changes to the page path
        window.onhashchange = () => {
            this.checkTrigger();
        };
    }

    // The boolean definition for the trigger. In this case, check if we are on
    // the homepage
    isTriggered() {
        return window.location.pathname === '/';
    }
}
