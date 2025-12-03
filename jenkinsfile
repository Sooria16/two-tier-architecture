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

        stage('Deploy Frontend to Nginx') {
            steps {
                sh '''
                sudo rm -rf /var/www/html/*
                sudo cp -r frontend/* /var/www/html/
                sudo systemctl restart nginx
                '''
            }
        }
    }
}
