import React, { Component } from 'react';
import { Segment, Button, Form } from 'semantic-ui-react'
import * as chimeApi from './chimeapi/chime'
import { Auth } from 'aws-amplify'
import {
  InfiniteList,
  ChatBubble,
  lightTheme,
  GlobalStyles,
  formatTime,
  ChatBubbleContainer
}
from 'amazon-chime-sdk-component-library-react';
import { ThemeProvider } from 'styled-components';
import * as Chime from 'aws-sdk/clients/chime';
import * as AWS from 'aws-sdk/global';
import {
  ConsoleLogger,
  DefaultMessagingSession,
  LogLevel,
  MessagingSessionConfiguration,
}
from 'amazon-chime-sdk-js';


//const messageList = [];
class Chatting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messageList: [],
      chatChannel: props.chatChannel,
      title: props.title,
      owner: props.owner,
      chatMsg: "",
      member: {},
      isLoading: false,
      nextToken: null,
      logger: new ConsoleLogger('SDK', LogLevel.INFO),
      endpoint: null,
    }
    console.log("chat!");
    console.log(props);
    this.setState({
      messageList: this.getMessages(),
    })
    this.initSession();
  }


  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  async initSession() {
    const user = await Auth.currentAuthenticatedUser();
    const authId = user.attributes.sub;
    const logger = new ConsoleLogger('SDK', LogLevel.INFO);
    const endpoint = await chimeApi.getMessagingSessionEndpoint();
    const userArn = chimeApi.createMemberArn(authId);
    const userName = user.username;
    const sessionId = null;
    const creds = await Auth.currentCredentials();
    const chime = new Chime({
      region: 'us-east-1',
      credentials: await Auth.essentialCredentials(creds)
    });
    const configuration = new MessagingSessionConfiguration(userArn, sessionId, endpoint.Endpoint.Url, chime, AWS);
    const messagingSession = new DefaultMessagingSession(configuration, logger);
    const observer = {
      messagingSessionDidStart: () => {
        console.log('Session started');
      },
      messagingSessionDidStartConnecting: reconnecting => {
        if (reconnecting) {
          console.log('Start reconnecting');
        }
        else {
          console.log('Start connecting');
        }
      },
      messagingSessionDidStop: event => {
        console.log(`Closed: ${event.code} ${event.reason}`);
      },
      messagingSessionDidReceiveMessage: message => {
        console.log(`Receive message type ${message.type}`);
        const msg = JSON.parse(message.payload)
        console.log(msg);
        if (msg !== null && msg.Sender.Name !== userName) {
          this.addMessageList(msg, msg.Content, "incoming");
        }
      }
    };

    messagingSession.addObserver(observer);
    messagingSession.start();
    this.setState({
      messagingSession: messagingSession,
    })
  }
  async sendMessage(msg) {
    try {
      console.log("SENDMSG : " + msg);
      console.log("ChannelARN: " + this.state.chatChannel);
      console.log("member: ");
      console.log(this.state.member);
      const ret = await chimeApi.sendChannelMessage(this.state.chatChannel, msg, this.state.member)
      console.log(ret);
      this.addMessageList(ret, msg, "outgoing");
    }
    catch (e) {
      console.log("send msg ERROR");
      console.log(e);
    }

  }

  async addMessageList(msg, content, variant) {
    let Messages = this.state.messageList;
    const index = Messages.length;
    this.setState({
      isLoading: true,
    })
    Messages.push(
      <ChatBubbleContainer
                timestamp={formatTime(msg.CreatedTimestamp)}
                css="margin: 1rem;"
                key={`message${index.toString()}`}
              >
                <ChatBubble
                    variant={variant}
                    senderName={msg.Sender.Name}
                    showName={true}
                    showTail={true}
                > {content} </ChatBubble>
            </ChatBubbleContainer>
    );
    this.setState({
      isLoading: false,
    })
  }

  async getMessages() {
    let Messages = this.state.messageList;
    const user = await Auth.currentAuthenticatedUser();
    const authId = user.attributes.sub;
    const userName = user.username;
    console.log(user);
    console.log("NAME!!!!: " + userName);
    this.setState({
      isLoading: true,
    })
    console.log("GET MESSAGE!!!")
    try {
      console.log(this.state);
      let messageList = await chimeApi.listChannelMessages(this.state.chatChannel, authId, this.nextToken);
      console.log("messages: ");
      console.log(messageList);
      messageList.Messages.map((msg, index) => {
        let variant = "incoming";
        if (msg.Sender.Name === userName) {
          variant = "outgoing"
        }
        console.log(variant);
        Messages.push(
          <ChatBubbleContainer
                timestamp={formatTime(msg.CreatedTimestamp)}
                css="margin: 1rem;"
                key={`message${index.toString()}`}
              >
                <ChatBubble
                    variant={variant}
                    senderName={msg.Sender.Name}
                    showName={true}
                    showTail={true}
                > {msg.Content} </ChatBubble>
            </ChatBubbleContainer>
        );
      });
    }
    catch (e) {
      console.log("ERROR!!! GET MESSAGE!!");
      console.log(e);
    }
    this.setState({
      isLoading: false,
    })
    return Messages;
  }

  handleClick = () => {
    console.log("CHAT!!: " + this.state.chatMsg)
    if (this.state.chatMsg !== '') {
      this.sendMessage(this.state.chatMsg);
      console.log("NOT NULL");
    }
    this.setState({
      chatMsg: "",
    })
  }

  handleKeyPress = e => {
    e.stopPropagation()
    if (e.key === 'Enter') { this.handleClick(); }
  };

  handleScrollTop = async() => {
    console.log("handleScrollTop");
    this.setState({
      isLoading: true
    })
    const messageList = this.getMessages();
    this.setState({
      messageList: messageList,
      isLoading: false,
    })
  };

  async componentDidMount() {
    console.log("CHAT DIDMOUNT");
    const user = await Auth.currentAuthenticatedUser();
    const authId = user.attributes.sub;
    let memberArn = chimeApi.createMemberArn(authId);
    try {
      console.log("Member ARN: " + memberArn)
      //const memberList = await chimeApi.listChannelMemberships(this.state.chatChannel, user.attributes.sub);
      //console.log(memberList);
      const ret = await chimeApi.createChannelMembership(this.state.chatChannel, memberArn, authId);
      console.log("DONE");
      if (ret) {
        console.log("Membership add success");
        console.log(ret);
        this.setState({
          member: {
            userId: authId,
            username: ret.Name,
          }
        })
      }
    }
    catch (e) {
      console.log("ERROR!! ");
      console.log(e);
    }
  }

  render() {
    return (
      <Segment>
         <ThemeProvider theme={lightTheme}>
            <GlobalStyles />
              <InfiniteList
                style={{ display: 'flex', flexGrow: '1' }}
                items={this.state.messageList}
                onLoad={this.handleScrollTop}
                isLoading={this.state.isLoading}
                css="border: 1px solid #3f4149; width: 30rem; height: 30rem"
                className="chat-message-list"
                />
         </ThemeProvider>
        <Segment>
           <Form>
            <Form.Field>
              <input name="chatMsg"
                autocomplete="off" 
                value={this.state.chatMsg} 
                placeholder='Type here' 
                onChange={this.handleChange}
                onKeyPress={this.handleKeyPress}
                />
            </Form.Field>
            <Button type='submit' onClick={this.handleClick}>Submit</Button>
          </Form>
        </Segment>
      </Segment>
    )
  };
}

export default Chatting