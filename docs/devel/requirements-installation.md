# Installing Requirements for the Kubernetes Dashboard

These instructions are an elaboration on how to install the requirements listed on the [Getting Started page](getting-started.md). This document assumes you have a Linux machine (or VM), and that you have a brand new Ubuntu Linux environment setup, but does not assume familiarity with Linux. If you don't have a Linux environment and you're using Windows, you may want to read instructions on how to setup a Linux VM on Windows first.

Before you begin please make sure you can connect to your Linux machine and login. Command line instructions for Linux will be shown starting with `$`; you should only type the text following the `$`.

## Initial System Setup
Based on instructions from: https://docs.docker.com/engine/installation/linux/ubuntulinux/

This will update and upgrade Linux.
```
$ sudo apt-get update
$ sudo apt-get upgrade
```
### Initial checks
```
$ uname -r
```
You should get `3.2.0-23-generic` or something similar depending on what the current version is.

```
$ lsb_release -a
```
^ You should get a response like:
```
No LSB modules are available.
Distributor ID: Ubuntu
Description:    Ubuntu 12.04.5 LTS
Release:        12.04
Codename:       precise
```


## Install Helpful Programs
Install some programs that we'll need later on, and verify that they're there. 
```
$ sudo apt-get install curl
$ sudo apt-get install git
$ curl --version
$ git --version
```
These instructions were last tested with curl 7.22.0, and git 1.7.9.5.

## Get Vagrant on Linux

```
$ sudo apt-get install vagrant
$ vagrant --version
$ export KUBERNETES_PROVIDER=vagrant
```
These instructions are using vagrant version 1.0.1.

## Install Docker

Based on instructions from: https://docs.docker.com/engine/installation/linux/ubuntulinux/

### Setup
```
$ sudo apt-get install apt-transport-https ca-certificates
$ sudo apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys 58118E89F3A912897C070ADBF76221572C52609D
```

Create a docker.list file with one command:

```
sudo bash -c 'echo "deb https://apt.dockerproject.org/repo ubuntu-precise main" > /etc/apt/sources.list.d/docker.list'
```

...OR you can create and edit the file with vim or your favorite editor.

```
$ sudo apt-get install vim
$ sudo vim /etc/apt/sources.list.d/docker.list
```
* <kbd>i</kbd> = insert
* Type `deb https://apt.dockerproject.org/repo ubuntu-precise main`
* <kbd>Esc</kbd> = stops inserting
* `:x` = exits and saves

```
$ sudo apt-get update
$ sudo apt-get purge lxc-docker
$ apt-cache policy docker-engine
```

### Only needed for Ubuntu Precise 12.04
```
$ sudo apt-get update
$ sudo apt-get install linux-image-generic-lts-trusty
$ sudo reboot
```
### Do the Docker install
```
$ sudo apt-get update
$ sudo apt-get install docker-engine
$ sudo service docker start
$ sudo docker run hello-world
```

You should receive a message that includes: `This message shows that your installation appears to be working correctly`.

### Configure Docker for your user
Based on instructions from https://docs.docker.com/engine/installation/linux/ubuntulinux/#create-a-docker-group

The example below uses "username" as a placeholder. Please substitute with the user you are logged in as, which can be seen by using `$ id`.
If you are running Linux in a VM using Vagrant, your username will be "vagrant".

```
$ sudo groupadd docker
$ sudo usermod -aG docker username
$ env
$ sudo reboot
$ docker run hello-world
```

You should get the same message as above, that includes: `This message shows that your installation appears to be working correctly`.

For an additional check you can run these commands:

`$ status docker` --> should say  "docker start/running, process [some number]"

`$ docker ps` --> should show a table of information (or at least headers)


## Install Go

The instructions below are for install a specific version of Go (1.6.2 for linux amd64). If you want the latest Go version or have a different system, then you can get the latest download URL from https://golang.org/dl/
```
$ wget https://storage.googleapis.com/golang/go1.6.2.linux-amd64.tar.gz
$ sudo tar -C /usr/local -xzf go1.6.2.linux-amd64.tar.gz
$ export PATH=$PATH:/usr/local/go/bin
$ go version
```
Should return something like `go version go1.6.2 linux/amd64`. Note that if you already had Go installed, ensure that `GO15VENDOREXPERIMENT` is unset.

*If you run into an error like "Go is not on the path.", you may need to re-run `export PATH=$PATH:/usr/local/go/bin`*

## Install Node and NPM
For some reason doing `sudo apt-get install nodejs` gives a much older version, so instead we will get the more recent version:

```
$ curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
$ sudo apt-get install -y nodejs
$ node -v
$ npm -v
```
The last time these instructions were updated, this returned `v6.3.1` and `3.10.3` respectively, but later versions will probably also work.

## Install Java 7
```
$ sudo apt-get install openjdk-7-jre
$ java -version
```
Should return `java version "1.7.0_101"`.

## Install Gulp using npm 
```
$ sudo npm install --global gulp-cli
$ sudo npm install --global gulp
$ gulp -v
```
Should return `CLI version 3.9.1` and `Local version 3.9.1`.


## Get Kubernetes

Download the command line tool _kubectl_. *This could take a while.*

```
$ curl -O https://storage.googleapis.com/kubernetes-release/release/v1.2.4/bin/linux/amd64/kubectl
```

Clone the Dashboard and Kubernetes code from the GitHub repos.

```
$ git clone https://github.com/kubernetes/dashboard.git
$ git clone https://github.com/kubernetes/kubernetes.git
```

## Install Other Dashboard Dependencies Automatically with NPM

```
$ cd ~/dashboard
$ npm install
```
This will install all the dependencies that are in the `package.json` file in the dashboard repo.

## Run the Kubernetes Cluster

Run the script included with the dashboard that checks out the latest Kubernetes and runs it in a Docker container.

```
$ cd ~/dashboard
$ sudo ./build/setup-docker.sh
$ gulp local-up-cluster
```
If you need to stop the cluster you can run `$ docker kill $(docker ps -aq)`

```
$ gulp serve
```

Now you may [continue with the Getting Started guide](getting-started.md) to learn more about developing with the Kubernetes Dashboard.
