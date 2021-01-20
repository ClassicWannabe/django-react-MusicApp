import { Grid, Typography, Button } from "@material-ui/core";
import { useEffect, useState } from "react";
import axios from "axios";
import CreateRoom from "./CreateRoom";
import MusicPlayer from "./MusicPlayer";

function Room(props) {
  const roomCode = props.match.params.roomCode;
  const [state, setState] = useState({
    votesToSkip: 2,
    guestCanPause: false,
    isHost: false,
    showSettings: false,
    spotifyAuthenticate: false,
    song: [],
  });

  const getRoomDetails = () => {
    axios
      .get(`http://127.0.0.1:8000/api/get-room?code=${roomCode}`)
      .then((res) => {
        if (res.statusText !== "OK") {
          props.clearRoom();
          props.history.push("/");
        }
        return res.data;
      })
      .then((data) => {
        setState((prevValues) => {
          return {
            ...prevValues,
            votesToSkip: data.votes_to_skip,
            guestCanPause: data.guest_can_pause,
            isHost: data.is_host,
          };
        });
        if (data.is_host) {
          authenticateSpotify();
        }
      });
  };

  useEffect(() => {
    getRoomDetails();
    const interval = setInterval(getCurrentSong, 1000);
  }, []);

  const leaveRoom = () => {
    axios.get(`http://127.0.0.1:8000/api/leave-room`).then(() => {
      props.clearRoom();
      props.history.push("/");
    });
  };

  const updateShowSettings = (value) =>
    setState((prevValues) => {
      return {
        ...prevValues,
        showSettings: value,
      };
    });

  const authenticateSpotify = () => {
    axios.get(`http://127.0.0.1:8000/spotify/is-authenticated`).then((res) => {
      setState((prevValues) => {
        return {
          ...prevValues,
          spotifyAuthenticate: res.data.status,
        };
      });
      if (!res.data.status) {
        axios.get(`http://127.0.0.1:8000/spotify/get-auth-url`).then((res) => {
          window.location.replace(res.data.url);
        });
      }
    });
  };

  const getCurrentSong = () => {
    axios
      .get(`http://127.0.0.1:8000/spotify/current-song`)
      .then((res) => {
        if (res.statusText !== "OK") {
          return {};
        } else {
          return res.data;
        }
      })
      .then((data) => {
        setState((prevValues) => {
          return {
            ...prevValues,
            song: data,
          };
        });
      });
  };

  const renderSettingsButton = () => {
    return (
      <Grid item xs={12}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => updateShowSettings(true)}
        >
          Settings
        </Button>
      </Grid>
    );
  };

  const renderSettings = () => {
    return (
      <Grid container spacing={1} align="center">
        <Grid item xs={12}>
          <CreateRoom
            update={true}
            votesToSkip={state.votesToSkip}
            guestCanPause={state.guestCanPause}
            roomCode={roomCode}
            useCallback={getRoomDetails}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => updateShowSettings(false)}
          >
            Close
          </Button>
        </Grid>
      </Grid>
    );
  };

  if (state.showSettings) {
    return renderSettings();
  }
  console.log('The song '+state.song);
  return (
    <Grid container spacing={1} align="center">
      <Grid item xs={12}>
        <Typography variant="h4" component="h4">
          Code: {roomCode}
        </Typography>
      </Grid>
      <MusicPlayer {...state.song} />
      {state.isHost ? renderSettingsButton() : null}
      <Grid item xs={12}>
        <Button variant="contained" color="secondary" onClick={leaveRoom}>
          Leave Room
        </Button>
      </Grid>
    </Grid>
  );
}

export default Room;
