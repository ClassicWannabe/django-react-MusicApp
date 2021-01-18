import {
  Button,
  Grid,
  Typography,
  TextField,
  FormHelperText,
  FormControl,
  Radio,
  RadioGroup,
  FormControlLabel,
  Collapse,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

function CreateRoom(props) {
  const defaultProps = {
    votesToSkip: 2,
    guestCanPause: true,
    update: false,
    roomCode: null,
    updateCallBack: () => {},
  };
  const [state, setState] = useState({
    guestCanPause: props.update
      ? props.guestCanPause
      : defaultProps.guestCanPause,
    votesToSkip: props.update ? props.votesToSkip : defaultProps.votesToSkip,
    errorMsg: "",
    successMsg: "",
  });
  const handlePauseChange = (e) => {
    const { name, value } = e.target;
    setState((prevState) => {
      return { ...prevState, [name]: value === "true" ? true : false };
    });
  };

  const handleVotesChange = (e) => {
    const { name, value } = e.target;
    setState((prevState) => {
      return { ...prevState, [name]: value };
    });
  };

  const handleCreateSubmit = () => {
    const params = {
      votes_to_skip: state.votesToSkip,
      guest_can_pause: state.guestCanPause,
    };
    axios
      .post("http://127.0.0.1:8000/api/create-room", params)
      .then((res) => props.history.push(`/room/${res.data.code}`));
  };

  const handleUpdateSubmit = () => {
    const params = {
      votes_to_skip: state.votesToSkip,
      guest_can_pause: state.guestCanPause,
      code: props.roomCode,
    };
    axios.patch("http://127.0.0.1:8000/api/update-room", params).then((res) => {
      if (res.statusText == "OK") {
        setState((prevValues) => {
          return {
            ...prevValues,
            successMsg: "Room was updated",
          };
        });
      } else {
        setState((prevValues) => {
          return {
            ...prevValues,
            errorMsg: "Error updating the room",
          };
        });
      }
      props.useCallback();
    });
  };

  const renderCreateButtons = () => {
    return (
      <Grid container spacing={1} align="center">
        <Grid item xs={12}>
          <Button
            color="primary"
            variant="contained"
            onClick={handleCreateSubmit}
          >
            Create a Room
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Button color="secondary" variant="contained" to="/" component={Link}>
            Back
          </Button>
        </Grid>
      </Grid>
    );
  };

  const renderUpdateButtons = () => {
    return (
      <Grid item xs={12}>
        <Button
          color="primary"
          variant="contained"
          onClick={handleUpdateSubmit}
        >
          Update Room
        </Button>
      </Grid>
    );
  };

  const title = props.update ? "Update a Room" : "Create a Room";
  return (
    <Grid container spacing={1} align="center">
      <Grid item xs={12}>
        <Collapse in={state.errorMsg !== "" || state.successMsg !== ""}>
          {state.successMsg !== "" ? (
            <Alert
              severity="success"
              onClose={() =>
                setState((prevValues) => {
                  return { ...prevValues, successMsg: "" };
                })
              }
            >
              {state.successMsg}
            </Alert>
          ) : (
            <Alert
              severity="error"
              onClose={() =>
                setState((prevValues) => {
                  return { ...prevValues, errorMsg: "" };
                })
              }
            >
              {state.errorMsg}
            </Alert>
          )}
        </Collapse>
      </Grid>
      <Grid item xs={12}>
        <Typography component="h4" variant="h4">
          {title}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <FormControl component="fieldset">
          <FormHelperText component="span">
            <div align="center">Guest Control of Playback State</div>
          </FormHelperText>
          <RadioGroup
            name="guestCanPause"
            onChange={handlePauseChange}
            row
            defaultValue={state.guestCanPause.toString()}
          >
            <FormControlLabel
              value="true"
              control={<Radio color="primary" />}
              label="Play/Pause"
              labelPlacement="bottom"
            />
            <FormControlLabel
              value="false"
              control={<Radio color="secondary" />}
              label="No Control"
              labelPlacement="bottom"
            />
          </RadioGroup>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControl>
          <TextField
            name="votesToSkip"
            onChange={handleVotesChange}
            required={true}
            type="number"
            defaultValue={state.votesToSkip}
            inputProps={{ min: 1, style: { textAlign: "center" } }}
          />
          <FormHelperText component="span">
            <div align="center">Votes Required to Skip Song</div>
          </FormHelperText>
        </FormControl>
      </Grid>
      {props.update ? renderUpdateButtons() : renderCreateButtons()}
    </Grid>
  );
}

export default CreateRoom;
