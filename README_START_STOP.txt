
Kubernetes Dashboard Start, Stop, and Restart Guide

1. **Starting the Kubernetes Dashboard:**
   - Create the cluster using Kind:
     ```bash
     kind create cluster --name kubernetes-dashboard
     ```
   - Check if the node is ready:
     ```bash
     kubectl get nodes
     ```
   - To start the containers:
     ```bash
     make serve
     ```

2. **Stopping the Kubernetes Dashboard:**
   - Stop the running containers:
     ```bash
     docker stop $(docker ps -q)
     ```

3. **Restarting the Kubernetes Dashboard:**
   - First, stop the existing containers (if running):
     ```bash
     docker stop $(docker ps -q)
     ```
   - Delete the existing cluster:
     ```bash
     kind delete cluster --name kubernetes-dashboard
     ```
   - Recreate the cluster:
     ```bash
     kind create cluster --name kubernetes-dashboard
     ```
   - Verify the node is ready:
     ```bash
     kubectl get nodes
     ```
   - Restart the containers:
     ```bash
     make serve
     ```

4. **Accessing the Kubernetes Dashboard:**
   - Use the following command to access the dashboard:
     ```bash
     kubectl proxy
     ```
   - Retrieve the token for authentication:
     ```bash
     kubectl -n kubernetes-dashboard create token dashboard-admin-sa
     ```
   - Open the following URL in your browser:
     ```
     http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/
     ```

