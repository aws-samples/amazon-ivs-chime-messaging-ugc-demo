import { API, Auth } from 'aws-amplify'
import * as mutations from './graphql/mutations';
import * as chimeApi from './chimeapi/chime'

export default async function DeleteChannel(props) {
    let ret = true;
    const user = await Auth.currentAuthenticatedUser()
    const token = user.signInUserSession.idToken.jwtToken
    const authid = user.attributes.sub;
    const chatChannel = props.chatChannel;
    console.log("in delete");
    console.log(authid);
    console.log(chatChannel);
    const param = {
        arn : props.id,
    }
    const requestData = {
        headers: {
            Authorization: token
        },
        queryStringParameters: param,
    }
    try {
        const data = await API.post('ivsdelete', '/', requestData);
        console.log(data);
        const target = {
            id: props.id,
        }
        await chimeApi.deleteChannel(chatChannel, authid);
        let reply = await API.graphql({ query: mutations.deleteChannel, variables: { input: target } });
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