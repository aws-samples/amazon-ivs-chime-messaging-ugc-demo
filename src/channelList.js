import React, { Component } from 'react';
import './App.css';
import { Table, Button, Modal, Icon } from 'semantic-ui-react'
import { Container } from 'semantic-ui-react'
import { API } from 'aws-amplify'
import * as queries from './graphql/queries';

class ChannelList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            channel_list: [],
            popup: false,
            popup_msg: "",
        }
    }

    async componentDidMount() {
        try {
            API.graphql({ query: queries.listChannels },).then((reply) => {
                this.setState({
                    channel_list: reply.data.listChannels.items,
                })
                console.log(this.state.channel_list);
            });
        }
        catch (e) {
            console.log("ERROR!!!");
            console.log(e);
        }
    }
    clickHandle = (channel) => {
        console.log("click");
        if (channel.status === "off") {
            this.setState({
                popup: true,
                popup_msg: "Seleted Channel is NOT OnAir."
            })
        }else{
             this.props.history.push("/channel", channel);
        }
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
                    <Table.HeaderCell>Channel Join</Table.HeaderCell>
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
                                    <Icon.Group size='large'>
                                      <Icon loading color="red" size='large' name='circle notch' />
                                    </Icon.Group>
                                </Table.Cell>
                            }
                            {channel.status === "off" &&
                                <Table.Cell>
                                    <Icon.Group size='large'>
                                     <Icon color='black' name='stop circle' />
                                    </Icon.Group>
                                </Table.Cell>
                            }
                            <Table.Cell>
                                <Button basic color="black" onClick={()=>this.clickHandle(channel)} animated>
                                    <Button.Content visible>JOIN</Button.Content>
                                    <Button.Content hidden>
                                    <Icon name='arrow right' />
                                    </Button.Content>
                                </Button>
                            </Table.Cell>
                          </Table.Row>
                    )}
                </Table.Body>
              </Table>
              <Modal
                  centered={false}
                  onClose={() => this.setState({popup:false})}
                  open={this.state.popup}
                  size='small'
                >
                  <Modal.Header> SORRY! </Modal.Header>
                  <Modal.Content>
                    <p>{this.state.popup_msg}</p>
                  </Modal.Content>
                <Modal.Actions>
                    <Button secondary
                      icon='check'
                      onClick={() => this.setState({popup:false})}
                    />
                </Modal.Actions>
               </Modal>
            </Container>
        );
    }
}

export default ChannelList