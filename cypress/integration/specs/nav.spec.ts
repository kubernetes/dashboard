
import {NavbarPage} from "../../pages/navbarPage";

// Check Cluster items links in nav
describe("Navbar", () => {
  before(() => {
    NavbarPage.visit();
  });
  describe("Navbar Cluster Items", () => {
    it("cluster", () => {
      NavbarPage.clickNavItemById('nav-cluster');
      NavbarPage.assertUrlContains('cluster');
    });
    it("clusterroles", () => {
      NavbarPage.clickNavItemById('nav-clusterrole');
      NavbarPage.assertUrlContains('clusterrole')
    });
    it("namespaces", () => {
      NavbarPage.clickNavItemById('nav-namespace');
      NavbarPage.assertUrlContains('namespace')
    });
    it("nodes", () => {
      NavbarPage.clickNavItemById('nav-node');
      NavbarPage.assertUrlContains('node')
    });
    it("persistentvolume", () => {
      NavbarPage.clickNavItemById('nav-persistentvolume');
      NavbarPage.assertUrlContains('persistentvolume')
    });
    it("storageclass", () => {
      NavbarPage.clickNavItemById('nav-storageclass');
      NavbarPage.assertUrlContains('storageclass')
    });
  });
})
