import { TextField, Button, Grid, Typography } from "@material-ui/core";
import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";

function JoinRoom(props) {
  const [state, setState] = useState({ roomCode: "", errorText: '', hasError: false });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setState((prevText) => {
      return {
        ...prevText,
        [name]: value,
      };
    });
  }
  const handleSubmit = () => {
    console.log("entering...");
    axios
      .post(`http://127.0.0.1:8000/api/join-room`, { code: state.roomCode })
      .then((res) => {
        res.statusText === "OK"
          ? props.history.push(`/room/${state.roomCode}`)
          : setState((prevText) => {
              return {
                ...prevText,
                hasError: true,
                errorText: 'Invalid code'
              };
            });
      })
      .catch((err) => console.log(err));
  };
  return (
    <Grid container spacing={1} align="center">
      <Grid item xs={12}>
        <Typography variant="h4" component="h4">
          Join a Room
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          name="roomCode"
          onChange={handleChange}
          error={state.hasError}
          label="Code"
          placeholder="Enter a Room Code"
          value={state.roomCode}
          helperText={state.errorText}
          variant="outlined"
        />
      </Grid>
      <Grid item xs={12}>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Enter Room
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Button variant="contained" color="secondary" to="/" component={Link}>
          Back
        </Button>
      </Grid>
    </Grid>
  );
}

export default JoinRoom;
