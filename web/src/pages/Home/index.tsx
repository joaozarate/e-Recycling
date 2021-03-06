import React from 'react';
import {FiLogIn} from 'react-icons/fi';
import {Link} from 'react-router-dom';

import './styles.css';

import logo from '../../assets/logo.svg';

const Home = () => {
    return (
        <div id="page-home">
            <div className="content">
                <header>
                    <img src={logo} alt="e-Recycling" />
                </header>
                <main>
                    <h1>Your place<br/>of waste collection.</h1>
                    <p>We help people to find<br/>drop-off points efficiently.</p>
                    <Link to="/create-point">
                        <span>
                            <FiLogIn />
                        </span>
                        <strong>Register a drop-off point</strong>
                    </Link>
                </main>
            </div>
        </div>
    );
}

export default Home;