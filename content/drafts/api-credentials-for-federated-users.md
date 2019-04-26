---
title: AWS Temporary API Credentials for Federated Users
date: 2019-04-26
author: jonathan@diagonal.sh
tags:
  - AWS
  - SSO
---

AssumeRoleWithWebIdentity

Assuming that the identity provider validates the token, AWS returns the following information to you:

1. A set of temporary security credentials. These consist of an access key ID, a secret access key, and a session token.
2. The role ID and the ARN of the assumed role.
3. A SubjectFromWebIdentityToken value that contains the unique user ID.


Temporary security credentials are valid for a specified duration and for a specific set of permissions.


DurationSeconds 
RoleArn 
RoleSessionName
WebIdentityToken

You will need a script for this.


A CLI starts a HTTP listener on a random port and a browser window to the AWS credentials broker with a localhost callback URI to its HTTP listener.
The AWS credentials broker uses its Google OAuth2 client credentials to authenticate the user and get an OpenID Connect (OIDC) token for the user.
Once a user has been authenticated with Google the AWS credentials broker uses its Admin Service Account user to list the SAML roles associated with the now authenticated user.
If the user has more than one role, the AWS credentials broker allows the user to select which account role they want to assume using a React based UI.
When a user has picked a role to assume, the Google OIDC token for the user is given to AWS STS to assume the role using STS’s web identity federation.
The user is then redirected to the localhost callback URI supplied at the beginning with the temporary credentials. The CLI can then save them in the users’ AWS credentials file ~/.aws/credentials for use with the AWS CLI or SDK as they would with standard access keys.

~/.aws/credentials

```
[default]
output = json
region = us-east-1
aws_access_key_id =
aws_secret_access_key =
```

IdP-initiated login

https://signin.aws.amazon.com/saml

https://accounts.google.com/o/saml2/initsso?idpid=C03klxshw&spid=899713224333&forceauthn=false


getting a Google Service Account for the credentials broker to read the SAML role mappings in the Google Admin User Directory.


session.headers['User-Agent'] = 'AWS Sign-in'


https://accounts.google.com/o/saml2/initsso?idpid=C03klxshw&spid=899713224333&forceauthn=false

