pipeline {
    agent any

    environment {
        NGINX_WEBROOT = '/var/www/html'
    }

    stages {
        stage('Checkout Code') {
            steps {
                // This will be handled by SCM configuration in Jenkins job
                echo 'Checking out code...'
                checkout scm
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
                        
                        # Setup PM2 to start on boot
                        sudo env PATH=$PATH:/usr/bin pm2 startup
                        pm2 save
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
            
            // Set proper permissions - use 'nginx:nginx' or the correct user:group
            sh "sudo chown -R nginx:nginx ${NGINX_WEBROOT} || sudo chown -R apache:apache ${NGINX_WEBROOT} || true"
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
        }
    }
}
