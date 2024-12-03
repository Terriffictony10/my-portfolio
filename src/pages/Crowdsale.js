import { useEffect } from 'react';
import CrowdsaleBody from '../components/crowdsaleBody.js';

export default function Home() {
    const showSidebar = () => {
        const sidebar = document.querySelector('.sidebar');
        const menu = document.querySelector('.menu');
        sidebar.style.display = 'flex';
        menu.style.display = 'none';
    };

    const hideSidebar = () => {
        const sidebar = document.querySelector('.sidebar');
        const menu = document.querySelector('.menu');
        sidebar.style.display = 'none';
        menu.style.display = 'flex';
    };

    // Detect when screen size changes and reset the inline styles
    useEffect(() => {
        const handleResize = () => {
            const menu = document.querySelector('.menu');
            if (menu && window.innerWidth > 800) {
                menu.style.display = ''; // Reset inline style to let CSS handle it
            }
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const navigateToCrowdsale = () => {
        window.location.href = '/Crowdsale';
    };
    const navigateToIndex = () => {
        window.location.href = '/';
    };

    const navigateToNFT = () => {
        window.location.href = '/NFT';
    };
    const navigateToDemo = () => {
        window.location.href = '/Demo';
    };

    return (
        <div>
            <div>
                <title>Decentratality</title>
                <nav>
                    <ul className="sidebar">
                        <li onClick={hideSidebar}>
                            <a href="#" className="centered">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    height="48px"
                                    viewBox="15 -960 960 960"
                                    width="48px"
                                    fill="white"
                                >
                                    <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                                </svg>
                            </a>
                        </li>
                        <li onClick={navigateToCrowdsale}>
                            <a href="#">Crowdsale</a>
                        </li>
                        <li onClick={navigateToNFT}>
                            <a href="#">NFT</a>
                        </li>
                        <li>
                            <a href="#">DAO</a>
                        </li>
                        <li>
                            <a href="#">About</a>
                        </li>
                        <li>
                            <a href="#">Project</a>
                        </li>
                        <li onClick={navigateToDemo}>
                            <a href="#">Demo</a>
                        </li>
                    </ul>
                    <ul>
                        <li>
                            <a href="#" className="big" onClick={navigateToIndex}>
                                Decentratality
                            </a>
                        </li>
                        <li className="hideOnMobile" onClick={navigateToCrowdsale}>
                            <a href="#">Crowdsale</a>
                        </li>
                        <li className="hideOnMobile" onClick={navigateToNFT}>
                            <a href="#">NFT</a>
                        </li>
                        <li className="hideOnMobile">
                            <a href="#">DAO</a>
                        </li>
                        <li className="hideOnMobile">
                            <a href="#">About</a>
                        </li>
                        <li className="hideOnMobile">
                            <a href="#">Project</a>
                        </li>
                        <li className="hideOnMobile" onClick={navigateToDemo}>
                            <a href="#">Demo</a>
                        </li>
                        <li onClick={showSidebar} className="menu">
                            <a href="#">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    height="48px"
                                    viewBox="0 -960 960 960"
                                    width="48px"
                                    fill="white"
                                >
                                    <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
                                </svg>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>

            <div className="crowdsaleBody">
                <div className="Crowdsale-glass">
                    <CrowdsaleBody className="Crowdsale" />
                </div>
            </div>
        </div>
    );
}
