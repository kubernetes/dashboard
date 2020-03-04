# Internationalization

Based on current browser locale the Dashboard can be displayed in one of the supported languages listed below. In case it does not work, make sure that your browser's locale is identified with correct language code. In more details, Dashboard determines requested language based on HTTP `Accept-Language` header from browser. We can check which language codes are requested by browser on `Network` tab in developer tool of browser.

| Language            | Code    | Remarks    |
|---------------------|---------|------------|
| English (default)   | en      | -          |
| French              | fr      | -          |
| German              | de      | -          |
| Japanese            | ja      | -          |
| Korean              | ko      | -          |
| Simplified Chinese  | zh      | -          |
| Chinese (PRC)       | zh-cn   | Same as zh |
| Chinese (Hong Kong) | zh-hk   | -          |
| Chinese (Singapore) | zh-sg   | -          |
| Chinese (Taiwan)    | zh-tw   | -          |

## Building localized dashboard

To show localized dashboard, you need to build dashboard binary before.
To build dashboard binary, run `npm run build`. Or to build and run localized dashboard immediately, run `npm run start:prod`.

Note: Building localized dashboard takes time, so development environment, e.g. `npm start`, does not compile localized versions.

## Translation management

All translation data is stored in `i18n/` directory in project's root. It includes `locale_conf.json` configuration file, translation source file `messages.xlf` and translation files for each language, e.g. `i18n/fr/messages.fr.xlf` or `i18n/ja/messages.ja.xlf`.

## Introducing new localizable text

Localization is handled by [Angular](https://angular.io/guide/i18n).
Add `i18n` attribute into tag surrounding new text in Angular template html files.

### To update translation source file and translation files

Run `npm run fix:i18n`. It will execute `ng xi18n` and `xliffmerge`, they will update `i18n/messages.xlf` and `i18n/[locale]/messages.[locale].xlf` files.

### To translate new localizable text

`xliffmerge` would copy new localizable texts from `<source>` element to `<target>` element with `state="new"` attribute in your translation file, i.e. `i18n/[locale]/messages.[locale].xlf`.
Find new localizable texts in `i18n/[locale]/messages.[locale].xlf` file and translate text in the `<target>` element.

## Introducing new language

Since dashboard team can not review translation files in your language, so dashboard team transfers authority to review and approve for updating your translation file. At first, you need to organize translation team for your language that manages dashboard translation file.

1. Create your locale directory under `i18n` directory, e.g. `i18n/fr` or `i18n/ja`.
2. Add your locale, e.g. `fr` or `ja`, into `"languages"` array of `"xliffmergeOptions"` in `package.json` file. If you want to add only locale and use an existing translation file for it, i.e. add `zh-cn` but use existing `i18n/zh/messages.zh.xlf` file for it, skip this step and go step 5.
  **Important: Locales should be written in lower case to be handled by Dashboard, e.g. `zh-cn`, not `zh-CN`**
3. Run `npm run fix:i18n`. Then translation file for your language, e.g. `i18n/fr/messages.fr.xlf`, would be generated in your locale directory.
  If `i18n/[locale]/messages.[locale].xlf` is not normal file type, our script ignores `xliffmerge` for the locale.
4. Open your translation file and translate texts in `<target>` element into your language.
5. If you want to use an existing translation file for the locale, create symbolic link `messages.[locale].xlf` to the existing translation file like follow:
  ```
  cd i18n/zh-cn
  ln -s ../zh/messages.zh.xlf messages.zh-cn.xlf
  ```

After preparation of new translation file, configure `i18n/locale_conf.json` file to support translated dashboard as follows:

```
{"translations": [ "en", "fr", "ko", "zh" ]}
```

To add Japanese translation file, add `"ja"` into `"translations"` array in alphabetical order.

```
{"translations": [ "en", "fr", "ja", "ko", "zh" ]}
```

To save time for building localized version in your develop environment, you can set locales not to build by creating `i18n/locale_not_for_build_local` and adding into it like below:

```
fr
ko
```

Then you can build your localized dashboard with `npm run build`.

Before submit Pull Request, add `i18n/[locale]/OWNERS` file for your translation team like below:

```
approvers:
  - [your github account]
  - [and more approvers' github account]

labels:
- language/[your locale]
```

By changes for html files, workflow for i18n on Kubernetes Dashboard updates your translation file. To ease watching updates for your translation file in the future, set `labels` in your `OWNERS` file like above. It would allow you watching updates for your translation file with watching PRs having this label in `kubernetes/dashboard` repository like [this](https://github.com/kubernetes/dashboard/pulls?utf8=%E2%9C%93&q=is%3Apr+label%3Alanguage%2Fja).

At last, please create Pull Request and submit it to `kubernetes/dashboard`.

----
_Copyright 2019 [The Kubernetes Dashboard Authors](https://github.com/kubernetes/dashboard/graphs/contributors)_
