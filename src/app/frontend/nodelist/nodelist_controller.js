/**
 * Controller for the node list view
 */
export default class NodeListController {
  /**
   * @ngInject
   */
  constructor() {
    /** @export {!Array<{title:string, link:string}>} */
    this.learnMoreLinks = [
      {title: 'Dashboard Tour', link: "#"},
      {title: 'Deploying your App', link: "#"},
      {title: 'Monitoring your App', link: "#"},
      {title: 'Troubleshooting', link: "#"},
    ];
  }
}
