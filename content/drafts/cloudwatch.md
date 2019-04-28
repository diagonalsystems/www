CloudWatch Logs agent

configured to send SSH logs from the EC2 instance to a log stream identified by an instance ID.




The CloudWatch log agent on each server is installed at startup and configured to stream SSH log entries from /var/log/secure to CloudWatch via a log stream. CloudWatch aggregates the log streams (ssh.log) from the application servers and saves them in a CloudWatch Logs log group. Each log stream is identified by an instance-ID, as shown in the following screenshot.




Create IAM roles or users that enable the agent to collect metrics from the server and optionally to integrate with AWS Systems Manager.

Download the agent package.

Modify the CloudWatch agent configuration file and specify the metrics that you want to collect.

Install and start the agent on your servers. As you install the agent on an EC2 instance, you attach the IAM role that you created in step 1. As you install the agent on an on-premises server, you specify a named profile that contains the credentials of the IAM user that you created in step 1.