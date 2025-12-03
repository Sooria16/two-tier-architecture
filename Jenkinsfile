pipeline {
    agent any

    stages {
        stage('Pull Code') {
            steps {
                git branch: 'main', url: 'https://github.com/Sooria16/two-tier-architecture.git'
            }
        }

        stage('Install Backend') {
            steps {
                sh '''
                cd backend
                npm install
                pm2 stop all || true
                pm2 start server.js
                '''
            }
        }
        stage('Install Nginx') {
            steps {
                sh '''
                sudo dnf install nginx -y
                sudo systemctl start nginx
                sudo systemctl enable nginx
                '''
            }
        }

        stage('Deploy Frontend to Nginx') {
            steps {
                sh '''
                sudo rm -rf /usr/share/nginx/html/*
                sudo cp -r frontend/* /usr/share/nginx/html/   
                '''
            }
        }
    }
}
