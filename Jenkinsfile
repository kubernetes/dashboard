pipeline {
    agent any

    options {
        buildDiscarder(logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '', daysToKeepStr: '', numToKeepStr: '2'))
    }

    stages {
        stage('Checkout the code') {
            steps {
                git branch: 'testing', url: 'https://github.com/kubernetes/dashboard.git'
            }
        }
    }
}
