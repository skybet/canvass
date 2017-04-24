# Preview Mode
Preview mode is a feature which enables you to force the group that you appear in for any experiments in Canvass. Essentially, it causes canvass to bypass the Provider when setting the group for an enrolled experiment.

This can be incredibly useful for testing, debugging and providing demos.

## Using Preview Mode
Preview mode is activated using a query string. The different modes that are supported are described below. Simply append the query string to the url in your browser.

The preview mode that you set will persist for the current session (even if you remove the query string and refresh). To turn preview mode off, use the "off" mode described below.

### "All" Mode
This mode enables the challenging variant of all experiments by default. All enrolled experiments will activate with a group of 1.

`?canvassPreviewMode=all`

### "None" Mode
This mode enables the control variant of all experiments by default. All enrolled experiments will activate with a group of 0.

`?canvassPreviewMode=none`

### "Custom" Mode
This mode enables you to explicitly decide the group that you will receive for specific experiments.

`?canvassPreviewMode={"MyExperiment":1}`

will place you in group 1 when MyExperiment enrolls. Note that any other experiments **not** explicitly named in custom mode will receive a group of 0 by default.

### "Off" Mode
This mode is used to turn preview mode off.

`?canvassPreviewMode=off`
