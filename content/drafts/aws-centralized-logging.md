---
title: Centralized Logging in AWS
---

## AWS Config

cloud-trail-encryption-enabled


## Create a Central Account for Logging


## Create a S3 Logging Bucket


## Setup a CMK for logging

Key Policies in AWS KMS


## Add a S3 Bucket Policy

By default, an S3 object is owned by the AWS account that uploaded it.


actions
`GetBucketAcl`
`PutObject`

arn for buckets
`arn:aws:s3:::my-bucket` 

condition
`"s3:x-amz-acl": "bucket-owner-full-control"` 

principal
`"Service": "cloudtrail.amazonaws.com"`


bucket: `my-bucket`
account: 000123456789

```json
{
  "Version": "2012-10-17",
  "Id": "CentralizedLoggingBucketPolicy",
  "Statement": [
    {
      "Sid": "BucketAclForCloudTrail",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudtrail.amazonaws.com"
      },
      "Action": "s3:GetBucketAcl",
      "Resource": "arn:aws:s3:::my-bucket"
    },
    {
      "Sid": "WritePermissionForCloudTrail",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudtrail.amazonaws.com"
      },
      "Action": "s3:PutObject",
      "Resource": [
        "arn:aws:s3:::my-bucket/AWSLogs/000123456789/*",
      ],
      "Condition": {
        "StringEquals": {
          "s3:x-amz-acl": "bucket-owner-full-control"
        }
      }
    }
  ]
}
```

## Setup S3 encryption at rest

sse-s3 vs sse-kms 

required permissions :

- S3 read permissions for the bucket that contains the log files.
- policy or role applied that allows decrypt permissions by the CMK policy


## Encryption in transit

AWS Global Condition Context Keys


## Create a New Trail

Creating a Trail for an Organization

AWSServiceRoleForCloudTrail

cloudtrail "You don't have the necessary S3 permissions"

Your organization must have all features enabled before you can create a trail for it. For more information, see Enabling All Features in Your Organization.

AWSServiceRoleForOrganizations
AWSCloudTrailFullAccess



aws s3 bucket policy cross-account logging
