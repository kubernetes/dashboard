# Using angular-translate
Angular JS is currently an external project supporting AngularJS 1.X and is entirely based on the Angular functionality. It relies heavily on the data-bindings and no build step is required (in contrast to the Closure Templates). A fully dynamic framework (all translations are available at runtime without reload), which also makes it a bit more demanding performance-wise.

To use it:
* in some structure (e.g. a JSON file) define a key-value object, containing all the translated messages.
* Bind this object's to the `$translateProvider` that comes with the framework.
* Use `{{ <message_key> | translate }}` in the angular templates.

## Pros of angular-translate for i18n:
* Since it is entirely AngularJS based, this solution is particularly simple to integrate into Dashboard.
* If locale changes are necessary, it is really flexible and the corresponding translation can be chosen dynamically without reload.
* Therefore the server does not have to determine what the locale is (in contrast to Closure Templates).
* Supports detection of the default locale out of the box.

## Cons of angular-translate for i18n:
* With this framework we cannot use the XLIFF standard. For human translators, that's usually considered an inconvenience, because they have to translate directly inside the JSON files. An alternative would be to find a tool that can convert from XLIFF to JS back and forth, then this consideration would not be a problem.
* Due to the abuse of data bindings and tracking of UI elements, it can decrease performance.

From my perspective, the angular-translate framework is easier to integrate into our project. The only major drawback is the missing link in the i18n & l10n chain (the XLIFF format), which makes it easier for human translators to localize.
