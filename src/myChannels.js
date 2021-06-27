import React, { Component } from 'react';
import './App.css';
import { Table, Button, Modal, Icon, Loader, Header, Form, Segment, Divider, Popup } from 'semantic-ui-react'
import { Container } from 'semantic-ui-react'
import { API, Auth } from 'aws-amplify'
import * as queries from './graphql/queries';
import * as mutations from './graphql/mutations';
import DeleteChannel from './deleteChannel';

class MyChannels extends Component {
  constructor(props) {
    super(props);
    console.log("mychannel");
    console.log(props);
    this.state = {
      channel_list: [],
      popup: false,
      popup_msg: "",
      popup_header: "",
      delete_check: false,
      delete_target: {},
      loader: false,
      info: false,
      info_target: {},
      copyendpoint: false,
      copystreamkey: false,
      authid: null,
    }
  }

  async componentDidMount() {
    try {
      Auth.currentAuthenticatedUser().then((user) => {
        console.log(user.attributes.sub);
        let filter = {
          owner: {
            eq: user.username
          }
        };
        API.graphql({ query: queries.listChannels, variables: { filter: filter } }).then((reply) => {
          this.setState({
            channel_list: reply.data.listChannels.items,
            authid: user.attributes.sub
          })
          console.log(this.state.channel_list);
        });

      })
    }
    catch (e) {
      console.log("ERROR!!!");
      console.log(e);
    }
  }
  startHandle = (channel) => {
    console.log("click start");
    const params = {
      id: channel.id,
      status: "on",
    };
    API.graphql({ query: mutations.updateChannel, variables: { input: params } }).then((res)=>{
      console.log(res);
      window.location.reload(false);
    });

}

stopHandle = (channel) => {
  console.log("click stop");
   const params = {
      id: channel.id,
      status: "off",
    };
    API.graphql({ query: mutations.updateChannel, variables: { input: params } }).then((res)=>{
      console.log(res);
      window.location.reload(false);
    });

}

deleteHandle = (channel) => {
  if (this.state.delete_check === false) {
    this.setState({
      popup: true,
      popup_header: "WARNING",
      popup_msg: "Are you sure to delete channel [" + channel.title + "] ?",
      delete_check: true,
      delete_target: channel
    })
  }
  else if (this.state.delete_check === true) {
    this.setState({
      loader: true,
    })
    DeleteChannel(this.state.delete_target).then((ret) => {
      if (ret) {
        this.setState({
          loader: false,
          popup_header: "SUCCESS",
          popup_msg: "Channel deletion completed.",
          delete_check: false,
        })
      }
      else {
        this.setState({
          loader: false,
          popup_header: "FAILED!",
          popup_msg: "Channel [" + channel.name + "] deletion failed.",
          delete_check: false,
        })
      }
    });
  }
}

infoHandle = (channel) => {
  console.log("click info");
  console.log(channel);
  this.setState({
    info: true,
    info_target: channel,
  })

}

copyClipboard = (txt) => {
  console.log("copy: " + txt);
  window.navigator.clipboard.writeText(txt);
}

render() {
  return (
    <Container textAlign='middle'>
              <Table basic='very' selectable textAlign="center" fixed>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell width={1}> No. </Table.HeaderCell>
                    <Table.HeaderCell>Channel Title</Table.HeaderCell>
                    <Table.HeaderCell>Channel Owner</Table.HeaderCell>
                    <Table.HeaderCell>Channel Status</Table.HeaderCell>
                    <Table.HeaderCell>Channel Info</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                    {this.state.channel_list.map((channel,index)=> 
                          <Table.Row>
                            <Table.Cell>{index+1}</Table.Cell>
                            <Table.Cell>{channel.title}</Table.Cell>
                            <Table.Cell>{channel.owner}</Table.Cell>
                            {channel.status === "on" && 
                                <Table.Cell>
                                    <Button basic color="red" onClick={()=>this.stopHandle(channel)} labelPosition='left' icon>
                                      <Icon name='pause' />
                                      STOP
                                    </Button>
                                </Table.Cell>
                            }
                            {channel.status === "off" &&
                                 <Table.Cell>
                                    <Button basic color="black" onClick={()=>this.startHandle(channel)} labelPosition='left' icon>
                                      <Icon name='play' />
                                      START
                                    </Button>
                                </Table.Cell>
                            }
                            <Table.Cell>
                                 <Button basic color="brown" onClick={()=>this.infoHandle(channel)} animated>
                                 <Button.Content visible>CHANNEL INFO</Button.Content>
                                    <Button.Content hidden>
                                    <Icon name='info right' />
                                    </Button.Content>
                                 </Button>
                                 <Button basic color="red" onClick={()=>this.deleteHandle(channel)} animated>
                                    <Button.Content visible>DELETE</Button.Content>
                                    <Button.Content hidden>
                                    <Icon name='trash right' />
                                    </Button.Content>
                                </Button>
                            </Table.Cell>
                          </Table.Row>
                    )}
                </Table.Body>
              </Table>
              <Modal
                  centered={false}
                  onClose={() => {
                      this.setState({
                         popup:false,
                         popup_header:"",
                         popup_msg:"",
                         delete_check : false,
                         delete_target : {}
                      })
                      window.location.reload(false);
                    }
                  }
                  open={this.state.popup}
                  size='small'
                >
                  <Modal.Header> {this.state.popup_header} </Modal.Header>
                  <Modal.Content>
                    <p>{this.state.popup_msg}</p>
                  </Modal.Content>
                  {this.state.delete_check &&
                  <Modal.Actions>
                    <Button basic color="green"
                      icon='check'
                      onClick={this.deleteHandle}
                    />
                    <Button basic color="red"
                      icon='cancel'
                      onClick={()=>{
                        this.setState({
                         popup:false,
                         popup_header:"",
                         popup_msg:"",
                         delete_check : false,
                         delete_target : {}
                        })
                      }}
                    />
                    {this.state.loader && <Loader />}
                  </Modal.Actions>
                }
               </Modal>
                 <Modal
                  centered={false}
                  closeIcon
                  open={this.state.info}
                  onClose={()=>this.setState({
                    info:false,
                    info_target:{}
                  })}
                  onOpen={()=>this.setState({info:true})}
                >
                  <Header icon='file video' content='Get Your Channel endpoint & stream key and Use it for Streaming' />
                  <Modal.Content>
                    <Form>
                      <Form.Field>
                        <label>Channel Name</label>
                        <Segment>{this.state.info_target.title}</Segment>
                      </Form.Field>
                    </Form>
                    <Divider />
                    <Form>
                      <Form.Field>
                        <label>Channel TYPE</label>
                        <Segment>{this.state.info_target.type}</Segment>
                      </Form.Field>
                    </Form>
                    <Divider />
                     <Form>
                      <Form.Field>
                        <label>Channel Latency Mode</label>
                        <Segment>{this.state.info_target.latencyMode}</Segment>
                      </Form.Field>
                    </Form>
                    <Divider />
                     <Form>
                      <Form.Field>
                        <label>Channel INGEST ENDPOINT</label>
                            <Segment> 
                               <Popup
                                  trigger={ <Button icon="copy" size="small" color="grey" onClick={()=>{this.copyClipboard(this.state.info_target.ingestEndpoint)}} />}
                                  content={"COPIED!"}
                                  on='click'
                                  open={this.state.copyendpoint}
                                  onClose={()=>{this.setState({copyendpoint:false})}}
                                  onOpen={()=>{this.setState({copyendpoint:true})}}
                                  position='top right'
                                />
                              {this.state.info_target.ingestEndpoint}
                            </Segment>
                      </Form.Field>
                    </Form>
                    <Divider />
                    <Form>
                      <Form.Field>
                        <label>Channel STREAM KEY</label>
                        <Segment>
                           <Popup
                                  trigger={<Button icon="copy" size="small" color="grey" onClick={()=>{this.copyClipboard(this.state.info_target.streamKey)}} />}
                                  content={"COPIED!"}
                                  on='click'
                                  open={this.state.copystreamkey}
                                  onClose={()=>{this.setState({copystreamkey:false})}}
                                  onOpen={()=>{this.setState({copystreamkey:true})}}
                                  position='top right'
                                />
                          {this.state.info_target.streamKey}
                        </Segment>
                      </Form.Field>
                    </Form>
                    <Divider />
                  </Modal.Content>
              </Modal>
            </Container>
  );
}
}

export default MyChannels;
