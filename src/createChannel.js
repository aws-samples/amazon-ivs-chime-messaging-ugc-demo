import { API, Auth } from 'aws-amplify'
import * as mutations from './graphql/mutations';
import * as chimeApi from './chimeapi/chime'
import appConfig from './config/chimeConfig'

export default async function CreateChannel(props) {

    let ret = true;
    const user = await Auth.currentAuthenticatedUser()
    const token = user.signInUserSession.idToken.jwtToken
    // console.log(token)
    // console.log(JSON.stringify(props));
    // console.log(props.authid);
    const requestData = {
        headers: {
            Authorization: token
        },
        queryStringParameters: props,
    }
    
    try {
        const data = await API.post('ivscreate', '/', requestData)
        console.log("data: ", data)
        console.log(appConfig.appInstanceArn);
        
        const chatChannel = await chimeApi.createChannel(appConfig.appInstanceArn, data.channel.name, "RESTRICTED", "PUBLIC", props.authid)
        console.log("chiem create");
        console.log(chatChannel);
        
        const new_channel = {
            id: data.channel.arn,
            title: data.channel.name,
            owner: user.username,
            status: "off",
            viewers: 0,
            latencyMode: data.channel.latencyMode,
            type: data.channel.type,
            playbackUrl: data.channel.playbackUrl,
            ingestEndpoint: "rtmps://" + data.channel.ingestEndpoint + ":443/app/",
            streamKey: data.streamKey.value,
            chatChannel: chatChannel,
        };
        
        const reply = await API.graphql({ query: mutations.createChannel, variables: { input: new_channel } })
        console.log("**graphql**");
        console.log(reply);
        return ret;
    }
    catch (e) {
        console.log("ERROR!!!");
        console.log(e);
        ret = false;
        return ret;
    }
}