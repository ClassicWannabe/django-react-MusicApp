import CreateRoom from './CreateRoom'
import JoinRoom from './JoinRoom'
import {BrowserRouter as Router, Switch, Route, Link, Redirect} from 'react-router-dom'

function HomePage() {
    return (
        <div>
            <Router>  
              <Switch>         
                <Route path='/create' component={CreateRoom} />
                <Route path='/join' component={JoinRoom} />
                <Route path='/'>hey</Route>
              </Switch>
            </Router>
        </div>
    )
}

export default HomePage
