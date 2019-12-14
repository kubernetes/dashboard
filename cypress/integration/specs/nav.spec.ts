import {NavbarPage} from '../../pages/navbarPage';

describe('Navbar', () => {
  before(() => {
    NavbarPage.visitHome();
  });
  describe('Navbar Cluster Items', () => {
    it('cluster', () => {
      NavbarPage.clickItem('#nav-cluster');
      NavbarPage.assertUrlContains('cluster');
    });
    it('clusterroles', () => {
      NavbarPage.clickItem('#nav-clusterrole');
      NavbarPage.assertUrlContains('clusterrole');
    });
    it('namespaces', () => {
      NavbarPage.clickItem('#nav-namespace');
      NavbarPage.assertUrlContains('namespace');
    });
    it('nodes', () => {
      NavbarPage.clickItem('#nav-node');
      NavbarPage.assertUrlContains('node');
    });
    it('persistentvolume', () => {
      NavbarPage.clickItem('#nav-persistentvolume');
      NavbarPage.assertUrlContains('persistentvolume');
    });
    it('storageclass', () => {
      NavbarPage.clickItem('#nav-storageclass');
      NavbarPage.assertUrlContains('storageclass');
    });
  });
  describe('Navbar Overview and Namespace Items', () => {
    it('overview', () => {
      NavbarPage.clickItem('#nav-overview');
      NavbarPage.assertUrlContains('overview');
    });
    // Namespace selector
    it('namespace selector', () => {
      const ns = 'kube-public';
      NavbarPage.visitHome();
      NavbarPage.clickItem('#nav-namespace-selector');
      NavbarPage.clickSelectorItem(ns);
      NavbarPage.assertUrlContains('?namespace=' + ns);
      NavbarPage.visitHome();
    });
  });
  describe('Navbar Workloads Items', () => {
    it('workloads', () => {
      NavbarPage.clickItem('#nav-workloads');
      NavbarPage.assertUrlContains('workloads');
    });
    it('cronjob', () => {
      NavbarPage.clickItem('#nav-cronjob');
      NavbarPage.assertUrlContains('cronjob');
    });
    it('daemonset', () => {
      NavbarPage.clickItem('#nav-daemonset');
      NavbarPage.assertUrlContains('daemonset');
    });
    it('deployment', () => {
      NavbarPage.clickItem('#nav-deployment');
      NavbarPage.assertUrlContains('deployment');
    });

    it('job', () => {
      NavbarPage.clickItem('#nav-job');
      NavbarPage.assertUrlContains('job');
    });

    it('pod', () => {
      NavbarPage.clickItem('#nav-pod');
      NavbarPage.assertUrlContains('pod');
    });
    it('replicaset', () => {
      NavbarPage.clickItem('#nav-replicaset');
      NavbarPage.assertUrlContains('replicaset');
    });
    it('replicationcontroller', () => {
      NavbarPage.clickItem('#nav-replicationcontroller');
      NavbarPage.assertUrlContains('replicationcontroller');
    });
    it('statefulset', () => {
      NavbarPage.clickItem('#nav-statefulset');
      NavbarPage.assertUrlContains('statefulset');
    });
  });
  describe('Navbar Discovery and Load balancing  Items', () => {
    it('discovery', () => {
      NavbarPage.clickItem('#nav-discovery');
      NavbarPage.assertUrlContains('discovery');
    });

    it('ingress', () => {
      NavbarPage.clickItem('#nav-ingress');
      NavbarPage.assertUrlContains('ingress');
    });
    it('service', () => {
      NavbarPage.clickItem('#nav-service');
      NavbarPage.assertUrlContains('service');
    });
  });

  describe('Navbar Config and Storage  Items', () => {
    it('config', () => {
      NavbarPage.clickItem('#nav-config');
      NavbarPage.assertUrlContains('config');
    });
    it('configmap', () => {
      NavbarPage.clickItem('#nav-configmap');
      NavbarPage.assertUrlContains('configmap');
    });

    it('persistentvolumeclaim', () => {
      NavbarPage.clickItem('#nav-persistentvolumeclaim');
      NavbarPage.assertUrlContains('persistentvolumeclaim');
    });

    it('secret', () => {
      NavbarPage.clickItem('#nav-secret');
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
      NavbarPage.clickItem('#nav-customresourcedefinition');
      NavbarPage.assertUrlContains('customresourcedefinition');
    });
    it('settings', () => {
      NavbarPage.clickItem('#nav-settings');
      NavbarPage.assertUrlContains('settings');
    });
    it('about', () => {
      NavbarPage.clickItem('#nav-about');
      NavbarPage.assertUrlContains('about');
    });
  });
});
