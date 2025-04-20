import React, { useState } from 'react';
import styles from './K8Metrics.module.scss';
import global from '../global.module.scss'


const K8Metrics = (): JSX.Element => {
  const [resetIframe, setResetIframe] = useState<Boolean>(true);

  const handleHome = (): void => {
    // const iframe = document.querySelector('iframe')?.contentWindow?.history;
    setResetIframe(resetIframe ? false : true);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.iframeHeader}>
        <h1 className={styles.kubernetesTitle} >KUBURNETES CLUSTER HEALTH METRICS</h1>
        <div className={styles.iframeControl}>
          <button className={global.button1} onClick={handleHome} style = {{marginLeft: '10px'}} >
            REFRESH
          </button>
        </div>
      </div>
      <div className={styles.iframeDiv}>
        <iframe
          key={resetIframe}
          className={styles.metrics}
          src='http://localhost:49155/d/k8s_views_nodes/kubernetes-views-nodes?orgId=1&refresh=1s&var-resolution=3m&var-node=docker-desktop&kiosk'></iframe>
      </div>
    </div>
  );
}



export default K8Metrics