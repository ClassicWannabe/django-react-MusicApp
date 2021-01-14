import { useEffect, useState } from "react";
import axios from "axios";

function Room(props) {
  const [state, setState] = useState({
    votesToSkip: 2,
    guestCanPause: false,
    isHost: false,
  });
  console.log(state.guestCanPause);

  useEffect(
    () =>
      axios
        .get(
          `http://127.0.0.1:8000/api/room?code=${props.match.params.roomCode}`
        )
        .then((res) =>
          {console.log(res.data); 
            setState({
            votesToSkip: res.data.votes_to_skip,
            guestCanPause: res.data.guest_can_pause,
            isHost: res.data.is_host,
          })}
        ),
    []
  );
  return (
    <div>
      <p>{state.votesToSkip} </p>
      <p>{state.guestCanPause.toString()} </p>
      <p>{state.isHost.toString()} </p>
    </div>
  );
}

export default Room;
