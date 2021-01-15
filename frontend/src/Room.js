import { Grid, Typography, Button } from "@material-ui/core";
import { useEffect, useState } from "react";
import axios from "axios";
import CreateRoom from "./CreateRoom";

function Room(props) {
  const roomCode = props.match.params.roomCode;
  const [state, setState] = useState({
    votesToSkip: 2,
    guestCanPause: false,
    isHost: false,
    showSettings: false,
  });

  useEffect(
    () =>
      axios
        .get(
          `http://127.0.0.1:8000/api/get-room?code=${props.match.params.roomCode}`
        )
        .then((res) => {
          console.log(res);
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
        }),
    []
  );

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

  return (
    <Grid container spacing={1} align="center">
      <Grid item xs={12}>
        <Typography variant="h4" component="h4">
          Code: {roomCode}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6" component="h6">
          Votes: {state.votesToSkip}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6" component="h6">
          Guest can pause: {state.guestCanPause.toString()}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h6" component="h6">
          Is Host: {state.isHost.toString()}
        </Typography>
      </Grid>
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
