import React, { useState, useRef, useEffect, Component } from 'react';
import { Grid } from 'semantic-ui-react'
import { VolumeOff, VolumeUp } from './assets/icons';
import { API, Auth } from 'aws-amplify'
import Heart from './like/Heart';
import { getRandomColor } from './like/utils';
import { Favorite } from './assets/icons';
import './App.css';
import Chatting from './chat'

let player = null;
const playerID = Date.now();
/*eslint no-undef: "off"*/
function AWSIVSPlayer(options) {
    const divEl = useRef(null);
    const videoEl = useRef(null);
    const [muted, setMuted] = useState(true);
    const PLAYBACK_URL = options.location;
    const ARN = options.arn;
    const heartCount = 2;
    const [hearts, setHearts] = useState([]);
    console.log(PLAYBACK_URL);
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://player.live-video.net/1.0.0/amazon-ivs-player.min.js';
        script.async = true;
        document.body.appendChild(script);
        script.onload = () => {
            if (IVSPlayer.isPlayerSupported) {
                console.log("player init")
                player = IVSPlayer.create();
                player.attachHTMLVideoElement(document.getElementById('video-player'));
                player.load(PLAYBACK_URL);
                player.setMuted(true);
                player.play();
                player.addEventListener(IVSPlayer.PlayerState.READY, onStateChange);
                player.addEventListener(IVSPlayer.PlayerState.PLAYING, onStateChange);
                player.addEventListener(IVSPlayer.PlayerState.ENDED, onStateChange);
                player.addEventListener(IVSPlayer.PlayerState.ERROR, onError);
                player.addEventListener(IVSPlayer.PlayerEventType.TEXT_METADATA_CUE, function(cue) {
                    const metadataText = JSON.parse(cue.text);
                    console.log("TRIGGER!!");
                    console.log("prot: " + metadataText.prot);
                    console.log("playerID: " + metadataText.playerID)
                    if (metadataText.prot === "Like" && metadataText.playerID !== playerID) {
                        animateLike(false);
                    }
                });
            }
        }
        return () => {
            console.log("return script");
            document.body.removeChild(script);
            player.removeEventListener(IVSPlayer.PlayerState.READY, onStateChange);
            player.removeEventListener(IVSPlayer.PlayerState.PLAYING, onStateChange);
            player.removeEventListener(IVSPlayer.PlayerState.ENDED, onStateChange);
            player.removeEventListener(IVSPlayer.PlayerState.ERROR, onError);
            player.removeEventListener(IVSPlayer.PlayerEventType.TEXT_METADATA_CUE);
        }
    }, [PLAYBACK_URL])

    const onStateChange = (cue) => {
        const newState = player.getState();
        console.log(`Player State - ${newState}`);
    };

    const onError = (err) => {
        console.warn('Player Event - ERROR:', err);
    };
    async function putMetaFunc() {
        const user = await Auth.currentAuthenticatedUser();
        const token = user.signInUserSession.idToken.jwtToken
        console.log("put meta");
        var payload = {
            prot: 'Like',
            playerID: playerID,
        }
        var params = {
            arn: ARN,
            /* required */
            meta: JSON.stringify(payload) /* required */
        };
        const requestData = {
            headers: {
                Authorization: token
            },
            queryStringParameters: params,
        }
        try {
            const data = await API.post('ivsmetainput', '/', requestData);
            console.log(data);
        }
        catch (e) {
            console.log("ERROR!!!");
            console.log(e);
        }
    }

    const animateLike = (putMeta) => {
        for (let i = 0; i < heartCount; i++) {
            setTimeout(() => {
                setHearts((hearts) => [...hearts, {
                    id: Date.now(),
                    color: getRandomColor()
                }]);
            }, i * 200);
        }
        if (putMeta === true) {
            console.log("animateLike");
            putMetaFunc();
        }
    };

    const removeHeart = () => {
        const activeHearts = [...hearts];
        activeHearts.shift();
        setHearts(activeHearts);
    };

    const toggleMute = () => {
        if (player === null) {
            console.log("nukk");
        }
        const muteNext = !player.isMuted();
        player.setMuted(muteNext);
        setMuted(muteNext);
    };

    return (
        <div class='player-ui' ref={divEl}>
            <video
                class='player-video-el'
                id="video-player"
                ref={videoEl}
                playsInline
                autoPlay
            />
            <div className="player-ui-actions">
              <button className="player-ui-button" onClick={toggleMute}>
                {muted ? <VolumeOff /> : <VolumeUp />}
              </button>
                 <div className="like-wrapper">
                  <button className="like-button" onClick={()=>{animateLike(true)}}>
                    <Favorite />
                  </button>
                  {hearts.map(({ id, color }) => (
                    <Heart key={id} color={color} removeHeart={removeHeart} />
                  ))}
                </div>
            </div>
        </div>
    );
}

class Channel extends Component {
    constructor(props) {
        super(props);
        console.log(props);
        this.state = {
            playbackUrl: props.location.state.playbackUrl,
            arn: props.location.state.id,
            chatChannel: props.location.state.chatChannel,
            title: props.location.state.title,
            owner: props.location.state.owner,
        }
    }

    render() {
        return (
            <Grid divided>
            <Grid.Row>
              <Grid.Column width={10}>
                <div class="aspect-16x9">
                    <AWSIVSPlayer location={this.state.playbackUrl} arn={this.state.arn} />
                </div>
              </Grid.Column>
              <Grid.Column width={5}>
                 <Chatting 
                    chatChannel={this.state.chatChannel} 
                    title={this.state.title} 
                    owner={this.state.owner}
                    />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        );
    }
}

export default Channel;
