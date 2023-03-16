/*
 * Copyright 2017 The Kubernetes Authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import {NavbarPage} from '../pages/navbarPage';

describe('Navbar', () => {
  before(() => {
    NavbarPage.visitHome();
  });

  describe('Cluster Items', () => {
    it('cluster', () => {
      NavbarPage.clickItem(NavbarPage.clusterItemId);
      NavbarPage.assertUrlContains('cluster');
    });

    it('clusterroles', () => {
      NavbarPage.clickItem(NavbarPage.clusterroleItemId);
      NavbarPage.assertUrlContains('clusterrole');
    });

    it('namespaces', () => {
      NavbarPage.clickItem(NavbarPage.namespaceItemId);
      NavbarPage.assertUrlContains('namespace');
    });

    it('nodes', () => {
      NavbarPage.clickItem(NavbarPage.nodeItemId);
      NavbarPage.assertUrlContains('node');
    });

    it('persistentvolume', () => {
      NavbarPage.clickItem(NavbarPage.persistentvolumeItemId);
      NavbarPage.assertUrlContains('persistentvolume');
    });

    it('storageclass', () => {
      NavbarPage.clickItem(NavbarPage.storageclassItemId);
      NavbarPage.assertUrlContains('storageclass');
    });
  });
  describe('Workload and Namespace Items', () => {
    it('workload', () => {
      NavbarPage.clickItem(NavbarPage.workloadsItemId);
      NavbarPage.assertUrlContains('workload');
    });

    // TODO: passes locally but often fails in the CI. Needs to be investigated and fixed.
    xit('namespace selector', () => {
      const ns = 'kube-public';
      NavbarPage.visitHome();
      NavbarPage.clickItem(NavbarPage.namespaceSelectorItemId);
      NavbarPage.clickSelectorItem(ns);
      NavbarPage.assertUrlContains('?namespace=' + ns);
      NavbarPage.visitHome();
    });
  });
  describe('Workloads Items', () => {
    it('workloads', () => {
      NavbarPage.clickItem(NavbarPage.workloadsItemId);
      NavbarPage.assertUrlContains('workloads');
    });

    it('cronjob', () => {
      NavbarPage.clickItem(NavbarPage.cronjobItemId);
      NavbarPage.assertUrlContains('cronjob');
    });

    it('daemonset', () => {
      NavbarPage.clickItem(NavbarPage.daemonsetItemId);
      NavbarPage.assertUrlContains('daemonset');
    });

    it('deployment', () => {
      NavbarPage.clickItem(NavbarPage.deploymentItemId);
      NavbarPage.assertUrlContains('deployment');
    });

    it('job', () => {
      NavbarPage.clickItem(NavbarPage.jobItemId);
      NavbarPage.assertUrlContains('job');
    });

    it('pod', () => {
      NavbarPage.clickItem(NavbarPage.podItemId);
      NavbarPage.assertUrlContains('pod');
    });

    it('replicaset', () => {
      NavbarPage.clickItem(NavbarPage.replicasetItemId);
      NavbarPage.assertUrlContains('replicaset');
    });

    it('replicationcontroller', () => {
      NavbarPage.clickItem(NavbarPage.replicationcontrollerItemId);
      NavbarPage.assertUrlContains('replicationcontroller');
    });

    it('statefulset', () => {
      NavbarPage.clickItem(NavbarPage.statefulsetItemId);
      NavbarPage.assertUrlContains('statefulset');
    });
  });

  describe('Discovery and Load balancing  Items', () => {
    it('discovery', () => {
      NavbarPage.clickItem(NavbarPage.discoveryItemId);
      NavbarPage.assertUrlContains('discovery');
    });

    it('ingress', () => {
      NavbarPage.clickItem(NavbarPage.ingressItemId);
      NavbarPage.assertUrlContains('ingress');
    });

    it('service', () => {
      NavbarPage.clickItem(NavbarPage.serviceItemId);
      NavbarPage.assertUrlContains('service');
    });
  });

  describe('Config and Storage  Items', () => {
    it('config', () => {
      NavbarPage.clickItem(NavbarPage.configItemId);
      NavbarPage.assertUrlContains('config');
    });

    it('configmap', () => {
      NavbarPage.clickItem(NavbarPage.configmapItemId);
      NavbarPage.assertUrlContains('configmap');
    });

    it('persistentvolumeclaim', () => {
      NavbarPage.clickItem(NavbarPage.persistentvolumeclaimItemId);
      NavbarPage.assertUrlContains('persistentvolumeclaim');
    });

    it('secret', () => {
      NavbarPage.clickItem(NavbarPage.secretItemId);
      NavbarPage.assertUrlContains('secret');
    });
  });

  describe('Misc Items', () => {
    it('customresourcedefinition', () => {
      NavbarPage.clickItem(NavbarPage.customresourcedefinitionItemId);
      NavbarPage.assertUrlContains('customresourcedefinition');
    });

    it('settings', () => {
      NavbarPage.clickItem(NavbarPage.settingsItemId);
      NavbarPage.assertUrlContains('settings');
    });
  });
});
