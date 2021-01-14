import CreateRoom from "./CreateRoom";
import JoinRoom from "./JoinRoom";
import Room from "./Room";
import { Button, ButtonGroup, Grid, Typography } from "@material-ui/core";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function HomePage() {
  const [code, setCode] = useState(null);

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/api/user-in-room`)
      .then((res) => setCode(res.data.code));
  }, []);

  const renderHomePage = () => {
    return (
      <Grid container spacing={3} align="center">
        <Grid item xs={12}>
          <Typography variant="h3" component="h3">
            Musical Party
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <ButtonGroup disableElevation variant="contained" color="primary">
            <Button color="primary" to="/join" component={Link}>
              Join a Room
            </Button>
            <Button color="secondary" to="/create" component={Link}>
              Create a Room
            </Button>
          </ButtonGroup>
        </Grid>
      </Grid>
    );
  };

  return (
    <div>
      <Router>
        <Switch>
          <Route path="/create" component={CreateRoom} />
          <Route path="/join" component={JoinRoom} />
          <Route path="/room/:roomCode" render={(props) => <Room {...props} clearRoom={() => setCode(null)} />} />
          <Route
            path="/"
            render={() => {
              return code ? (
                <Redirect to={`/room/${code}`} />
              ) : (
                renderHomePage()
              );
            }}
          />
        </Switch>
      </Router>
    </div>
  );
}

export default HomePage;
