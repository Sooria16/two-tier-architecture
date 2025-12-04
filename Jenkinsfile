pipeline {
    agent any

    environment {
        // Make these configurable in Jenkins
        GIT_REPO = 'https://github.com/Sooria16/two-tier-architecture.git'
        GIT_BRANCH = 'main'
        NGINX_WEBROOT = '/var/www/html'
    }

    stages {
        stage('Checkout Code') {
            steps {
                script {
                    checkout([$class: 'GitSCM',
                        branches: [[name: "*/${GIT_BRANCH}"]],
                        userRemoteConfigs: [[
                            url: "${GIT_REPO}",
                            credentialsId: 'your-github-credentials' // Add this in Jenkins credentials
                        ]]
                    ])
                }
            }
        }

        stage('Setup Environment') {
            steps {
                sh '''
                    # Verify Node.js and npm
                    node --version
                    npm --version
                    
                    # Install PM2 if not exists
                    if ! command -v pm2 &> /dev/null; then
                        echo "Installing PM2..."
                        npm install -g pm2
                    fi
                '''
            }
        }

        stage('Deploy Backend') {
            steps {
                dir('backend') {
                    sh '''
                        echo "Installing dependencies..."
                        npm install --production
                        
                        echo "Stopping existing application..."
                        pm2 delete all || true
                        
                        echo "Starting application..."
                        NODE_ENV=production pm2 start server.js --name "two-tier-backend" -f
                        pm2 save
                        pm2 startup
                    '''
                }
            }
        }

        stage('Deploy Frontend') {
            steps {
                script {
                    // Create webroot if not exists
                    sh "sudo mkdir -p ${NGINX_WEBROOT}"
                    
                    // Copy files
                    sh "sudo cp -r frontend/* ${NGINX_WEBROOT}/"
                    
                    // Set proper permissions
                    sh "sudo chown -R www-data:www-data ${NGINX_WEBROOT}"
                    sh "sudo chmod -R 755 ${NGINX_WEBROOT}"
                    
                    // Test Nginx configuration
                    sh "sudo nginx -t"
                    
                    // Restart Nginx
                    sh "sudo systemctl restart nginx"
                }
            }
        }
    }

    post {
        success {
            echo 'Deployment completed successfully!'
        }
        failure {
            echo 'Deployment failed!'
            // Add cleanup or rollback steps here
        }
        always {
            // Clean up workspace
            cleanWs()
        }
    }
}
