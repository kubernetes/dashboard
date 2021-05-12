# Plugin Docs

* [Installation](#installation)
* [Compiling Plugins](#compiling-plugins)
* [Registering Plugin](#registering-plugin)
* [Creating ConfigMap](#creating-configmap)

### Installation

To enable plugin support in the dashboard you must register a custom [CRD](../../aio/test-resources/plugin-crd.yml) in your cluster.

```shell
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/master/aio/test-resources/plugin-crd.yml
```

### Compiling Plugins

In order to take advantage of AOT compilation, sharing the code across plugins and not ship the core Angular packages with the plugin bundle, there is a custom build process to compile the plugins.
You can clone this repository and checkout to [`plugin/base`](https://github.com/kubernetes/dashboard/tree/plugin/base) branch. The build process is specified under [`builders`](https://github.com/kubernetes/dashboard/tree/plugin/base/builders) directory.

On this branch, you can compile the plugin with following command

```shell
ng build plugin && ng build --project custom-plugin --prod --modulePath="k8s-plugin#PluginModule" --pluginName="k8s-plugin" --outputPath="./dist/bundle"
ng build --project custom-plugin --prod --modulePath="./plugin1/plugin1.module#Plugin1Module" --pluginName="plugin1" --sharedLibs="k8s-plugin" --outputPath="./dist/bundle"
```

The key thing here is that we specify the `custom-plugin` project in the `angular.json` to use our custom builder. Make sure to keep the config similar when developing your own plugins.

### Registering Plugin

Once the custom CRD is registered we can now create [instances](../../aio/test-resources/plugin-test.yml) of the CRD which will hold the spec for plugin.

```shell
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/master/aio/test-resources/plugin-test.yml
```

> Note: The backend reads the compiled plugin source from a ConfigMap and we need to create that also.

### Creating ConfigMap

We can now create config-maps to hold the compiled plugin source code.

```shell
kubectl create configmap k8s-plugin-src --from-file="./dist/bundle/k8s-plugin.js"
kubectl create configmap plugin1-src --from-file="./dist/bundle/plugin1.js"
```

After following all the above steps, your new plugin should be available in the dashboard.

----
_Copyright 2021 [The Kubernetes Dashboard Authors](https://github.com/kubernetes/dashboard/graphs/contributors)_