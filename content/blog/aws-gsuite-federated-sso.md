---
title: How to Set Up Federated Single Sign-On to AWS Using G Suite
date: 2019-04-26
author: jonathan@diagonal.sh
tags:
  - AWS
  - SSO
  - GSuite
---

You can provide one-click SSO for AWS to your team by using your existing G Suite credentials. Users to whom you grant SSO access will see an additional app in their G Suite account. When they click it's icon, they will be redirected to the AWS Management Console and authenticated with a given role.

This not only obviates the need for your users to remember yet another user name and password, but it also streamlines identity management for your administrators. 

This blog post will show you how you can use G Suite to set up federated SSO to your AWS resources.

### What you will need

This post assumes you already have administrative rights to both an AWS and a G Suite account. You will be calling the G Suite [Directory API][directory-api] which can be done through the web interface (). But if you want to automate this, you will need API credentials.

Here is a quick overview of the steps we will be going through:

1. Make AWS and G Suite aware of each other
3. Create mappings between user profiles and AWS SAML attributes
4. Create an AWS app in G Suite
5. Create new IAM roles
6. Assign roles to users 

### Retrieve the G Suite SAML metadata

In the form of an XML document that you will upload to AWS.

### Create an Identity Provider in AWS

Register your G Suite account as an identity provider.
Upload the XML document you got from G Suite.

### Add the AWS SAML attributes to your G Suite user profile

We want to map the RoleSessionName attribute to the user's email adddress. This will provide us with AWS CloudTrail traceability.

We also need a custom schema with a role attribute to refer to AWS IAM roles.

You can create this JSON schema by posting the following JSON document to the [/customer/:customerId/schemas][schemas-insert] endpoint. 

```json
{
  "displayName": "AWS SSO",
  "schemaName": "AWS SSO",
  "fields":
    [
      {
        "fieldName": "role",
        "fieldType": "STRING",
        "readAccessType": "ADMINS_AND_SELF",    
        "multiValued": true
      }
  ]
}
```

### Set up the SAML app in G Suite

This will add AWS to the list of apps in G Suite for the users who are allowed access.

### Create an IAM role in your AWS account

This is where you determine which role a given user is allowed to assume.

Create Role > SAML 2.0 federation 

By selected the Identity Provider you have created previously, the following Policy Document will be created and assigned to the Trust Relationship of the role.

It's saying: If someone is authenticated through the G Suite Identity Provider, and G Suite says that they can assume this role, then let them.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::1234567890:saml-provider/GSuite"
      },
      "Action": "sts:AssumeRoleWithSAML",
      "Condition": {
        "StringEquals": {
          "SAML:aud": "https://signin.aws.amazon.com/saml"
        }
      }
    }
  ]
}
```

### Grant user access

Specify which organizational units are allowed access to AWS.

### Assign Roles

To change a user's assigned IAM roles, send a [PATCH request to users endpoint][users-patch] (`/users/:userKey`). The `userKey` should be the email address of the user.

Each role value should be the role's ARN and the provider's ARN seperated with a comma.

```
{
  "customSchemas": {
    "SSO": {
      "role": [
        {
         "customType": "MyRole",
         "value": "<role arn>,<provider arn>"
        }
      ]
  }
}
```



[directory-api]: https://developers.google.com/admin-sdk/directory/
[schemas-insert]: https://developers.google.com/admin-sdk/directory/v1/reference/schemas/insert
[users-patch]: https://developers.google.com/admin-sdk/directory/v1/reference/users/patch
