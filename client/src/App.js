import React, { useState } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Toast from 'react-bootstrap/Toast';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import LeaderBoard from './components/leaderboard';
import Assignment from './components/assignment';
import UserProfile from './components/userprofile';
import NavigationBar from './components/navigationbar'
import './App.css';

import LoginPage from './components/LoginPage'
const App = () => (
    
    <div className="App">
        <NavigationBar></NavigationBar>
        <Container className="p-3">
            <Switch>
                <Route exact path="/">
                    <Redirect to="login" />
                </Route>
                <Route
                    exact
                    path="/leaderboard"
                    component={LeaderBoard}
                />
                <Route
                    path="/login"
                    render={() => (
                        <LoginPage />
                    )}
                />
            </Switch>
        </Container>
    </div>
);

export default App;
