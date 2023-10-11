import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import {
  sankey as d3Sankey,
  sankeyLinkHorizontal,
  sankeyJustify,
} from 'd3-sankey';
import { useAppSelector, useAppDispatch } from '../../reducers/hooks';
import { createAlert } from '../../reducers/alertReducer';
import globalStyles from '../global.module.scss';
import styles from './Network.module.scss';
import Client from '../../models/Client';
import {
  NetworkContainerListType,
  NetworkAttachedContainersInfo,
} from '../../../ui-types';
import { NetworkAndContainer } from 'types';
import { fetchNetworkAndContainer } from '../../reducers/networkReducer';

/**
 * @module | Network.tsx
 * @description | This component renders a tab for displaying and managing custom and default networks that Docker creates.
 **/

const Network = (): JSX.Element => {
  const [network, setNetwork] = useState('');
  const [duplicated, setDuplicated] = useState(false);
  const { networkContainerList } = useAppSelector(state => state.networks);
  const ref = useRef();
  const dispatch = useAppDispatch();
  // Array of valid css colors long enough to cover all possible networks that can be created in Docker.
  const cssColors = [
    'Aqua',
    'Aquamarine',
    'BlueViolet',
    'CadetBlue',
    'Chartreuse',
    'Chocolate',
    'Coral',
    'CornflowerBlue',
    'Crimson',
    'DarkBlue',
    'DarkCyan',
    'DarkGreen',
    'DarkMagenta',
    'DarkOrange',
    'DarkOrchid',
    'DarkSeaGreen',
    'DarkSlateGray',
    'DodgerBlue',
    'Firebrick',
    'Indigo',
    'Lightskyblue',
    'MediumPurple',
    'MediumSeaGreen',
    'OliveDrab',
    'Purple',
    'Seagreen',
    'Skyblue',
    'Slateblue',
    'Springgreen',
    'Teal',
    'Tomato',
    'Yellowgreen',
  ];


  useEffect(() => {
    dispatch(fetchNetworkAndContainer());
  }, []);

  // check the network name that user types in is already exist in current network list
  useEffect(() => {
    // populate the array that has all of the network name
    const networkNameList = networkContainerList.map(el => el.networkName);
    // if network name array has what user type in
    if (networkNameList.includes(network)) {
      // set the duplicate state as true
      setDuplicated(true);
    } else {
      // set the duplicate state as false if it is not
      setDuplicated(false);
    }
    // dependency is network state which is current value of input
  }, [network]);

  async function fetchNewNetwork(name: string): Promise<void> {
    try {
      const success = await Client.NetworkService.createNetwork(name);
      if (success) dispatch(fetchNetworkAndContainer());
    } catch (err) {
      dispatch(
        createAlert(
          'An error occurred while creating a new network : ' + err,
          4,
          'error',
        ),
      );
    }
  }

  // Invoked when 'Create new network' button is pressed. Sends POST request to backend with current state of input field in the body. Resets input field upon submission.
  const createNewNetwork = () => {
    // alert msg if user does not type anything in input field
    if (!network) {
      dispatch(createAlert('Please enter a network name.', 4, 'error'));
      return;
    }

    // alert msg if there's a special character that is not accepted
    const pattern = /^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,127}$/;
    if (!pattern.test(network)) {
      dispatch(
        createAlert(
          'The network name must start with an alphanumerical character and can contain alphanumerical characters, hypens, or underscores.',
          5,
          'warning',
        ),
      );
      setNetwork('');
      return;
    }
    //

    fetchNewNetwork(network);
    setNetwork('');
  };

  async function deleteNetwork(name: string): Promise<void> {
    try {
      const success = await Client.NetworkService.deleteNetwork(name);
      if (success) dispatch(fetchNetworkAndContainer());
    } catch (err) {
      dispatch(
        createAlert(
          'An error occurred while removing the network : ' + err,
          4,
          'error',
        ),
      );
    }
  }

  // function that returns array with network's attached container name
  const attachedContainers = (name: string): string[] => {
    const attachedContainerList: string[] = [];
    networkContainerList.forEach((el: NetworkAndContainer) => {
      // if current network objects's networkName property has a value which is matching the provided argument.
      if (el.networkName === name) {
        // assign attachedContainerList to array that filled with attached container name
        // * specified 'any' type for containerEl
        el.containers.forEach(containerEl => {
          attachedContainerList.push(`[${containerEl.Name}]`);
        });
      }
    });
    return attachedContainerList;
  };

  // function to display which containers are attached to a specific network
  const displayAttachedContainers = (name: string) => {
    const containerName: string[] = attachedContainers(name);
    const isAre = containerName.length > 1 ? 'are' : 'is';
    if (containerName.length) {
      dispatch(
        createAlert(
          'Currently ' +
            containerName +
            `${isAre} attached to ` +
            name +
            ' network.',
          4,
          'success',
        ),
      );
    } else {
      dispatch(
        createAlert(
          'No container attached to ' + name + ' network.',
          4,
          'success',
        ),
      );
    }
  };

  // Render Sankey Diagram
  // TODO resolve sankeyJustify functionality, line 280
  // * You will notice many 'any' type declarations. d3-sankey allows user-defined properties. As a result, TypeScript will try to find a a type such as 'd.name' that does not exist in the d3Sankey TS index. This is the reasoning behind so many 'any' type declarations, but could be amended in the future by aligning the types with what is available in d3Sankey TS index
  useEffect(() => {
    if (networkContainerList.length > 0) {
      const nodesObj = {};
      const liveNodes: any[] = [];
      const liveLinks: any[] = [];

      // iterate through networkContainerList
      networkContainerList.forEach(network => {
        // Ignore networks that are not connected to containers
        if (network.containers.length) {
          // Add network to nodes object
          liveNodes.push({
            name: network.networkName,
            category: 'network',
          });
          network.containers.forEach(container => {
            // if it doesn't already exist in nodes object, add it to object and list
            if (!nodesObj[container.Name]) {
              nodesObj[container.Name] = true;
              liveNodes.push({
                name: container.Name + ' ', // Blank space appended to container name in the case of container and network sharing the same name, which throws an error in d3-sankey.
                category: 'container',
              });
            }
            // create a link object for each connection
            liveLinks.push({
              source: network.networkName,
              target: container.Name + ' ',
              value: 1,
            });
          });
        }
      });

      d3.select(ref.current).select('svg').remove();

      const width = 1100;
      const height = Math.min(750, liveLinks.length * 50);
      const format = d3.format(',.0f');

      const svg = d3
        .select(ref.current)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', [0, 0, width, height])
        .attr(
          'style',
          'max-width: 100%; height: auto; font: 1rem Bai Jamjuree, sans-serif;',
        )
        .style('fill', 'white');

      const sankey = d3Sankey()
        .nodeId((d: any) => d.name)
        // .nodeAlign((d: any) => sankeyJustify(d, 1))
        .nodeWidth(15)
        .nodePadding(40)
        .extent([
          [10, 20],
          [width - 10, height - 20],
        ]);

      const { nodes, links } = sankey({
        nodes: liveNodes.map((d: any) => ({ ...d })),
        links: liveLinks.map((d: any) => ({ ...d })),
      });

      // nodeColors will be populated below when each node is assigned a color, and later used to color the path from the network to the container.
      const nodeColors = {};

      const rect = svg
        .append('g')
        .selectAll()
        .data(nodes)
        .join('rect')
        .attr('x', (d: any) => d.x0)
        .attr('y', (d: any) => d.y0)
        .attr('height', (d: any) => d.y1 - d.y0)
        .attr('width', (d: any) => d.x1 - d.x0)
        .attr('fill', (d: any) => {
          const color =
            d.category === 'container' ? 'WhiteSmoke' : 'LightSlateGray';
          nodeColors[d.name] = cssColors[nodes.indexOf(d)];
          return color;
        });

      rect
        .append('title')
        .text((d: any) =>
          d.value > 1
            ? `${d.name}\n${format(d.value)} Connections`
            : `${d.name}\n1 Connection`,
        );

      const link = svg
        .append('g')
        .attr('fill', 'none')
        .attr('stroke-opacity', 0.8)
        .selectAll()
        .data(links)
        .join('g')
        .style('mix-blend-mode', 'normal');

      link
        .append('path')
        .attr('d', sankeyLinkHorizontal())
        .attr('stroke', (d: any) => nodeColors[d.source.name])
        .attr('stroke-width', (d: any) => d.width);

      link
        .append('title')
        .text((d: any) => `${d.source.name} → ${d.target.name}}`);

      svg
        .append('g')
        .selectAll()
        .data(nodes)
        .join('text')
        .attr('x', (d: any) => (d.x0 < width / 2 ? d.x1 - 12 : d.x0 + 12))
        .attr('y', (d: any) => d.y0 - 12)
        .attr('dy', '0.35em')
        .attr('text-anchor', (d: any) => (d.x0 < width / 2 ? 'start' : 'end'))
        .text((d: any) =>
          d.name.length > 12 ? d.name.slice(0, 12).concat('...') : d.name,
        );
    }
  }, [networkContainerList]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.listHolder}>
        <div id={styles.networkList}>
          <h2>NETWORKS</h2>
          <input
            className={
              duplicated ? globalStyles.duplicatedInput : globalStyles.input
            }
            type='text'
            id='newNetwork'
            value={network}
            placeholder='Input network name here...'
            onChange={e => {
              setNetwork(e.target.value);
            }}
          />
          <button
            className={
              duplicated ? globalStyles.duplicatedButton1 : globalStyles.button1
            }
            onClick={() => createNewNetwork()}
            disabled={duplicated}>
            {duplicated ? 'DUPLICATED NETWORK NAME' : 'CREATE NEW NETWORK'}
          </button>
          <div className={styles.listHolder}>
            {networkContainerList.map(
              (network: NetworkContainerListType, index: number) => {
                if (
                  network.networkName !== 'bridge' &&
                  network.networkName !== 'docketeer_default' &&
                  !network.networkName.includes('extension_default')
                ) {
                  return (
                    <div className={styles.networkDiv} key={index}>
                      <p
                        id={styles.networkName}
                        onClick={() =>
                          displayAttachedContainers(network.networkName)
                        }>
                        {network.networkName}
                      </p>
                      <button
                        id={styles.networkDeleteButton}
                        onClick={() => deleteNetwork(network.networkName)}>
                        DELETE
                      </button>
                    </div>
                  );
                } else {
                  return (
                    <div className={styles.networkDiv} key={index}>
                      <p
                        id={styles.networkName}
                        onClick={() =>
                          displayAttachedContainers(network.networkName)
                        }>
                        {network.networkName}
                      </p>
                    </div>
                  );
                }
              },
            )}
          </div>
        </div>
      </div>
      <div className={styles.listHolder}>
        <h2 className={styles.sankeyTitle}>CONNECTIONS</h2>
        <div
          id='sankeyDiagram'
          className={styles.sankeyDiagram}
          ref={ref}></div>
      </div>
    </div>
  );
};

export default Network;
