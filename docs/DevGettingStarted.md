# Setting Up Dev Environment

## Dev Enviroment
There are currently 3 ways to develop. If there are any issues around stale configurations for any container try:

* A. Remove the containers and build the extension/compose file without cached layers
    ```
    # Example: To build browser-dev without cached image layers
    make browser-new
    ```

* B. Remove the volumes, images, and cache

* Please Note that you can pull at most 50 images in 6 hours from docker hub, so don't delete images and the cache when you don't need to.

#### 1. Browser (Recommended)
* Allows running Docketeer from your browser and opens all the apps ports (see docker-compose-browser.yaml for a list of opened ports)
* This is recommended because ***both the frontend and backend hot reload when running in the browser***
* Note: This is possible because there is a wrapper function to use fetch over docker extension api client when used in the browser. ***However***, there is a bug as an iteration group decided it was a good idea to stream data from running a docker cli command directly on the frontend. Therefore, when connected to the browser version, the container metrics cards don't populate with data since the frontend can't access the extension api client when running in the browser.

```
# To start it in browser
make browser-dev

# To stop
make browser-down
```
##### 2. Extension-Dev
* This development mode launches docketeer as a Docker Desktop extension
* This allows for hot reloading from changes made within the container, as the dev mode is still running from vite.
* **Note:** To access containers on extension, go to Docker Desktop Settings -> Extension -> Check "Show Docker Extensions System Containers". **FAILING TO DO SO WILL CAUSE EXTENSION TO APPEAR BLANK WITH NO CONTAINERS**
* **Note:** Because this does not bind a volume on the development machine, it is not possible for local changes to be synced with container. Therefore, the changes made in the container must be manually made on the local machine of the user. Or the image must be rebuilt
```
# To start in Docker Desktop
make extension-dev

# To stop in Docker Desktop
make remove-dev-extension
```

##### 3. Production
* This is the minimalistic and production mode. Use for final testing and verification all of the components work. The frontend is built from vite, and the backend is converted from tsc to typescript before being copied to the image.
```
make prod
```

* No command to stop production extension. Instead, uninstall extension via Docker Desktop

## Kubernetes

* To run kubernetes for development first install [Minikube](https://formulae.brew.sh/formula/minikube) and Kubectl

```
# Starts cluster
minikube start 

# Downloads prometheus for the kubernetes cluster
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts

# Install  inside the cluster
helm install my-prometheus prometheus-community/prometheus

# OPEN THE PORT TO YOUR LOCAL MACHINE
# THIS IS VERY IMPORTANT AS CURRENTLY IT IS THE ONLY WAY TO ENABLE 
# KUBERNETES DEVELOPMENT
kubectl port-forward service/my-prometheus-server 45555:80
```



## Notes

* cAdvisor is ***not*** being deprecated May 15, 2024. The [link in question](https://console.cloud.google.com/gcr/images/cadvisor/GLOBAL/cadvisor) states: "***Container Registry*** is deprecated. After May 15, 2024, ***Artifact Registry*** will host images for the gcr.io domain in projects without previous Container Registry usage." This suggests nothing to do with cAdvisor specifically, so please do not let anyone tell you otherwise. 

* well that turned out to be a lie 04/17/25

## Troubleshooting

#### Network Capacity

By default, Docker can only create 31 networks. If you try to create more, you would encounter the following error:

```
Error response from daemon: could not find an available, non-overlapping IPv4 address pool among the defaults to assign to the network
```

To expand network capacity, add the following to `/etc/docker/daemon.json`

```
{
  "default-address-pools" : [
    {
      "base" : "172.17.0.0/12",
      "size" : 20
    },
    {
      "base" : "192.168.0.0/16",
      "size" : 24
    }
  ]
}
```

For details, please read [The definitive guide to docker's default-address-pools option](https://straz.to/2021-09-08-docker-address-pools/)
