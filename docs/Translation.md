---
layout: default
title: "Translation"
---

# Internationalization

<video controls autoplay playsinline muted loop>
  <source src="./img/translation.webm" type="video/webm"/>
  <source src="./img/translation.mp4" type="video/mp4"/>
  Your browser does not support the video tag.
</video>


The react-admin user interface uses English as the default language. But you can also display the UI and content in other languages, allow changing language at runtime, and even lazy-loading optional languages to avoid increasing the bundle size with all translations. 

You will use translation features mostly via the `i18nProvider`, and a set of hooks (`useTranslate`, `useLocaleState`).

We'll use a bit of custom vocabulary in this section:
 
- "i18n" is a shorter way to write "internationalization" (an "i" followed by 18 letters followed by "n") 
- "locale" is a concept similar to language, but it also includes the concept of country. For instance, there are several English locales (like `en_us` and `en_gb`) because US and UK citizens don't use exactly the same language. For react-admin, the "locale" is just a key for your i18nProvider, so it can have any value you want.
- "translation key" is a string that is used to identify a piece of text in your application, e.g. "ra.action.save" for the `<SaveButton>` label

## Anatomy Of An `i18nProvider` 

Just like for data fetching and authentication, react-admin is agnostic to your translation backend. It relies on a provider for internationalization. It's called the `i18nProvider`, and it manages translation and language changes.

It should be an object with the following methods:

```ts
// in src/i18nProvider.ts
export const i18nProvider = {
    // required
    translate: (key, options) => string,
    changeLocale: locale => Promise<void>,
    getLocale: () => string,
    // optional
    getLocales: () => [{ locale: string, name: string }],
}
```

Use the `<Admin i18nProvider>` prop to define the `i18nProvider` of a react-admin app:

```jsx
import { i18nProvider } from './i18nProvider';

const App = () => (
    <Admin 
        dataProvider={dataProvider}
        i18nProvider={i18nProvider}
    >
        {/* ... */}
    </Admin>
);
```

If you want to add or update translations, you’ll have to provide your own `i18nProvider`.

## Translation Keys

React-admin components use translation keys for their text and rely on the `i18nProvider` to translate them.

For instance, the `<SaveButton>` renders the word 'Save' in English and 'Enregistrer' in French. This is because the button actually renders the return value of the `i18nProvider.translate('ra.action.save')` method:

```jsx
import { Button, useTranslate } from 'react-admin';

const SaveButton = ({ doSave }) => {
    const translate = useTranslate(); // returns the i18nProvider.translate() method
    return (
        <Button onClick={doSave}>
            {translate('ra.action.save')}
        </Button>
    );
};
```

If you build an app for users from several countries, you should do the same: always use translation keys instead of plain text in your own components:

```jsx
// in src/MyHelloButton.js
import * as React from "react";
import { useTranslate } from 'react-admin';

export const MyHelloButton = () => {
    const translate = useTranslate();
    const handleClick = () => {
        /* ... */
    };
    return (
        <button>{translate('myroot.hello.world')}</button>
    );
};
```

Check the [Translating the UI](./TranslationTranslating.md) for example usage of the `useTranslate` hook. 

## `ra-i18n-polyglot`

