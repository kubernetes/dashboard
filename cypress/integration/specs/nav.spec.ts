import {NavbarPage} from '../../pages/navbarPage';

describe('Navbar', () => {
  before(() => {
    NavbarPage.visitHome();
  });
  describe('Navbar Cluster Items', () => {
    it('cluster', () => {
      NavbarPage.clickNavItemById('#nav-cluster');
      NavbarPage.assertUrlContains('cluster');
    });
    it('clusterroles', () => {
      NavbarPage.clickNavItemById('#nav-clusterrole');
      NavbarPage.assertUrlContains('clusterrole');
    });
    it('namespaces', () => {
      NavbarPage.clickNavItemById('#nav-namespace');
      NavbarPage.assertUrlContains('namespace');
    });
    it('nodes', () => {
      NavbarPage.clickNavItemById('#nav-node');
      NavbarPage.assertUrlContains('node');
    });
    it('persistentvolume', () => {
      NavbarPage.clickNavItemById('#nav-persistentvolume');
      NavbarPage.assertUrlContains('persistentvolume');
    });
    it('storageclass', () => {
      NavbarPage.clickNavItemById('#nav-storageclass');
      NavbarPage.assertUrlContains('storageclass');
    });
  });
  describe('Navbar Overview and Namespace Items', () => {
    it('overview', () => {
      NavbarPage.clickNavItemById('#nav-overview');
      NavbarPage.assertUrlContains('overview');
    });
    // Namespace selector
    it('namespace selector', () => {
      const ns = 'kube-public';
      NavbarPage.visitHome();
      NavbarPage.clickNavItemById('#nav-namespace-selector');
      NavbarPage.clickSelectorItem(ns);
      NavbarPage.assertUrlContains('?namespace=' + ns);
      NavbarPage.visitHome();
    });
  });
  describe('Navbar Workloads Items', () => {
    it('workloads', () => {
      NavbarPage.clickNavItemById('#nav-workloads');
      NavbarPage.assertUrlContains('workloads');
    });
    it('cronjob', () => {
      NavbarPage.clickNavItemById('#nav-cronjob');
      NavbarPage.assertUrlContains('cronjob');
    });
    it('daemonset', () => {
      NavbarPage.clickNavItemById('#nav-daemonset');
      NavbarPage.assertUrlContains('daemonset');
    });
    it('deployment', () => {
      NavbarPage.clickNavItemById('#nav-deployment');
      NavbarPage.assertUrlContains('deployment');
    });

    it('job', () => {
      NavbarPage.clickNavItemById('#nav-job');
      NavbarPage.assertUrlContains('job');
    });

    it('pod', () => {
      NavbarPage.clickNavItemById('#nav-pod');
      NavbarPage.assertUrlContains('pod');
    });
    it('replicaset', () => {
      NavbarPage.clickNavItemById('#nav-replicaset');
      NavbarPage.assertUrlContains('replicaset');
    });
    it('replicationcontroller', () => {
      NavbarPage.clickNavItemById('#nav-replicationcontroller');
      NavbarPage.assertUrlContains('replicationcontroller');
    });
    it('statefulset', () => {
      NavbarPage.clickNavItemById('#nav-statefulset');
      NavbarPage.assertUrlContains('statefulset');
    });
  });
  describe('Navbar Discovery and Load balancing  Items', () => {
    it('discovery', () => {
      NavbarPage.clickNavItemById('#nav-discovery');
      NavbarPage.assertUrlContains('discovery');
    });

    it('ingress', () => {
      NavbarPage.clickNavItemById('#nav-ingress');
      NavbarPage.assertUrlContains('ingress');
    });
    it('service', () => {
      NavbarPage.clickNavItemById('#nav-service');
      NavbarPage.assertUrlContains('service');
    });
  });

  describe('Navbar Config and Storage  Items', () => {
    it('config', () => {
      NavbarPage.clickNavItemById('#nav-config');
      NavbarPage.assertUrlContains('config');
    });
    it('configmap', () => {
      NavbarPage.clickNavItemById('#nav-configmap');
      NavbarPage.assertUrlContains('configmap');
    });

    it('persistentvolumeclaim', () => {
      NavbarPage.clickNavItemById('#nav-persistentvolumeclaim');
      NavbarPage.assertUrlContains('persistentvolumeclaim');
    });

    it('secret', () => {
      NavbarPage.clickNavItemById('#nav-secret');
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
      NavbarPage.clickNavItemById('#nav-customresourcedefinition');
      NavbarPage.assertUrlContains('customresourcedefinition');
    });
    it('settings', () => {
      NavbarPage.clickNavItemById('#nav-settings');
      NavbarPage.assertUrlContains('settings');
    });
    it('about', () => {
      NavbarPage.clickNavItemById('#nav-about');
      NavbarPage.assertUrlContains('about');
    });
  });
});
