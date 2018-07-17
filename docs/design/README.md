# Dashboard Design Guide
This guide is for anyone interested in contributing design work themselves or contributing in a way that is impacted by design.

## Resources:
* Get in touch with Dan Romlein (@danielromlein) for general Dashboard UX questions or suggestions of tasks that need design work.
* Follow the [Getting started guide](https://github.com/kubernetes/dashboard/wiki/Getting-started) to get the most recent version of Dashboard up and running.
* Dashboard is based on Google’s [Material](https://material.io/guidelines/) design system. Refer to their spec for guidance. 

## Process:
1. **Have an idea for a new feature** 💡
2. **Create a _New Issue_ in the [Dashboard repo](https://github.com/kubernetes/dashboard)** ✍️
      * If available, this should include…
        * The why of the new feature (required).
        * Use case(s).
        * User flow(s).
      * Someone from the core Dashboard team will review this new feature, ask clarifying questions, and provide feedback via comments indicating whether or not the feature should be pursued. If they agree it's something that should be done...
3. **Sign the [CNCF Contributor License Agreement](https://github.com/kubernetes/community/blob/master/CLA.md) (CLA)** 🖋 
4. **Create a Product Requirement Doc** ✅
     * If you’re comfortable making a [Pull Request](https://help.github.com/articles/creating-a-pull-request/), great! If that process intimidates you though, no problem: write up the Product Requirement in Markdown and attach that to the original issue, and someone from the core team will convert that into a PRD in `dashboard/docs/design/`
     * PRD should include:
       * The _why_ of the new feature.
       * Use case(s).
       * User flow(s).
       * Optional: Mockups / sketches. 
         * Free interactive prototyping tool [InVision](https://www.invisionapp.com/) is the preferred method of mocking up designs and soliciting feedback. It allows us to keep one continually up-to-date source of truth for the mockups. 
5. **Discuss with the community** 💬
     * Dialogue with other contributors via comments on the PRD Pull Request.
6. **Pull Request merged** ⤴️
     * Once consensus is reached by stakeholders, the PRD will be announced as complete and ready to have a developer pick it up and start implementation. The PRD will serve as the source of truth throughout dev execution.
     * Once reviewed by someone on the Dashboard team, the PR will be merged into the Dashboard master branch by one of the core contributors.

7. **Implement** 🔨
     * The dev picking up the feature will create another issue for implementing the mockups into frontend code.
8. **User test** 🙋
     * Usability testing comes in the form of feedback from contributors.
     * These could be either comments on the implementation issue or on the PRD pull request.

9. **Iterate** 🔁
