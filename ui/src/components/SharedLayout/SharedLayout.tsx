import React, { useEffect, useState, useRef } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../reducers/hooks';
import { createAlert } from '../../reducers/alertReducer';
import { createPrunePrompt } from '../../reducers/pruneReducer';
import Alert from '../../components/Alert/Alert';
import SideBar from '../../components/SideBar/SideBar';
import styles from './SharedLayout.module.scss';
import docketeerLogo from '../../../assets/docketeer-logo-light.png';
import MenuIcon from '../../../assets/menu_icon_36dp.svg';
import {
  fetchRunningContainers,
  fetchStoppedContainers,
} from '../../reducers/containerReducer';
import { fetchNetworkAndContainer } from '../../reducers/networkReducer';
import {
  fetchAllContainersOnVolumes,
  fetchAllDockerVolumes,
} from '../../reducers/volumeReducer';
import Client from '../../models/Client';
import Switch, { switchClasses } from '@mui/joy/Switch';
import { Theme } from '@mui/joy';


/**
 * @module | SharedLayout.tsx
 * @description | This component renders a navbar at the top that allows you to select which tab you would like to view.
 **/

function SharedLayout(): JSX.Element {
  // navBar useState
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [checked, setChecked] = useState<boolean>(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const buttonRef = useRef<HTMLImageElement>(null);
  const dropdownRef = useRef(null);
  const dispatch = useAppDispatch();

  // navBar functionality
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

    const handleMouseOn = () => {
  if (hoverTimeout) {
  clearTimeout (hoverTimeout);
  setHoverTimeout(null);
  }
      setIsOpen(true);
}

  const handleMouseOff = () => {
  const timeout = setTimeout(()=> {
  setIsOpen(false);
  },1000);
  setHoverTimeout(timeout)
};


  const handleNetworkPrune = async (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    e.preventDefault();
    const successful = await Client.NetworkService.pruneNetwork();
    if (!successful) console.error(`Coudn't prune network`);
  };

  const handleSystemPrune = async (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    e.preventDefault();
    const successful = await Client.SystemService.pruneSystem();
    if (!successful) console.error(`Coudn't prune system`);
  };

  const prune = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    toggleSidebar();
    
    dispatch(
      createPrunePrompt(
        // prompt (first argument in createPrunePrompt)
        'Are you sure you want to run system / network prune? System prune will remove all unused containers, networks, images and Network prune will remove all unused networks only (both dangling and unreferenced).',
        // handleSystemPrune (second argument in creatPrunePrompt)
        () => {
          handleSystemPrune(e);
          dispatch(createAlert('Performing system prune...', 2, 'success'));
        },
        // handleNetworkPrune (third argument in creatPrunePrompt)
        () => {
          handleNetworkPrune(e);
          dispatch(createAlert('Performing network prune...', 2, 'success'));
        },
        // handleDeny (fourth argument in creatPrunePrompt)
        () => {
          dispatch(
            createAlert(
              'The request to perform system / network prune has been cancelled.',
              2,
              'warning'
            )
          );
        }
      )
    );
	};
	
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const star = document.getElementById('stars');
		const star2 = document.getElementById('stars2');
		if (checked) {
			star.classList.remove('stars');
			star2.classList.remove('stars2');
		} else {
			star.classList.add('stars');
			star2.classList.add('stars2');
		}
		setChecked(event.target.checked);
	}
  
  const { volumes } = useAppSelector((state) => state.volumes);

  useEffect(() => {
    dispatch(fetchRunningContainers());
    dispatch(fetchStoppedContainers());
    dispatch(fetchNetworkAndContainer());
    dispatch(fetchAllDockerVolumes());
  }, []);

  useEffect(() => {
    dispatch(fetchAllContainersOnVolumes());
  }, [volumes]);


  return (
    <div>
      <nav className={styles.navBar}>
        <div style={{ marginLeft: "50px" }}>
          {/* LOGO */}
          <NavLink to="/" className={styles.logoDiv}>
            <h1>Docketeer</h1>
            <img
              className={styles.logo}
              src={docketeerLogo}
              alt="docketeer-logo"
              width="45"
              height="45"
            ></img>
          </NavLink>
        </div>
        {/* Toggle */}
        <div className={styles.switch}>
          <Switch
            sx={(theme: Theme) => ({
              "--Switch-thumbShadow": "0 3px 7px 0 rgba(0 0 0 / 0.12)",
              "--Switch-thumbSize": "18px",
              "--Switch-trackWidth": "45px",
              "--Switch-trackHeight": "22px",
              "--Switch-trackBackground": "rgb(56, 52, 52)",
              [`& .${switchClasses.thumb}`]: {
                transition: "width 0.2s, left 0.2s",
              },
              "&:hover": {
                "--Switch-trackBackground": "rgb(73, 71, 71)",
              },
              "&:active": {
                "--Switch-thumbWidth": "32px",
              },
              [`&.${switchClasses.checked}`]: {
                "--Switch-trackBackground": "rgb(41, 61, 134)",
                "&:hover": {
                  "--Switch-trackBackground": "rgb(14, 27, 76)",
                },
              },
            })}
            checked={checked}
            onChange={handleChange}
          />
        </div>
        <div className={styles.navSpacer}>
          <ul>
            <li>
              <NavLink
                className={({ isActive }) =>
                  isActive ? styles.active : styles.navButton
                }
                to="/"
              >
                CONTAINERS
              </NavLink>
            </li>
            <li>
              <NavLink
                className={({ isActive }) =>
                  isActive ? styles.active : styles.navButton
                }
                to="/network"
              >
                NETWORKS
              </NavLink>
            </li>
            <li>
              <NavLink
                className={({ isActive }) =>
                  isActive ? styles.active : styles.navButton
                }
                to="/images"
              >
                IMAGES
              </NavLink>
            </li>
          </ul>
          <div className={styles.hamburgerIcon}
            ref={dropdownRef}
            onMouseEnter={handleMouseOn}
            onMouseLeave={handleMouseOff}
          >
            <img
              src={MenuIcon}
              onClick={toggleSidebar}
              ref={buttonRef}
            ></img>
            {isOpen && (
              <SideBar
                toggleSideBar={toggleSidebar}
                prune={prune}
                isOpen={isOpen}
              />
            )}
          </div>
        </div>
      </nav>
      <div className={styles.navMargin}></div>
      <Alert />
      <Outlet />
    </div>
  );
}

export default SharedLayout;
