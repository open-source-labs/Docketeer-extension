import React from 'react';
import styles from './SideBar.module.scss';
import { NavLink } from 'react-router-dom';

interface SideBarProps {
  isOpen: boolean;
  prune: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
  toggleSideBar: (e: React.MouseEvent) => void;
}

const SideBar = ({ isOpen, prune, toggleSideBar }: SideBarProps): React.JSX.Element => {
  const sidebarConditional = isOpen
    ? `${styles.SideBar} ${styles['sidebar-open']}`
    : `${styles.SideBar} ${styles['sidebar-closed']}`;

  return (
    <div
      style={{ width: isOpen ? 'fit-content' : '0px' }}
      className={sidebarConditional}
      data-testid='sidebar'
    >
      <div>
        <NavLink
          className={({ isActive }) =>
            isActive ? styles.active : styles.navButton
          }
          to="/metrics"
          onClick={toggleSideBar}
        >
          CONTAINER METRICS
        </NavLink>
      </div>
      <div>
        <NavLink
          className={({ isActive }) =>
            isActive ? styles.active : styles.navButton
          }
          to="/snapshots"
          onClick={toggleSideBar}
        >
          SNAPSHOTS
        </NavLink>
      </div>
      <div>
        <NavLink
          className={({ isActive }) =>
            isActive ? styles.active : styles.navButton
          }
          to="/K8Metrics"
          onClick={toggleSideBar}
        >
          KUBERNETES METRICS
        </NavLink>
      </div>
      <div>
        <NavLink
          className={({ isActive }) =>
            isActive ? styles.active : styles.navButton
          }
          to="/volume"
          onClick={toggleSideBar}
        >
          VOLUMES
        </NavLink>
      </div>
      <div>
        <NavLink
          className={({ isActive }) =>
            isActive ? styles.active : styles.navButton
          }
          to="/logs"
          onClick={toggleSideBar}
        >
          PROCESS LOGS
        </NavLink>
      </div>
      <div>
        <NavLink
          className={({ isActive }) =>
            isActive ? styles.active : styles.navButton
          }
          to="/configuration"
          onClick={toggleSideBar}
        >
          CONFIGURATIONS
        </NavLink>
      </div>
      <div>
        <a className={styles.navButton} onClick={(e) => prune(e)}>
          PRUNE
        </a>
      </div>
    </div>
  );
};

export default SideBar;
