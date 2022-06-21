Feature: Cluster page

  Scenario: Navigating to the cluster page
    Given I open "home" page
    When I click "nav-cluster"
    Then I see "cluster" in the url
    And I see "Cluster" in the element "kd-breadcrumbs"

  Scenario: Navigating to the cluster role binding page
    Given I open "home" page
    When I click "nav-cluster-role-binding"
    Then I see "clusterrolebinding" in the url
    And I see "Cluster Role Bindings" in the element "kd-breadcrumbs"

  Scenario: Navigating to the cluster role page
    Given I open "home" page
    When I click "nav-cluster-role"
    Then I see "clusterrole" in the url
    And I see "Cluster Role" in the element "kd-breadcrumbs"

  Scenario: Navigating to the namespace page
    Given I open "home" page
    When I click "nav-namespace"
    Then I see "namespace" in the url
    And I see "Namespace" in the element "kd-breadcrumbs"

  Scenario: Navigating to the node page
    Given I open "home" page
    When I click "nav-node"
    Then I see "node" in the url
    And I see "Node" in the element "kd-breadcrumbs"

  Scenario: Navigating to the persistent volume page
    Given I open "home" page
    When I click "nav-persistentvolume"
    Then I see "persistentvolume" in the url
    And I see "Persistent Volume" in the element "kd-breadcrumbs"

  Scenario: Navigating to the storage class page
    Given I open "home" page
    When I click "nav-storageclass"
    Then I see "storageclass" in the url
    And I see "Storage Class" in the element "kd-breadcrumbs"
