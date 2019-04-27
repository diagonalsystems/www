---
title: How to Set Up Federated Single Sign-On to AWS Using G Suite
date: 2019-04-26
author: jonathan@diagonal.sh
blurb: Not only does this removes the need for your users to remember yet another user name and password, it also streamlines identity management.
category: DevSecOps
tags:
  - AWS
  - SSO
  - GSuite
---

If your team is already using G Suite as it's organization's directory, you might want to leverage it's SSO capabilities to authenticate with the AWS management console and API. 

Users who have SSO access will see an additional app in their G Suite account. The icon authenticates with and redirects them to the AWS Management Console with a given role.

Not only does this removes the need for your users to remember yet another user name and password, it also streamlines identity management.

This blog post will show you how you can set up federated SSO to your AWS resources using G Suite accounts.

### What you will need

This post assumes you already have administrative rights to both an AWS and a G Suite account. You will be calling the G Suite [Directory API][directory-api], which can be done through the web interface. If you want to automate this, you will need [API credentials][google-api-auth].

Here is a quick overview of the steps we will be going through:

1. Make AWS and G Suite aware of each other
2. Create mappings between user profiles and AWS SAML attributes
3. Create an AWS app in G Suite
4. Create and assign new IAM roles


---


### Make AWS and G Suite aware of each other


##### Retrieve the G Suite SAML metadata

In your G Suite Admin dashboard, go to `Security > Set up single sign-on (SSO)` and click on the button labeled "DOWNLOAD IDP METADATA". This will download an XML document that you will need in the next step.

##### Create an Identity Provider in AWS

Sign-in to the AWS management console and go to the IAM dashboard.
Under `Identity providers`, click on the `Create Provider` button, select SAML as the provider type and upload the XML file you just got from G Suite. Take note of the ARN of your newly created identity provider.


### Create mappings between user profiles and AWS SAML attributes

##### Add the AWS SAML attributes to your G Suite user profile

Next, we want to create a custom schema with a role attribute to refer to AWS IAM roles.

You can create this JSON schema by sending a [POST request to the /customer/:customerId/schemas][schemas-insert] endpoint with the following JSON document. 

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

### Create an AWS app in G Suite

Next, we will add AWS to the list of apps in G Suite for the users who are allowed access. Go to `Apps` in the G Suite Admin console, select `SAML apps` and click the `+` button. You will get a modal with a list of service providers. Select Amazon Web Services from that list.

Map the `RoleSessionName attribute` to the user's email adddress. (`Basic Information > Primary Email`). This will provide us with AWS CloudTrail traceability. Then map the `Role` attribute with the schema we created earlier (`AWS SSO > role`). 

##### Activate the new AWS App for teams

The new AWS App will be deactivated by default for everyone.
Follow the "View the status for each org" link and turn the service status ON for the appropriate organization units.

<img alt="Follow the 'View the status for each org' link"  src="/images/posts/aws-gsuite-federated-sso/settings-aws-saml-gsuite-app.png">

### Create and assign new IAM roles

Go back to AWS IAM, create a new role and select SAML 2.0 federation as the type of trusted entity. 

By selecting the SAML provider we created previously, the following Policy Document will be generated and assigned to the Trust Relationship of the role.

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

This is saying: "If someone is authenticated through the G Suite Identity Provider, and G Suite says that they can assume this role, then let them".

##### Assign roles to users

To change a G Suite user's assigned IAM roles, send a [PATCH request to the /users/:userKey][users-patch] endpoint. The `userKey` should be the email address of the user.

Each role value should be a concatenation of the role's ARN and the provider's ARN seperated with a comma.

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

### Start using the AWS console with G Suite SSO

Anytime you need to sign-in to AWS, you can now simply go your Google account, click on the apps button next to your profile picture and select "Amazon Web Services" from the list. This will ask you for your Google credentials and then redirect you to the AWS console, authenticated as the role that was assigned to your G Suite user. 

Enjoy!


[directory-api]: https://developers.google.com/admin-sdk/directory/
[google-api-auth]: https://developers.google.com/identity/protocols/OAuth2
[schemas-insert]: https://developers.google.com/admin-sdk/directory/v1/reference/schemas/insert
[users-patch]: https://developers.google.com/admin-sdk/directory/v1/reference/users/patch
