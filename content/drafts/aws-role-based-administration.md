---
title: Working with AWS IAM Identities
date: 2019-04-26
author: jonathan@diagonal.sh
tags:
  - AWS
  - IAM
---

AWS Account root user
  - View your account's billing information.
  - Modify root user details

users
  - Jonathan
    - access keys
    - no password
    - assigned to federated user

groups
  - Developers
    - policies
      - AssumeRoleWithSAML

roles
  - ReadOnly
  - Terraform
  - Administrator
