pipeline{

    agent any

    options {
        buildDiscarder logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '', daysToKeepStr: '', numToKeepStr: '2')
    }


    stages{
        stage('Checkout the code'){
            steps{
                git branch: 'master', url: 'https://github.com/skmdab/create_Kubernetes.git'
            }
        }

        stage('Creating K8s Server'){
            steps{
                sh "sh aws_create.sh"
            }
        }

        stage('Installing K8s Packages'){
            steps{
                withCredentials([file(credentialsId: 'pemfile', variable: 'PEMFILE')]) {
		  sh 'ansible-playbook installk8s.yaml --private-key="$PEMFILE"'
		}
            }
        }
    }
}
