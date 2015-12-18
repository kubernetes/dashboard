# Using the soy templates
When using closure templates for i18n & l10n, there are the following steps:
* The templates have to be written in the Closure Templates syntax.
* All text pieces need to be surrounded by `{msg} .. {/msg}` tags to mark them as "Need to be translated".
* Then, with an automated step (e.g. `gulp soy-extract`) the *msg* text pieces from the soy templates can be extracted into XLIFF files. XLIFF is a standard translation format and can be used in programs, such as Virtaal (https://github.com/translate/virtaal) to help translators quickly localize strings. There are many other tools that support XLIFF as well (e.g. http://xliff.brightec.co.uk/, http://sourceforge.net/projects/eviltrans/).
* As a next step, a translator (a person) must use one of the available tools to create further XLIFF files, containing translations for the originally extracted XLIFF.
* Finally, another build step (e.g. `gulp soy-locales`) can take all the XLIFF files and compile them into JS templates, that can be used in the rest of the code. One file is created for each locale.

## Pros of Closure Templates for i18n:
* Closes the i18n and l10n cycle, providing easy integration of the XLIFF format. Makes it easy for human translators to localize the content.
* Performance-wise better than Angular-translate (no dynamic bindings, no tracking of bindings during runtime).
* Locale changes rarely, therefore the approach with different .js files actually seems reasonable (load them in the beginning and all should be good).
* The template compilation & message extraction steps fit in our build chain rather nicely (as gulp tasks).

## Cons of Closure Templates for i18n:
* Full application reload if a locale changes (the specific compiled .js file for the right locale must be loaded in the index.html)
* The **server** needs to determine which .js locale file must be served (e.g. via Accept Language header). Not exactly sure if we want to implement it this way.
* Since it is part of the Closure tools, it is kind of incompatible with AngularJS. Also, so far I couldn't get the template code and the soyutils.js library to go through the Closure Compiler without errors, seems a bit tricky to do this right.

See https://docs.google.com/document/d/1mwyOFsAD-bPoXTk3Hthq0CAcGXCUw-BtTJMR4nGTY-0/edit#heading=h.ixg45w3363q for further details.

In this example pull request, when running `gulp serve` or `gulp serve:prod` all the soy templates are automatically compiled (only the in english).

If you manually want to recompile the soy templates, use `gulp soy-templates` or `gulp soy-templates:prod` to do so.
The compiled .js code is placed in the respective directories (development or production) in the .tmp folder and later "appended" to the rest of the existing code (the soyutils.js library is appended as well).

Note that I have still not integrated the localized .js files in dashboard, as the server must decide which one should be served (based on Cookies or the Accept Language header). **How to do this is still the topic that needs most attention here, IMHO.**
