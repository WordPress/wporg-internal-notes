# WordPress.org Internal Notes plugin

Adds a new sidebar to the block editor for post types that support `wporg-internal-notes`. Editors can leave notes about the current post that other editors can read, but the notes are not visible on the front end.

## Configuration

To enable internal notes for a particular post type, add this line to an mu-plugin or somewhere in the plugin that registers the post type:

`add_post_type_support( '[post type slug here]', 'wporg-internal-notes' );`

To enable log entries of changes to posts, which will appear in the same stream with internal notes, add this line:

`add_post_type_support( '[post type slug here]', 'wporg-log-notes' );`

You can also choose which change events to log. See `logging_enabled()` for a list of available events.

`add_post_type_support( '[post type slug here]', 'wporg-log-notes', array( 'status-change' => true ) );`

## Development

### Prerequisites

* Docker
* Node/npm
* Yarn
* Composer

### Setup

1. Set up repo dependencies: `yarn run initial-setup`
1. Start up and provision the environment: `yarn run env`
1. Build the assets: `yarn workspaces run build`. The plugin won't function until this step is done.
1. Visit site at `localhost:8888`
1. Log in with username `admin` and password `password`

### Environment management

These must be run in the project's root folder, _not_ in theme/plugin subfolders.

* Stop the environment: `yarn run env:stop` or `yarn run wp-env stop`
* Restart the environment: `yarn run env` or `yarn run wp-env start`

### Asset management

* Build all assets once: `yarn workspaces run build`
* Rebuild all assets on change: `yarn workspaces run start`
