import { BrowserBuilderOutput, executeBrowserBuilder, ExecutionTransformer } from '@angular-devkit/build-angular';
import { JsonObject } from '@angular-devkit/core';
import { createBuilder, BuilderContext } from '@angular-devkit/architect';
import * as fs from 'fs';
import * as webpack from 'webpack';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';


interface Options extends JsonObject {
  /**
   * A string of the form `path/to/file#exportName` that acts as a path to include to bundle
   */
  modulePath: string;

  /**
   * A name of compiled bundle
   */
  pluginName: string;

  /**
   * A comma-delimited list of shared lib names used by current plugin
   */
  sharedLibs: string;
}

let entryPointPath;

function buildPlugin(options: Options,
                     context: BuilderContext,
                     transforms: {
                         webpackConfiguration?: ExecutionTransformer<webpack.Configuration>,
                     } = {}): Observable<BrowserBuilderOutput> {
  options.deleteOutputPath = false;

  validateOptions(options);

  const originalWebpackConfigurationFn = transforms.webpackConfiguration;
  transforms.webpackConfiguration = (config: webpack.Configuration) => {
    patchWebpackConfig(config, options);

    return originalWebpackConfigurationFn ? originalWebpackConfigurationFn(config) : config;
  };

  const result = executeBrowserBuilder(options as any, context, transforms);

  return result.pipe(tap(() => {
    patchEntryPoint('');
  }));
}

function patchEntryPoint(contents: string) {
  fs.writeFileSync(entryPointPath, contents);
}

function validateOptions(options: Options) {
  const { pluginName, modulePath } = options;

  if (!modulePath) {
    throw Error('Please define modulePath!');
  }

  if (!pluginName) {
    throw Error('Please provide pluginName!');
  }
}

function patchWebpackConfig(config: webpack.Configuration, options: Options) {
  const { pluginName, sharedLibs } = options;

  // Make sure we are producing a single bundle
  delete config.entry.polyfills;
  delete config.entry['polyfills-es5'];
  delete config.optimization.runtimeChunk;
  delete config.optimization.splitChunks;
  delete config.entry.styles;

  config.externals = {
    rxjs: 'rxjs',
    '@angular/core': 'ng.core',
    '@angular/common': 'ng.common',
    '@angular/forms': 'ng.forms',
    '@angular/router': 'ng.router',
    tslib: 'tslib'
    // put here other common dependencies
  };

  if (sharedLibs) {
    config.externals = [config.externals];
    const sharedLibsArr = sharedLibs.split(',');
    sharedLibsArr.forEach(sharedLibName => {
      const factoryRegexp = new RegExp(`${sharedLibName}.ngfactory$`);
      config.externals[0][sharedLibName] = sharedLibName; // define external for code
      config.externals.push((context, request, callback) => {
        if (factoryRegexp.test(request)) {
          return callback(null, sharedLibName); // define external for factory
        }
        callback();
      });
    });
  }

  const ngCompilerPluginInstance = config.plugins.find(
    x => x.constructor && x.constructor.name === 'AngularCompilerPlugin'
  );
  if (ngCompilerPluginInstance) {
    ngCompilerPluginInstance._entryModule = options.modulePath;
  }

  // preserve path to entry point
  // so that we can clear use it within `run` method to clear that file
  entryPointPath = config.entry.main[0];

  const [modulePath, moduleName] = options.modulePath.split('#');

  const factoryPath = `${
    modulePath.includes('.') ? modulePath : `${modulePath}/${modulePath}`
    }.ngfactory`;
  const entryPointContents = `
       export * from '${modulePath}';
       export * from '${factoryPath}';
       import { ${moduleName}NgFactory } from '${factoryPath}';
       export default ${moduleName}NgFactory;
    `;
  patchEntryPoint(entryPointContents);

  config.output.filename = `${pluginName}.js`;
  config.output.library = pluginName;
  config.output.libraryTarget = 'umd';
  // workaround to support bundle on nodejs
  config.output.globalObject = `(typeof self !== 'undefined' ? self : this)`;
}

export default createBuilder<Options>(buildPlugin);
