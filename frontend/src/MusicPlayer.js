import {
  Grid,
  Typography,
  IconButton,
  Card,
  LinearProgress,
} from "@material-ui/core";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import axios from "axios";

function MusicPlayer(props) {
  const songProgress = (props.time / props.duration) * 100;

  const pauseSong = () => {
    axios.put(`http://127.0.0.1:8000/spotify/pause`).then(res => console.log(res));
  };

  const playSong = () => {
    axios.put(`http://127.0.0.1:8000/spotify/play`);
  };

  return (
    <Card>
      <Grid container align="center">
        <Grid item xs={4}>
          <img src={props.image_url} height="100%" width="100%" />
        </Grid>
        <Grid item xs={8}>
          <Typography component="h5" variant="h5">
            {props.title}
          </Typography>
          <Typography color="textSecondary" variant="subtitle1">
            {props.artist}
          </Typography>
          <div>
            <IconButton onClick={() => props.is_playing ? pauseSong() : playSong()}>
              {props.is_playing ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
            <IconButton>
              <SkipNextIcon />
            </IconButton>
          </div>
        </Grid>
      </Grid>
      <LinearProgress variant="determinate" value={songProgress} />
    </Card>
  );
}

export default MusicPlayer;
