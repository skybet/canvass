import BaseTrigger from 'canvass/distribution/Toolkit/BaseTrigger';

/* ButtonClickTrigger
 *
 * Trigger is fired when the button is clicked
 */
export default class ButtonClickTrigger extends BaseTrigger {

    displayName = 'ButtonClickTrigger';

    // This is called when initialising the experiment
    setup() {
        this.buttonClicked = false;

        // Add a listener for the button on the homepage
        document.getElementById('button').addEventListener('click', () => {
            this.buttonClicked = true;
        });
    }

    // The boolean definition for the trigger
    isTriggered() {
        return this.buttonClicked;
    }
}
