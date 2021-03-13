import { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import type { RouteProps } from 'react-router-dom';

import './main.css';
import { StartPage } from './pages/startpage';

const routes: RouteProps[] = [
  {
    path: '/',
    component: StartPage,
    strict: true,
    exact: true,
  },
  {
    path: '/events/:eventId',
    render: () => <h1>Event...</h1>,
  },
];

ReactDOM.render(
  <StrictMode>
    <Router>
      <Switch>
        {routes.map((route, i) => (
          <Route key={i} {...route} />
        ))}
      </Switch>
    </Router>
  </StrictMode>,
  document.getElementById('root')
);
