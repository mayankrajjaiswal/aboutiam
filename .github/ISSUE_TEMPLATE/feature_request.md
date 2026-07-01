name: Feature request
description: Propose a new feature, playground, or learning module for AboutIAM
body:
  - type: markdown
    attributes:
      value: |
        Have an idea to make AboutIAM even better? We'd love to hear it!
  - type: textarea
    id: concept
    attributes:
      label: Feature Concept
      description: A clear and concise explanation of what the proposed feature is.
    validations:
      required: true
  - type: textarea
    id: problem
    attributes:
      label: Problem Statement
      description: Is this feature solving a specific problem or friction point for users? (e.g., OIDC is hard to visualize on mobile).
    validations:
      required: false
  - type: textarea
    id: solution
    attributes:
      label: Proposed Solution / Visual Layout
      description: Detail how this feature should look and function in the AboutIAM client. Feel free to describe UI layout or interactions.
    validations:
      required: true
  - type: textarea
    id: benefit
    attributes:
      label: Target Audience Benefit
      description: How does this help beginners or experts using the site?
    validations:
      required: true
