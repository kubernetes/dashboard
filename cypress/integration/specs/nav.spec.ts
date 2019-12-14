import {NavbarPage} from '../../pages/navbarPage';

describe('Navbar', () => {
  before(() => {
    NavbarPage.visitHome();
  });
  describe('Navbar Cluster Items', () => {
    it('cluster', () => {
      NavbarPage.clickItemById('#nav-cluster');
      NavbarPage.assertUrlContains('cluster');
    });
    it('clusterroles', () => {
      NavbarPage.clickItemById('#nav-clusterrole');
      NavbarPage.assertUrlContains('clusterrole');
    });
    it('namespaces', () => {
      NavbarPage.clickItemById('#nav-namespace');
      NavbarPage.assertUrlContains('namespace');
    });
    it('nodes', () => {
      NavbarPage.clickItemById('#nav-node');
      NavbarPage.assertUrlContains('node');
    });
    it('persistentvolume', () => {
      NavbarPage.clickItemById('#nav-persistentvolume');
      NavbarPage.assertUrlContains('persistentvolume');
    });
    it('storageclass', () => {
      NavbarPage.clickItemById('#nav-storageclass');
      NavbarPage.assertUrlContains('storageclass');
    });
  });
  describe('Navbar Overview and Namespace Items', () => {
    it('overview', () => {
      NavbarPage.clickItemById('#nav-overview');
      NavbarPage.assertUrlContains('overview');
    });
    // Namespace selector
    it('namespace selector', () => {
      const ns = 'kube-public';
      NavbarPage.visitHome();
      NavbarPage.clickItemById('#nav-namespace-selector');
      NavbarPage.clickSelectorItem(ns);
      NavbarPage.assertUrlContains('?namespace=' + ns);
      NavbarPage.visitHome();
    });
  });
  describe('Navbar Workloads Items', () => {
    it('workloads', () => {
      NavbarPage.clickItemById('#nav-workloads');
      NavbarPage.assertUrlContains('workloads');
    });
    it('cronjob', () => {
      NavbarPage.clickItemById('#nav-cronjob');
      NavbarPage.assertUrlContains('cronjob');
    });
    it('daemonset', () => {
      NavbarPage.clickItemById('#nav-daemonset');
      NavbarPage.assertUrlContains('daemonset');
    });
    it('deployment', () => {
      NavbarPage.clickItemById('#nav-deployment');
      NavbarPage.assertUrlContains('deployment');
    });

    it('job', () => {
      NavbarPage.clickItemById('#nav-job');
      NavbarPage.assertUrlContains('job');
    });

    it('pod', () => {
      NavbarPage.clickItemById('#nav-pod');
      NavbarPage.assertUrlContains('pod');
    });
    it('replicaset', () => {
      NavbarPage.clickItemById('#nav-replicaset');
      NavbarPage.assertUrlContains('replicaset');
    });
    it('replicationcontroller', () => {
      NavbarPage.clickItemById('#nav-replicationcontroller');
      NavbarPage.assertUrlContains('replicationcontroller');
    });
    it('statefulset', () => {
      NavbarPage.clickItemById('#nav-statefulset');
      NavbarPage.assertUrlContains('statefulset');
    });
  });
  describe('Navbar Discovery and Load balancing  Items', () => {
    it('discovery', () => {
      NavbarPage.clickItemById('#nav-discovery');
      NavbarPage.assertUrlContains('discovery');
    });

    it('ingress', () => {
      NavbarPage.clickItemById('#nav-ingress');
      NavbarPage.assertUrlContains('ingress');
    });
    it('service', () => {
      NavbarPage.clickItemById('#nav-service');
      NavbarPage.assertUrlContains('service');
    });
  });

  describe('Navbar Config and Storage  Items', () => {
    it('config', () => {
      NavbarPage.clickItemById('#nav-config');
      NavbarPage.assertUrlContains('config');
    });
    it('configmap', () => {
      NavbarPage.clickItemById('#nav-configmap');
      NavbarPage.assertUrlContains('configmap');
    });

    it('persistentvolumeclaim', () => {
      NavbarPage.clickItemById('#nav-persistentvolumeclaim');
      NavbarPage.assertUrlContains('persistentvolumeclaim');
    });

    it('secret', () => {
      NavbarPage.clickItemById('#nav-secret');
      NavbarPage.assertUrlContains('secret');
    });
  });
  describe('Navbar Misc Items', () => {
    // TODO: Add a conditional check for plugin item here
    // it('plugin', () => {
    //   NavbarPage.clickNavItemById('#nav-plugin');
    //   NavbarPage.assertUrlContains('plugin');
    // });
    it('customresourcedefinition', () => {
      NavbarPage.clickItemById('#nav-customresourcedefinition');
      NavbarPage.assertUrlContains('customresourcedefinition');
    });
    it('settings', () => {
      NavbarPage.clickItemById('#nav-settings');
      NavbarPage.assertUrlContains('settings');
    });
    it('about', () => {
      NavbarPage.clickItemById('#nav-about');
      NavbarPage.assertUrlContains('about');
    });
  });
});
