This templates create a GitHub OIDC provider in AWS account and assumable role for GitHub actions.
You can deploy it using following commands:

```
aws cloudformation deploy --stack-name github-oidc-provider --template-file github-oidc-provider.yml
```

```
aws cloudformation deploy --stack-name github-pingdynasty-actions-role-copilot --template-file github-actions-role-copilot.yml --parameter-overrides file://./parameters.json --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM
```
