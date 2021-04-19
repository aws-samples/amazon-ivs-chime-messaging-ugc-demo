import React, { Component } from 'react';

import 'semantic-ui-css/semantic.min.css'
import './App.css';
import Amplify from 'aws-amplify';
import aws_exports from './aws-exports';
import appconfig from './config/apiConfig';
import { withAuthenticator } from 'aws-amplify-react';
import { Button, Modal, Header, Form, Icon, Radio, Loader } from 'semantic-ui-react'
import '@aws-amplify/ui/dist/style.css';
import { Link, Route, BrowserRouter as Router, Switch } from "react-router-dom"

import ChannelList from './channelList'
import MyChannels from './myChannels'
import CreateChannel from './createChannel'
import Channel from './channel.js'

Amplify.configure(aws_exports);
Amplify.configure(appconfig);

class App extends Component {
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      name: '',
      latencyMode: 'LOW',
      authid: props.authData.attributes.sub,
      type: 'STANDARD',
      open: false,
      loader: false,
      popup: false,
      popup_header: "",
      popup_msg: "null"
    };
    console.log(this.state.authid);
  }


  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    });
  }
  handleRadio = (e, { name, value }) => {
    this.setState({
      [name]: value
    });
    console.log(this.state);
  }
  onClickHandler = (e) => {
    const param = {
      name: this.state.name,
      latencyMode: this.state.latencyMode,
      type: this.state.type,
      authid: this.state.authid,
    }

    if (param.name === '') {
      this.setState({
        popup: true,
        popup_header: "WARNING",
        popup_msg: "Input your Channel Name!"
      })
    }
    else {
      this.setState({
        loader: true,
      })
      CreateChannel(param).then((ret) => {
        console.log(ret);
        if (ret) {
          this.setState({
            name: '',
            latencyMode: 'LOW',
            type: 'STANDARD',
            open: false,
            loader: false,
            popup: true,
            popup_header: "SUCCESS",
            popup_msg: "Channel [" + param.name + "] is created!",
          })
        }
        else {
          this.setState({
            loader: false,
            popup: true,
            popup_header: "WARNING",
            popup_msg: "Channel Creation Failed!"
          })
        }
      })
    }
  }

  render() {
    return (
      <Router>
      <header>
        <Link to="/">
          <Button secondary> Channel List </Button>
        </Link>
          <Link to="/channelList">
          <Button primary> My Channels </Button>
        </Link>
        <Modal
          centered={false}
          closeIcon
          trigger={<Button primary>Create My Channel</Button>}
          open={this.state.open}
          onClose={()=>this.setState({open:false})}
          onOpen={()=>this.setState({open:true})}
        >
          <Header icon='file video' content='Input Your Channel Info' />
          <Modal.Content>
            {this.state.loader && <Loader />}
            <Form>
              <Form.Field>
                <label> Channel Title</label>
                <input name='name' placeholder='Input your channel title' onChange={this.handleChange} />
              </Form.Field>
              <Form.Field>
                <label> Channel Type</label>
                <Radio
                  label='STANDARD'
                  name='type'
                  value='STANDARD'
                  checked={this.state.type === 'STANDARD'}
                  onChange={this.handleRadio}
                />
              </Form.Field>
              <Form.Field>
                <Radio
                  label='BASIC'
                  name='type'
                  value='BASIC'
                  checked={this.state.type === 'BASIC'}
                  onChange={this.handleRadio}
                />
              </Form.Field>
              <Form.Field>
                <label> Latency Mode</label>
                <Radio
                  label='LOW'
                  name='latencyMode'
                  value='LOW'
                  checked={this.state.latencyMode === 'LOW'}
                  onChange={this.handleRadio}
                />
              </Form.Field>
              <Form.Field>
                <Radio
                  label='NORMAL'
                  name='latencyMode'
                  value='NORMAL'
                  checked={this.state.latencyMode === 'NORMAL'}
                  onChange={this.handleRadio}
                />
              </Form.Field>
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button color='green' onClick={this.onClickHandler}>
              <Icon name='checkmark'/> Create Channel
            </Button>
          </Modal.Actions>
        </Modal>
        <Modal
          centered={false}
          onClose={() => {
              this.setState({popup:false})
              window.location.reload(false)
            }
          }
          open={this.state.popup}
          size='small'
        >
          <Modal.Header> {this.state.popup_header} </Modal.Header>
          <Modal.Content>
            <p>{this.state.popup_msg}</p>
          </Modal.Content>
          <Modal.Actions>
            <Button
              icon='check'
              onClick={() => {
                this.setState({popup:false});
                window.location.reload(false)}
              }
            />
          </Modal.Actions>
        </Modal>
      </header>
      <main>
        <Switch>
          <Route exact path="/" component={ChannelList} />
          <Route exact path="/channelList" component={MyChannels} />
          <Route exact path="/channel" component={Channel} />
        </Switch>
      </main>
      </Router>
    );
  }
}

export default withAuthenticator(App, { includeGreetings: true });