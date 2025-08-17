# Vue Memo Package

A configurable Vue component package for managing memos, designed to be integrated into existing Vue 3 applications.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Components](#components)
  - [Memo](#memo)
  - [TopMenus](#topmenus)
- [Styling](#styling)

## Installation

Install the package using npm:

```bash
npm install vue-memo-fe
```

## Usage

Import and use the `VueMemo` plugin in your main application entry point (e.g., `main.js`). You must pass a configuration object during installation.

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import VueMemo from 'vue-memo-fe';
import 'vue-memo-fe/dist/style.css'; // Import the package styles

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(VueMemo, {
    token: "YOUR_AUTH_TOKEN", // Required: Your authentication token
    baseUrl: "http://your-api-url.com/api", // Required: Base URL of your Laravel Memo API
    colors: {
        primary: '#4CAF50' // Optional: Primary color for theming
    },
    // Add other configuration options here
});

app.mount('#app');
```

Then, you can use the main `Memo` component anywhere in your application:

```vue
<template>
  <Memo />
</template>

<script>
export default {
  name: 'YourComponent',
}
</script>
```

## Configuration

The `VueMemo` plugin accepts a configuration object with the following options:

| Option                  | Type     | Required | Default                               | Description                                                                 |
| ----------------------- | -------- | -------- | ------------------------------------- | --------------------------------------------------------------------------- |
| `token`                 | `String` | Yes      | `null`                                | The authentication token for API requests.                                  |
| `baseUrl`               | `String` | Yes      | `null`                                | The base URL for the backend API.                                           |
| `auth_type`             | `String` | No       | `'token'`                             | The authentication type. Can be `'token'` or `'session'`.                   |
| `colors`                | `Object` | No       | `{ primary: '#007bff' }`              | An object to customize the theme colors. Currently supports `primary`.      |
| `height`                | `String` | No       | `'80vh'`                              | The minimum height of the memo list container.                              |
| `primevue`              | `Object` | No       | `null`                                | Custom PrimeVue theme configuration. See [PrimeVue docs](https://primevue.org/theming/). |
| `getMemosRoute`         | `String` | No       | `'/memo/all'`                         | API route for fetching memos.                                               |
| `getStatusesRoute`      | `String` | No       | `'/memo/statuses'`                    | API route for fetching memo statuses.                                       |
| `getTypesRoute`         | `String` | No       | `'/memo/types'`                       | API route for fetching memo types.                                          |
| `getDepartmentsRoute`   | `String` | No       | `'/memo/departments'`                 | API route for fetching departments.                                         |
| `getMembersRoute`       | `String` | No       | `'/memo/members'`                     | API route for fetching members/users.                                       |
| `getBootRoute`          | `String` | No       | `'/memo/boot'`                        | API route for fetching initial user data.                                   |
| `memosRoute`            | `String` | No       | `'/memo'`                             | API route for creating/updating memos.                                      |
| `makeCommentRoute`      | `String` | No       | `'/memo/make_comment'`                | API route for creating a comment.                                           |
| `updateCommentRoute`    | `String` | No       | `'/memo/comment'`                     | Base API route for updating a comment (e.g., `/memo/comment/:id`).          |
| `deleteCommentRoute`    | `String` | No       | `'/memo/comment'`                     | Base API route for deleting a comment (e.g., `/memo/comment/:id`).          |

## Components

### Memo

The main component that renders the entire memo management interface.

**Usage:**

```vue
<Memo />
```

### TopMenus

A component that displays the main navigation menus (e.g., "All", "INBOX", "SENT").

**Props:**

| Prop    | Type    | Default                                                                                             | Description                               |
| ------- | ------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `menus` | `Array` | `[{ label: "All", icon: "PhFolder", ... }, { label: "INBOX", ... }, { label: "SENT", ... }]` | An array of menu item objects to display. |

**Usage:**

```vue
<template>
  <TopMenus :menus="customMenus" />
</template>

<script>
import { PhArchive } from "@phosphor-icons/vue";

export default {
  data() {
    return {
      customMenus: [
        { label: "All", icon: "PhFolder", name: "category" },
        { label: "Archive", icon: PhArchive, name: "category" },
      ],
    };
  },
};
</script>
```

## Styling

The package uses Tailwind CSS and PrimeVue. To ensure proper styling, make sure to import the package's CSS file:

```javascript
import 'vue-memo-fe/dist/style.css';
```

The primary color of the components can be customized via the `colors.primary` configuration option.
