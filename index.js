/* eslint-env node */
'use strict';

var Base = require('ember-cli-deploy-plugin');
var minimatch = require('minimatch');
var fs = require('fs');
var request = require('request-promise');
var RSVP = require('rsvp');

module.exports = {
  name: 'ember-cli-deploy-honeybadger',

  createDeployPlugin: function(options) {
    var DeployPlugin = Base.extend({
      name: options.name,

      defaultConfig: {
        apiEndpoint: 'https://api.honeybadger.io/v1/source_maps',
        assetsDir: context => `${context.distDir}/assets`,
        assetsUrl: 'http*://*/assets',
        filePattern: '*'
      },

      requiredConfig: ['apiKey', 'revision'],

      prepare: function(/* context */) {
        this.apiEndpoint = this.readConfig('apiEndpoint');
        this.apiKey = this.readConfig('apiKey');
        this.assetsDir = this.readConfig('assetsDir');
        this.assetsUrl = this.readConfig('assetsUrl');
        this.filePattern = this.readConfig('filePattern');
        this.mapFiles = {};
        this.revision = this.readConfig('revision');
        this.success = 0;
        this.fail = 0;

        let assets = fs.readdirSync(this.assetsDir);
        let jsFiles = assets.filter(file => minimatch(file, `**/${this.filePattern}.js`));
        jsFiles.forEach(jsFile => {
          let filePrefix = jsFile.substr(0, jsFile.lastIndexOf('-'));
          this.mapFiles[jsFile] = assets.find(file => minimatch(file, `${filePrefix}*.map`));
          this.log(`found map ${this.mapFiles[jsFile]} for ${jsFile}`);
        });

        this.uploadSourceMap.bind(this);
      },

      /**
       * Need to upload source maps before any compression plugins are run, which typically
       * occurs in the willUpload hook.
       */
      didPrepare: function(/* context */) {
        let promises = Object.keys(this.mapFiles).map(jsFileName => {
          let mapFileName = this.mapFiles[jsFileName];
          if (mapFileName) {
            return this.uploadSourceMap(jsFileName, this.mapFiles[jsFileName]);
          }
          return new RSVP.Promise(resolve => resolve());
        });
        return RSVP.all(promises)
          .then(() => this.log(`ok ${this.success}; fail ${this.fail}`));
      },

      uploadSourceMap: function(jsFileName, mapFileName) {
        let options = {
          method: 'POST',
          uri: this.apiEndpoint,
          formData: {
            api_key: this.apiKey,
            revision: this.revision,
            minified_url: `${this.assetsUrl}/${jsFileName}`,
            minified_file: {
              value: fs.createReadStream(`${this.assetsDir}/${jsFileName}`),
              options: {
                filename: jsFileName,
                contentType: 'text/javascript'
              }
            },
            source_map: {
              value: fs.createReadStream(`${this.assetsDir}/${mapFileName}`),
              options: {
                filename: mapFileName,
                contentType: 'application/octet-stream'
              }
            }
          }
        };

        let that = this;
        return request(options)
          .then(() => {
            that.log(`✔  success - js: ${jsFileName}, map: ${mapFileName}`);
            that.success++;
          })
          .catch(error => {
            that.log(`x  fail - js: ${jsFileName}, map: ${mapFileName}`, { color: 'red' });
            that.log(`error: ${error}`, { color: 'red' });
            that.fail++;
          });
      }
    });

    return new DeployPlugin();
  }
};
