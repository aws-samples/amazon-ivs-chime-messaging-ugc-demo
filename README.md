# Build a simple UGC(User Generated Content) platform using Amazon IVS and Chime SDK
## Overview
 This demo provides live streaming services for streamers and you can join the streamer's channel and watch it. You can chat with streamer and other viewers. Moreover, you could send a heart to streamer when you want to show your love to the streamer.
 
 ![ivsdemo-preview](https://user-images.githubusercontent.com/33510681/110777073-109e7680-82a4-11eb-8045-6a1770b33434.gif)


*IMPORTANT NOTE: This project is intended for education purposes only and not for production usage.*

## Demo Architecture
![image](https://user-images.githubusercontent.com/33510681/110781077-cbc90e80-82a8-11eb-9516-9d242c2bba71.png)

### Serverless Web Application
 This demo is serverless web application, leveraging [AWS Amplify](https://aws.amazon.com/amplify/?nc1=h_ls). AWS Amplify provides set of tools and services that can be used together or on their own, to help front-end web developer build scalable full stack applications. You can configure app backends like backend API with [Amazon API Gateway](https://aws.amazon.com/api-gateway/?nc1=h_ls), [AWS Lambda](https://aws.amazon.com/lambda/?nc1=h_ls) and auth feature with [Amazon Cognito](https://aws.amazon.com/cognito/?nc1=h_ls), DB with [AWS AppSync](https://aws.amazon.com/appsync/?nc1=h_ls). 

### Streaming & Chat Messaging
 The streaming feature leverages [Amazon Interactive Video Service](https://aws.amazon.com/ivs/?nc1=h_ls). Amazon IVS provides streaming channel and [Timed MetaAPI](https://docs.aws.amazon.com/ivs/latest/userguide/metadata.html) for interactive services like poll, Q&A, Heart button. To interact between streamer and viewers with chatting, this demo provides messaging chat feature with [Amazon Chime SDK messaging](https://docs.aws.amazon.com/chime/latest/dg/using-the-messaging-sdk.html).
 
## Quick Start
*IMPORTANT NOTE: Deploying this demo application in your AWS account will create and consume AWS resources, which will cost money.*

To start demo quickly, follow the instructions as below.

### Provision Backend Side
- Click `Launch Stack`

[<img src=https://user-images.githubusercontent.com/33510681/110818932-0fd00980-82d1-11eb-8ad7-0c2f74b78222.png>](https://console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks/new?stackName=IVSChatDemoStack&templateURL=https://sjunekim-publicasset-bucket.s3.ap-northeast-2.amazonaws.com/ivs_chime_demo_cf_final0.1.yaml)

- Input Parameters

*Check Available Region of using Amazon IVS and ChimeSDK Messaging. Default is `us-east-1`*

![image](https://user-images.githubusercontent.com/33510681/113097328-aa1cd080-9231-11eb-8f88-dc7fd654ebd8.png)

- Click `Next` and `Create stack` with acknowledgement check

![image](https://user-images.githubusercontent.com/33510681/112758298-905c6d00-9028-11eb-8a07-d223c596d626.png)

- Get outputs from CloudFormation stack

![image](https://user-images.githubusercontent.com/33510681/112758767-f6e28a80-902a-11eb-8cf3-7604ff163d6d.png)

### Configure Provisioned Backends to Frontend 

- clone repo to your local
- go to root dir of repo
- Copy & paste API endpoints to `src/config/apiConfig.js` from Cloudformation `ApiEndpoint` outputs

![image](https://user-images.githubusercontent.com/33510681/112758813-2abdb000-902b-11eb-8723-4bf4d1be6b88.png)

- Copy & past ChimeAppInstance ARN to `src/config/chimeConfig.js` from Cloudformation `appInstanceArn` output

![image](https://user-images.githubusercontent.com/33510681/112758878-72443c00-902b-11eb-8e3e-a817aad0af90.png)

### Install & Set up Amplify
- Run command `npm install -g @aws-amplify/cli`
- Run command `amplify configure`
- Set up Region and IAM User which you want to set.

![image](https://user-images.githubusercontent.com/33510681/110809923-a946ed80-82c8-11eb-814b-2e2f7d33adf5.png)

### Set Up Amplify Backend
- Run command `amplify init` in root dir of repo

*Enter the input value by referring to the following.*

![image](https://user-images.githubusercontent.com/33510681/110810818-7d783780-82c9-11eb-8436-d283a2d5ea27.png)

- Run command `amplify import auth`
- Select Cognito which is created in CloudFormation

![image](https://user-images.githubusercontent.com/33510681/112759157-b97efc80-902c-11eb-9c10-9e7120c75de9.png)

- Run command `amplify add api`
- Select `GraphQL`
- Type API Name and Select `Amazon Cognito User Pool`
- Select `No, I'm Done` and Typo `Yes`
- Input `./src/config/schema.graphql` which is provided schema file

![image](https://user-images.githubusercontent.com/33510681/112759257-28f4ec00-902d-11eb-82e6-bd3a3ffa40b5.png)

- Run command `amplify push`
- Type `Yes` to continue
- Type `Yes` to create GraphQL API
- Select `javascript`
- Press `ENTER` Enter to select file name pattern of graphql queries to default
- Type `Yes` to generate/update all possible GraphQL operations
- Press `ENTER` to maximum statement depth as default

![image](https://user-images.githubusercontent.com/33510681/112759427-e384ee80-902d-11eb-9469-4aeea80ea544.png)

- After updating resources is done, Check with `amplify status` command

![image](https://user-images.githubusercontent.com/33510681/112759562-876e9a00-902e-11eb-8290-d2d6632fb74c.png)

### Finally Done! Use Demo!
- Go to root dir of repo

> **_NOTE:_**  If you are using Cloud9 for demo, you have to increase volume size of Cloud9 Instance. Run script `resize_volume.sh`before `npm install`. 
- If you are using Cloud9
  - Go to Root Dir
  - `chmod +x resize_volume.sh`
  - `./resize_volume.sh`
- Run command `npm install`
- Run command `npm start` 

#### Create Channel
- Click `Create Channel Button` and create channel!

![image](https://user-images.githubusercontent.com/33510681/110826429-69880200-82d8-11eb-85ee-bc0a3793a9af.png)

- If you click `My Channels`, You can see your channels.

#### Join Others Channel
You could join the other channel and enjoy it.

#### Streaming your contents
You can stream your contents using [OBS](https://obsproject.com/). 

- Click `CHANNEL INFO` in `My Channels`.

![image](https://user-images.githubusercontent.com/33510681/110826913-e4511d00-82d8-11eb-88f6-4352281aa596.png)

- Get `INGEST ENDPOINT` and `Channel STREAM KEY`.
- Input to OBS Application and stream it!
- `Start OBS > Settings > Stream` and input ingest endpoint and stream key.

![image](https://user-images.githubusercontent.com/33510681/110827764-bd471b00-82d9-11eb-8dde-f5e0303750a1.png)

- Start Streaming and enjoy Demo!

## Clean Up
- Remove CloudFormation Stack
- Remove Amazon IVS channel which you made
- Run Command `amplify delete`

## Resources
- [Amazon IVS React Feed App Demo](https://github.com/aws-samples/amazon-ivs-feed-web-demo)
- [Amazon ChimeSDK for JS](https://github.com/aws/amazon-chime-sdk-js)
- [Amazon ChimeSDK Component Library React](https://github.com/aws/amazon-chime-sdk-component-library-react)
- [Semantic-UI-React](https://react.semantic-ui.com/)

## License
This sample code is made available under a APACHE2.0 license. See the LICENSE file.
