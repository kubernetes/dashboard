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
