name: Bug report
description: Create a report to help us improve AboutIAM
body:
  - type: markdown
    attributes:
      value: |
        Thank you for reporting a bug! Please fill out the form below as completely as possible to help us diagnose and fix the issue.
  - type: textarea
    id: description
    attributes:
      label: Bug Description
      description: A clear and concise description of what the bug is.
    validations:
      required: true
  - type: textarea
    id: steps
    attributes:
      label: Steps to Reproduce
      description: Explain how we can reproduce this issue step-by-step.
      placeholder: |
        1. Go to '/playground'
        2. Click on 'JWT Studio'
        3. Try signing with 'RS256' using parameter X
        4. See error...
    validations:
      required: true
  - type: textarea
    id: expected
    attributes:
      label: Expected Behavior
      description: What did you expect to happen?
    validations:
      required: true
  - type: dropdown
    id: environment
    attributes:
      label: Operating System / Browser
      description: What browser and device were you using when the issue occurred?
      options:
        - Chrome (Desktop)
        - Safari (Desktop)
        - Firefox (Desktop)
        - Edge (Desktop)
        - iOS Safari (Mobile)
        - Android Chrome (Mobile)
        - Other (explain in details)
    validations:
      required: true
  - type: textarea
    id: details
    attributes:
      label: Additional Context
      description: Any other logs, screenshots, or context that might be helpful.
