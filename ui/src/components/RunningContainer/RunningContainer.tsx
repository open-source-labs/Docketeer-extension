import React, { useState } from 'react';
import { useAppSelector } from '../../reducers/hooks';
import { ContainersCardsProps } from '../../../ui-types';
import styles from './RunningContainer.module.scss';
import globalStyles from '../global.module.scss';
import NetworkListModal from '../NetworkListModal/NetworkListModal';

/**
 * @module | RunningContainers.tsx
 * @description | This component renders each container, and if a container is currently running, it passes the modal component for network configuration.
 **/

const RunningContainer = React.forwardRef<HTMLDivElement, ContainersCardsProps>(({
  container,
  metrics,
  stopContainer,
  runContainer,
  removeContainer,
  connectToNetwork,
  bashContainer,
  disconnectFromNetwork,
  status,
	filters,
}: ContainersCardsProps & {
  filters: Record<string, boolean>;
	}, ref): JSX.Element => {
	//TODO: make sure that filters type (the Record<string, boolean> thing) is necessary
  // Using useAppSelector for accessing to networkList state
  const { networkContainerList } = useAppSelector((state) => state.networks);
  // const networkContainerList = [{ networkName: 'testnetwork', containers: [{ containerName: 'testname', containerIP: 'testip' }]}]
  // create state that will use as toggle to show the modal or not
	const [isOpen, setIsOpen] = useState(false);
	const [loading, setLoading] = useState(false); 
  const [containers, setContainers] = useState([container]);
  // function for opening the modal
  const openNetworkList = () => {
    setIsOpen(true);
  };

  // function for closing the modal
  const closeNetworkList = () => {
    setIsOpen(false);
	};

	const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottom =
      e.currentTarget.scrollHeight ===
      e.currentTarget.scrollTop + e.currentTarget.clientHeight;
    if (bottom && !loading) {
      loadMoreContainers();
    }
	};
	
	const loadMoreContainers = () => {
		setLoading(true);
		setTimeout(() => {
			const newContainers = [
				{
					ID: '',
					Names: '',
					Image: '',
					RunningFor: '',
					Networks: []
				},
			];
			setContainers((prev) => [...prev, ...newContainers]);
			setLoading(false);
		}, 1000);
	};

  if (!container) return (<p>no container</p>);
  
  return (
		<div
			ref={ref}
			className={
				status === 'running'
					? styles.containerCard
					: styles.containerCardStopped
			}>
			<div className={styles.containerTextHolder}>
				<h2 className={styles.textSpacing} style={{ color: '#6cc6f0' }}>
					{container.Names}
				</h2>
				<div className={styles.flexSpacing}>
					<p className={styles.textSpacing}>
						<strong style={{ color: '#bfc1e0' }}>Image:</strong>{' '}
						{container.Image}
					</p>
					<p className={styles.textSpacing}>
						<strong style={{ color: '#bfc1e0' }}>ID:</strong> {container.ID}
					</p>
					{status === 'running' && (
						<p>
							<strong style={{ color: '#6cc6f0' }}>Running since: </strong>{' '}
							{container.RunningFor}
						</p>
					)}
					{status === 'stopped' && (
						<p>
							<strong style={{ color: '#e34f61' }}>Stopped: </strong>{' '}
							{container.RunningFor}
						</p>
					)}
				</div>
			</div>

      {status === "running" && (
        <div className={styles.containerMetricHolder}>
          <div className={styles.metricText}>
            {filters.cpuPerc && <div className={styles.metricSubtext}>
              <h5>CPU %</h5>
              {metrics && metrics.CPUPerc}
            </div>}
            {filters.memUsage && <div className={styles.metricSubtext}>
              <h5>MEM Usage</h5>
              {metrics && metrics.MemUsage}
            </div>}
            {filters.memPerc && <div className={styles.metricSubtext}>
              <h5>MEM %</h5>
              {metrics && metrics.MemPerc}
            </div>}
            {filters.netIO && <div className={styles.metricSubtext}>
              <h5>NET I/O</h5>
              {metrics && metrics.NetIO}
            </div>}
						{filters.blockIO && <div className={styles.metricSubtext}>
							<h5>BLOCK I/O</h5>
							{metrics && metrics.BlockIO}
						</div>}
            {filters.PID && <div className={styles.metricSubtext}>
              <h5>PID</h5>
              {metrics && metrics.PIDs}
            </div>}
          </div>
        </div>
      )}
      <div className={styles.buttonHolder}>
        <div className={styles.buttonSpacer}>
          {status === "running" && (
            <>
              <button
                className={styles.buttonSmall}
                onClick={() => stopContainer(container)}
              >
                STOP
              </button>
              <button
                className={styles.buttonSmallBottom}
                onClick={() => openNetworkList()}
              >
                NETWORKS
              </button>
            </>
          )}
          {status === "stopped" && (
            <>
              <button
                className={styles.buttonRun}
                onClick={() => runContainer(container)}
              >
                RUN
              </button>
              <button
                className={styles.buttonRemove}
                onClick={() => removeContainer(container)}
              >
                REMOVE
              </button>
            </>
          )}
        </div>
      </div>

			{container.Names && connectToNetwork && disconnectFromNetwork && (
				<NetworkListModal
					Names={container.Names}
					isOpen={isOpen}
					closeNetworkList={closeNetworkList}
					networkContainerList={networkContainerList}
					connectToNetwork={connectToNetwork}
					disconnectFromNetwork={disconnectFromNetwork}
					container={container}
				/>
			)}
		</div>
	);
});
        
export default RunningContainer;