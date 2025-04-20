import React, { useState, useEffect } from 'react';
import { useRef, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../../reducers/hooks';
import { createAlert } from '../../reducers/alertReducer';
import { ContainerType, ContainersCardsProps, stats } from '../../../ui-types';
import RunningContainer from '../RunningContainer/RunningContainer';
import PageSwitch from './PageSwitch';
import Client from '../../models/Client';
import { fetchNetworkAndContainer } from '../../reducers/networkReducer';

/**
 * @module | ContainersCard.tsx
 * @description | This component renders RunningContainer component and passes functions for connecting/disconnecting to the network as props.
 **/

/**
 * A custom hook which gets the stats of all Docker containers.
 */
const ContainersCard = ({
  containerList,
  stopContainer,
  runContainer,
  removeContainer,
  bashContainer,
  status,
  filters,
}: ContainersCardsProps): JSX.Element => {

  //initialize containerMetrics state with an empty array
  const dispatch = useAppDispatch();

   const scrollPosition = useRef(0); 
  
  useEffect(() => {
    const handleScroll = () => {
      scrollPosition.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Restore scroll position after data load (with a delay to avoid instant reset)
  useEffect(() => {
    const timer = setTimeout(() => {
      window.scrollTo(0, scrollPosition.current);
    }, 200); // Delay to avoid reset during data loading (you can adjust the delay)

    return () => clearTimeout(timer); // Cleanup timer on component unmount or when containerList changes
  }, [containerList]); 


 // retrieves container data by fetching from Docker 
  let ddClient;
  const [containerMetrics, setContainerMetrics] = useState<stats[]>([]);

  /**
   * Cleans ANSI escape codes from the Docker stats output
   */
  const cleanAnsiCodes = (str: string): string => {
    return str.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
  };

  //useEffect hook to fetch container metrics
  useEffect(() => {
    //move the ddclient declaration inside the useEffect to prevent scope issues
    let ddClient: any;
    let isSubscribed = true;

    async function displayMetrics() {
      try {
        const { createDockerDesktopClient } = await import("@docker/extension-api-client");
        ddClient = createDockerDesktopClient();
        
        ddClient.docker.cli.exec(
          'stats',
          ['--all', '--no-trunc', '--format', '{{ json . }}'],
          {
            stream: {
              onOutput(data) {
                // Prevent state updates if component has unmounted
                // This avoids memory leaks and prevents errors from updating unmounted component
                if (!isSubscribed) return;
                
                try {
                  // Check if we have any output data from Docker stats
                  if (data.stdout) {
                    // Clean the output by:
                    // 1. Removing ANSI escape codes (terminal formatting)
                    // 2. Trimming whitespace from both ends
                    const cleanedData = cleanAnsiCodes(data.stdout).trim();
                    
                    // Skip processing if:
                    // 1. The data is empty after cleaning
                    // 2. The data doesn't start with '{' (indicating it's not valid JSON)
                    if (!cleanedData || !cleanedData.startsWith('{')) {
                      return;
                    }
                    
                    // Parse the cleaned string into a JavaScript object
                    const parsedData = JSON.parse(cleanedData);
                    
                    // Update the containerMetrics state using functional update
                    // This ensures we're working with the latest state
                    setContainerMetrics(prevMetrics => {
                      // Find if we already have metrics for this container
                      // by matching the Container ID from the parsed data
                      const existingIndex = prevMetrics.findIndex(m => m.Container === parsedData.Container);
                      
                      if (existingIndex >= 0) {
                        // If we found existing metrics for this container:
                        // 1. Create a copy of the previous metrics array
                        // 2. Update the metrics for this specific container
                        // 3. Keep all other container metrics unchanged
                        const newMetrics = [...prevMetrics];
                        newMetrics[existingIndex] = parsedData;
                        return newMetrics;
                      }
                      
                      // If this is a new container, add its metrics to the array
                      return [...prevMetrics, parsedData];
                    });
                  }
                } catch (error) {
                  // Log any parsing errors and the raw data for debugging
                  // This helps identify issues with the Docker stats output
                  console.error('Error parsing container stats:', error);
                  console.log('Raw data:', data.stdout);
                }
              },
              onError(error) {
                console.error('Error in container stats stream:', error);
              },
              splitOutputLines: true,
            },
          }
        );
      } catch (error) {
        console.error('Error initializing Docker client:', error);
      }
    }

    displayMetrics();

    return () => {
      isSubscribed = false;
      if (ddClient) {
        ddClient.close?.();
      }
    };
  }, []);

  async function connectToNetwork(
    networkName: string,
    containerName: string
  ): Promise<void> {
    try {
      const result = await Client.NetworkService.connectContainerToNetwork(networkName, containerName);
      if (result) {
        dispatch(fetchNetworkAndContainer());
      }

    } catch (err) {
      dispatch(
        createAlert(
          'An error occurred while attaching to network : ' + err,
          4,
          'error'
        )
      );
    }
  }

  async function disconnectFromNetwork(
    networkName: string,
    containerName: string,
  ): Promise<void> {
    try {
      const result = await Client.NetworkService.disconnectContainerFromNetwork(networkName, containerName);
      if (result) {
        dispatch(fetchNetworkAndContainer());
      }
    } catch (err) {
      dispatch(
        createAlert(
          'An error occurred while disconnecting from network : ' + err,
          4,
          'error'
        )
      );
    }
  }

    const [visibleCount, setVisibleCount] = useState(3);
    const observer = useRef<IntersectionObserver | null>(null);
     
const lastContainerRef = useCallback((node) => {
  if (observer.current) observer.current.disconnect();

  observer.current = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      const previousScrollY = window.scrollY; 

      setVisibleCount((prevCount) => {
        const newCount = Math.min(prevCount + 3, containerList.length);

        requestAnimationFrame(() => {
          window.scrollTo(0, previousScrollY);
        });

        return newCount;
      });
    }
  });

  if (node) observer.current.observe(node);
}, [containerList.length]);
  
  useEffect(() => {
  requestAnimationFrame(() => {
    window.scrollTo(0, scrollPosition.current); 
  });
}, [containerList]);
  
//   const lastContainerRef = useCallback((node) => {
//   if (observer.current) observer.current.disconnect(); 
//   observer.current = new IntersectionObserver((entries) => {
//     if (entries[0].isIntersecting) {
//       setVisibleCount((prevCount) => Math.min(prevCount + 2, containerList.length));
//     }
//   });
//   if (node) observer.current.observe(node);
// }, [containerList.length]);
  // populates each container card with metrics 
  const RunningContainers = containerList.map((container: ContainerType, i: number) => {
    let metrics = null;
    if (containerMetrics !== undefined) {
      for (const item of containerMetrics) {
        if (item.Container === container.ID) {
          metrics = item;
          break;
        }
      }
    }
    
    return (
      <RunningContainer
        container={container}
        metrics={metrics}
        key={`container-${i}`}
        stopContainer={stopContainer}
        runContainer={runContainer}
        removeContainer={removeContainer}
        bashContainer = {bashContainer}
        connectToNetwork={connectToNetwork}
        disconnectFromNetwork={disconnectFromNetwork}
        status={status}
        filters={filters}
        ref={i === visibleCount - 1 ? lastContainerRef : null}
      />
    );
  }
  );

   const VisibleRunningContainers = RunningContainers.slice(0, visibleCount);
  // const [currentPage, setPage] = useState(1);
  // const COUNT_PER_PAGE = 5;
  // // index of last container on each page
  // const lastContainerI = COUNT_PER_PAGE * currentPage;
  // const firstContainerI = lastContainerI - COUNT_PER_PAGE;
  // const slicedRunningContainers = RunningContainers.slice(firstContainerI, lastContainerI);
  return (
    // <>
    //   {slicedRunningContainers}
    //   <PageSwitch totalContainers = {RunningContainers.length} setPage = {setPage} contPerPage = {COUNT_PER_PAGE}/>
    // </>
    <>{VisibleRunningContainers}</>
  );
};

export default ContainersCard;