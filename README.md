# ember-cli-deploy-honeybadger

> An ember-cli-deploy plugin to upload source map files to honeybadger

This plugin uploads one or more source map files, along with their minified js counterparts, to
Honeybadger using the [Honeybadger Source Map Upload API](https://docs.honeybadger.io/api/source-maps.html).

## What is an ember-cli-deploy plugin?

A plugin is an addon that can be executed as a part of the ember-cli-deploy pipeline. A plugin will
implement one or more of the ember-cli-deploy's pipeline hooks.

For more information on what plugins are and how they work, please refer to the [Plugin Documentation][1].

## Quick Start

To get up and running quickly, do the following:

- Place the following configuration into `config/deploy.js`

```javascript
ENV.honeybadger = {
  apiKey: '<your-honeybadger-api-key>',
  revision: '<your-git-revision>'
  assetsUrl: '<url-to-assets-directory>',
  filePattern: '<file-pattern-of-js-files>'
}
```

- Run the pipeline

```bash
$ ember deploy
```

## Installation

## ember-cli-deploy Hooks Implemented

For detailed information on what plugin hooks are and how they work, please refer to the
[Plugin Documentation][1].

- `prepare`
- `didPrepare`; maps need to be uploaded before any file compression occurs, which tends to happen before the
`upload` hook, so we need to ensure this occurs first.

## Configuration Options

For detailed information on how configuration of plugins works, please refer to the
[Plugin Documentation][1].

<hr/>

### apiKey (`required`)

The API access key for your Honeybadger project.

*Default:* `undefined`

### revision (`required`)

The source code repository revision for the source maps being uploaded. This should be stored in
a local environment variable for retrieval in the configuration definition above (example:
`process.env.<YOUR_ENV_VARIABLE>`).

*Default:* `undefined`

### assetsUrl

The url to the `/assets` directory on the web server. This will typically
look like `https://example.com/assets`. Accepts wildcards (`*`).

*Default:* `http*:/*/assets`

### filePattern

The file pattern to match when looking for javascript to upload. This pattern is relative
to `assetsDir`. Accepts wildcards (`*`).

*Default:* `*`

### apiEndpoint

The Honeybadger API URL.

*Default:* `https://api.honeybadger.io/v1/source_maps`

### assetsDir

The local directory that has the compiled assets.

*Default:* `${context.distDir}/assets`

## Prerequisites

The following properties are expected to be present on the deployment `context` object:

- `distDir` (provided by [ember-cli-deploy-build][2])

## Tests

TBD

[1]: http://ember-cli-deploy.com/plugins/ "Plugin Documentation"
[2]: https://github.com/ember-cli-deploy/ember-cli-deploy-build "ember-cli-deploy-build"