Although you can build an `i18nProvider` from scratch, react-admin provides a package called `ra-i18n-polyglot` that leverages [the Polyglot.js library](https://airbnb.io/polyglot.js/) to build an `i18nProvider` based on a dictionary of translations.

```jsx
// in src/i18nProvider.js
import polyglotI18nProvider from 'ra-i18n-polyglot';
import en from 'ra-language-english';
import fr from 'ra-language-french';

const translations = { en, fr };

export const i18nProvider = polyglotI18nProvider(
    locale => translations[locale],
    'en', // default locale
    [{ locale: 'en', name: 'English' }, { locale: 'fr', name: 'Français' }],
);

// in src/App.js
import { Admin } from 'react-admin';
import { i18nProvider } from './i18nProvider';

const App = () => (
    <Admin
        i18nProvider={i18nProvider}
        dataProvider={dataProvider}
    >
        ...
    </Admin>
);
```

Check [the translation setup documentation](./TranslationSetup.md) for details about `ra-i18n-polyglot` and how to configure it.

## `ra-i18n-i18next`

React-admin also provides a package called `ra-i18n-i18next` that leverages [the i18next library](https://www.i18next.com/) to build an `i18nProvider` based on a dictionary of translations.

You might prefer this package over `ra-i18n-polyglot` when:
- you already use i18next services such as [locize](https://locize.com/)
- you want more control on how you organize translations, leveraging [multiple files and namespaces](https://www.i18next.com/principles/namespaces)
- you want more control on how you [load translations](https://www.i18next.com/how-to/add-or-load-translations)
- you want to use features not available in Polyglot such as:
    - [advanced formatting](https://www.i18next.com/translation-function/formatting);
    - [nested translations](https://www.i18next.com/translation-function/nesting)
    - [context](https://www.i18next.com/translation-function/context)

```tsx
// in src/i18nProvider.js
import i18n from 'i18next';
import { useI18nextProvider, convertRaTranslationsToI18next } from 'ra-i18n-i18next';

const i18nInstance = i18n.use(
    resourcesToBackend(language => {
        if (language === 'fr') {
            return import(
                `ra-language-french`
            ).then(({ default: messages }) =>
                convertRaTranslationsToI18next(messages)
            );
        }
        return import(`ra-language-english`).then(({ default: messages }) =>
            convertRaTranslationsToI18next(messages)
        );
    })
);

export const useMyI18nProvider = () => useI18nextProvider({
    i18nInstance,
    availableLocales: [
        { locale: 'en', name: 'English' },
        { locale: 'fr', name: 'French' },
    ],
});

// in src/App.tsx
import { Admin } from 'react-admin';
import { useMyI18nProvider } from './i18nProvider';

const App = () => {
    const i18nProvider = useMyI18nProvider();
    if (!i18nProvider) return null;

    return (
        <Admin
            i18nProvider={i18nProvider}
            dataProvider={dataProvider}
        >
            ...
        </Admin>
    );
};
```

Check [the ra-i18n-i18next documentation](https://github.com/marmelab/react-admin/tree/master/packages/ra-i18n-i18next) for details.

## Translation Files

`ra-i18n-polyglot` relies on JSON objects for translations. This means that the only thing required to add support for a new language is a JSON file.

Translation files match a translation key to a translated text. They look like the following:

```js
const englishMessages = {
    // react-admin components
    ra: {
        action: {
            cancel: 'Cancel',
            clone: 'Clone',
            confirm: 'Confirm',
            create: 'Create',
            delete: 'Delete',
            edit: 'Edit',
            export: 'Export',
            list: 'List',
            refresh: 'Refresh',
            save: 'Save',
        },
        boolean: {
            true: 'Yes',
            false: 'No',
            null: ' ',
        },
        /* ...*/
    },
    // resources and fields
    resources: {
        shoe: {
            name: 'Shoe |||| Shoes',
            fields: {
                model: 'Model',
                stock: 'Nb in stock',
                color: 'Color',
            },
        },
        customer: {
            name: 'Customer |||| Customers',
            fields: {
                first_name: 'First name',
                last_name: 'Last name',
                dob: 'Date of birth',
            }
        }
        /* ...*/
    },
    // custom components
    acme: {
        buttons: {
            allow: 'Allow',
            deny: 'Deny',
        },
        notifications: {
            error: 'An error occurred',
            success: 'Success',
        },
        /* ...*/
    }
};
```

**Tip**: The default (English) messages are available in [the `ra-language-english` package source](https://github.com/marmelab/react-admin/blob/master/packages/ra-language-english/src/index.ts).

When building an internationalized app with react-admin, the usual workflow is therefore to let developers write the main translation file. Then, pass this file to a team of translators, with the task to translate it. They can use any software they want for that (even software using Gettext/PO files, as it's possible to convert POT to and from JSON). Finally, aggregate all the translations into an `i18nProvider`.

Check [the translation setup documentation](./TranslationSetup.md) to understand how to build your own translation file, the [list of available translations](./TranslationLocales.md) to find a translation for your language, and  [Translating the UI](./TranslationTranslating.md) to understand how to translate react-admin commponents.

## Translating Values

Beyond the UX, you may need to translate values in your data. For instance, you may want to display a translated label for a status field, or a translated name for a category.

This implies that your data model stores the translations in a way that can be used by the UI. The advised solution is to store the translations as a JSON object in the data itself. For example, a Category resource could have a `name` field that contains the translations for each locale:

```json
{
    "id": 1,
    "name": {
        "en": "Shoes",
        "fr": "Chaussures"
    }
}
```

If you follow this data structure, you can use special fields and inputs to display and edit the translated values. 

- [`<TranslatableField>`](./TranslatableFields.md) lets you display all the translations for a field in a single component.

    <video controls autoplay playsinline muted loop>
    <source src="./img/translatable-fields-basic.webm" type="video/webm" />
    <source src="./img/translatable-fields-basic.webm" type="video/mp4" />
    Your browser does not support the video tag.
    </video>

    ```jsx
    <TranslatableFields locales={['en', 'fr']}>
        <TextField source="title" />
        <TextField source="description" />
    </TranslatableFields>
    ```

- [`<TranslatableInputs>`](./TranslatableInputs.md) lets you edit all the translations for a field in a single component.

    <video controls autoplay playsinline muted loop>
    <source src="./img/translatable-input.webm" type="video/webm"/>
    <source src="./img/translatable-input.mp4" type="video/mp4"/>
    Your browser does not support the video tag.
    </video>

    ```jsx
    <TranslatableInputs locales={['en', 'fr']}>
        <TextInput source="name" />
        <RichTextInput source="description" />
    </TranslatableInputs>
    ```

Check out the documentation for [Translatable Fields](./TranslatableFields.md) and [Translatable Inputs](./TranslatableInputs.md) for more details.

## Localization

For numeric and temporal values, react-admin benefits from the Single-Page Application architecture. As the application executes in the browser, it uses the browser's locale by default to format numbers and dates.

For instance, the `<DateField>` renders the date in the user's locale, using the `Intl.DateTimeFormat` API. 

```tsx
<DateField source="published_at" />
// renders the record { id: 1234, published_at: new Date('2017-04-23') } as
<span>4/23/2017</span>
```

You can force a specific locale by passing the `locale` prop to the field:

```tsx
<DateField source="published_at" locale="fr-FR" />
// renders the record { id: 1234, published_at: new Date('2017-04-23') } as
<span>23/04/2017</span>
```

The following components take advantage of browser localization:

- [`<DateField>`](./DateField.md)
- [`<DateInput>`](./DateInput.md)
- [`<DateTimeInput>`](./DateTimeInput.md)
- [`<DateRangeInput>`](./DateRangeInput.md)
- [ `<NumberField>`](./NumberField.md)
- [`<NumberInput>`](./NumberInput.md)
- [`<TimeInput>`](./TimeInput.md)