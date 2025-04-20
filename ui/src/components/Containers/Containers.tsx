/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { ContainerType } from '../../../ui-types';
import { useAppSelector, useAppDispatch } from '../../reducers/hooks';
import { createAlert, createPrompt } from '../../reducers/alertReducer';
import styles from './Containers.module.scss';
import ContainersCard from '../ContainersCard/ContainersCard';
import Client from '../../models/Client';
import { fetchRunningContainers, fetchStoppedContainers, displayErrorModal } from '../../reducers/containerReducer';
import ErrorModal from './ErrorModal/ErrorModal';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import FilterButton from '../ContainersCard/FilterButton';
import filter from '../../../assets/filter.png'

/**
 * @module | Containers.tsx
 * @description | Provides information and management over both running & stopped Docker containers
 **/

const Containers = (): JSX.Element => {
  // State to manage the currently active button for displaying container stats
  const [activeButton, setActiveButton] = useState(1);
  // State to manage currently 
  const [filters, setFilters] = useState({
    cpuPerc: true,
    memUsage: true,
    memPerc: true,
    netIO: true,
    blockIO: true,
    PID: true,
  });

  // Redux dispatch and selector hooks
  const dispatch = useAppDispatch();
  const { runningList, stoppedList } = useAppSelector((state) => state.containers);
  console.log('runningList', runningList)
  const errorModalOn = useAppSelector((state) => state.containers.errorModalOn);
  const handleClose = () => dispatch(displayErrorModal(false));

  // Function to initiate a bash session in a container
  const bashContainer = async (id: string) => await Client.ContainerService.bashContainer(id);

  // Function to stop a container
  const stopWrapper = async (id: string) => {
    //checks the container list with that specific ID to see if its stopped
    const wasStopped = await Client.ContainerService.stopContainer(id);
    //if it is stopped then update the state in the store
    if (wasStopped) {
      //fetchStoppedContainers() returns an array of stopped containers
      dispatch(fetchStoppedContainers());
      dispatch(fetchRunningContainers());
    }
  };
  // Function to start a container
  const startWrapper = async (id: string) => {
    const wasStarted = await Client.ContainerService.runContainer(id);
    if (wasStarted) {
      dispatch(fetchStoppedContainers());
      dispatch(fetchRunningContainers());
    }
  };
  // Function to remove a container
  const removeWrapper = async (containerId: string) => {
    const wasRemoved = await Client.ContainerService.removeContainer(containerId);
    if (wasRemoved) {
      dispatch(fetchRunningContainers());
      dispatch(fetchStoppedContainers());
    }
  };
  // Handlers for stopping, running, and removing containers
  // These also create prompts and alerts for user interactions
  const stopContainer = (container: ContainerType) => {
    // changeState(prev => prev+1)
    dispatch(
      createPrompt(
        `Are you sure you want to stop ${container.Names}?`,
        () => {
          stopWrapper(container.ID);
          dispatch(createAlert(`Stopping ${container.Names}...`, 5, 'error'));
        },
        () => {
          dispatch(
            createAlert(`The request to stop ${container.Names} has been cancelled.`, 5, 'warning')
          );
        }
      )
    );
  };

  const runContainer = (container: ContainerType) => {
    dispatch(
      createPrompt(
        `Are you sure you want to run ${container.Names}?`,
        () => {
          startWrapper(container['ID']);
          dispatch(createAlert(`Running ${container.Names}...`, 5, 'success'));
        },
        () => {
          dispatch(
            createAlert(`The request to run ${container.Names} has been cancelled.`, 5, 'warning')
          );
        }
      )
    );
  };

  const removeContainer = (container: ContainerType) => {
    dispatch(
      createPrompt(
        `Are you sure you want to remove ${container.Names}?`,
        () => {
          removeWrapper(container['ID']);
          dispatch(createAlert(`Removing ${container.Names}...`, 5, 'success'));
        },
        () => {
          dispatch(
            createAlert(
              `The request to remove ${container.Names} has been cancelled.`,
              5,
              'warning'
            )
          );
        }
      )
    );
  };

     const actions = [
    {
      id: "action1",
      label: "CPU %",
      handler: () => {
        setFilters((prevFilters) => ({
          ...prevFilters,
          cpuPerc: !prevFilters.cpuPerc,
        }));
        console.log("CPU% removed from view")
      }
    },
    {
      id: "action2",
      label: "MEMORY USAGE",
      handler: () => {
        setFilters((prevFilters) => ({
          ...prevFilters,
          memUsage: !prevFilters.memUsage,
        }));
        console.log("Memory usage removed from view")
      }
    },
    {
      id: "action3",
      label: "MEM %",
      handler: () => {
        setFilters((prevFilters) => ({
          ...prevFilters,
          memPerc: !prevFilters.memPerc,
        }));
        console.log("Memory % removed from view")
      }
    },
    {
      id: "action4",
      label: "NET I/O",
      handler: () => {
        setFilters((prevFilters) => ({
          ...prevFilters,
          netIO: !prevFilters.netIO,
        }));
        console.log("Net I/O removed from view")
      }
    },
    {
      id: "action5",
      label: "BLOCK I/O",
      handler: () => {
        setFilters((prevFilters) => ({
          ...prevFilters,
          blockIO: !prevFilters.blockIO,
        }));
        console.log("Block I/O removed from view")
      }
    },
    {
      id: "action6",
      label: "PID",
      handler: () => {
        setFilters((prevFilters) => ({
          ...prevFilters,
          PID: !prevFilters.PID,
        }));
        console.log("PID removed from view")
      }
    },
  ];



  return (
      <div className={styles.wrapper}>
        <h1 className={styles.containersTitle}>CONTAINERS</h1>
        <div className={styles.listHolder}>
          <div className={styles.toggle}>
            <div>
              {activeButton === 1 && (
                <iframe
                  src='http://localhost:49155/d-solo/h5LcytHGz/system?orgId=1&refresh=10s&panelId=81'
                  width='100%'
                  height='200'></iframe>
              )}
              {activeButton === 2 && (
                <iframe
                  src='http://localhost:49155/d-solo/h5LcytHGz/system?orgId=1&refresh=10s&panelId=7'
                  width='100%'></iframe>
              )}
              {activeButton === 3 && (
                <iframe
                  src='http://localhost:49155/d-solo/h5LcytHGz/system?orgId=1&refresh=10s&panelId=8'
                  width='100%'></iframe>
              )}
            </div>
            <div className={styles.buttons}>
              <button
                className={activeButton === 1 ? styles.active : styles.notActive}
                onClick={() => setActiveButton(1)}>
                Memory
              </button>
              <button
                className={activeButton === 2 ? styles.active : styles.notActive}
                onClick={() => setActiveButton(2)}>
                Block I/O
              </button>
              <button
                className={activeButton === 3 ? styles.active : styles.notActive}
                onClick={() => setActiveButton(3)}>
                Net I/O
              </button>
            </div>
          </div>

        <div className={styles.counterDiv}>
          <div className = {styles.subCounterDiv}>
          <h2 style={{ color: '#F1EFEC' }}>RUNNING CONTAINERS</h2>
            <p className={styles.count}>Count: {runningList.length}</p>
          </div>
          <FilterButton
            buttonText= {<img src = {filter} alt="Filter" height = '35px' width = '35px'/>} className={styles.filterButton} 
            actions={actions} 
        />
        </div>
          
          
    
          <ErrorModal open={errorModalOn} handleClose={handleClose} />
          <div className={styles.containerList}>
            {runningList.length === 0 && stoppedList.length === 0 ? (
              <h3>Loading containers, please wait...</h3>
            ) : (
              <ContainersCard
                containerList={runningList}
                stopContainer={stopContainer}
                runContainer={runContainer}
                bashContainer={bashContainer}
                removeContainer={removeContainer}
                status="running"
                filters={filters}
              />
            )}
            {runningList.length === 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: '1%' }}>
                <CircularProgress />
              </Box>
            )}
          </div>
        </div>
        <div className={styles.listHolderStopped}>
          <h2 style={{ color: '#F1EFEC' }}>STOPPED CONTAINERS</h2>
          <p className={styles.count}>Count: {stoppedList.length}</p>
          <div className={styles.containerList}>
            <ContainersCard
              containerList={stoppedList}
              stopContainer={stopContainer}
              runContainer={runContainer}
              bashContainer={bashContainer}
              removeContainer={removeContainer}
              status="stopped"
              filters={filters}
            />
          </div>
        </div>
      </div>
    
  );
};

export default Containers;
