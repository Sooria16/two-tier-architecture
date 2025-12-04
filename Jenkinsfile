pipeline {
    agent any

    environment {
        NODE_VERSION = '18.x'
        NGINX_WEBROOT = '/var/www/html'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Setup Environment') {
            steps {
                sh '''
                    echo "Setting up Node.js..."
                    curl -sL https://deb.nodesource.com/setup_${NODE_VERSION} | sudo -E bash -
                    sudo apt-get install -y nodejs
                    
                    echo "Installing PM2..."
                    sudo npm install -g pm2
                    
                    echo "Node.js version:"
                    node -v
                    echo "npm version:"
                    npm -v
                '''
            }
        }

        stage('Deploy Backend') {
            steps {
                dir('backend') {
                    sh '''
                        echo "Installing backend dependencies..."
                        npm install --production
                        
                        echo "Stopping existing backend..."
                        pm2 delete two-tier-backend || true
                        
                        echo "Starting backend..."
                        NODE_ENV=production PORT=3000 pm2 start server.js --name "two-tier-backend" -f
                        pm2 save
                        
                        # Setup PM2 to start on boot
                        sudo env PATH=$PATH:/usr/bin /usr/local/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
                        pm2 save
                    '''
                }
            }
        }

        stage('Deploy Frontend') {
            steps {
                sh """
                    echo "Deploying frontend to ${NGINX_WEBROOT}..."
                    sudo mkdir -p ${NGINX_WEBROOT}
                    sudo cp -r frontend/* ${NGINX_WEBROOT}/
                    
                    # Set correct permissions
                    sudo chown -R nginx:nginx ${NGINX_WEBROOT} || sudo chown -R www-data:www-data ${NGINX_WEBROOT} || true
                    sudo chmod -R 755 ${NGINX_WEBROOT}
                    
                    # Copy Nginx config
                    echo "Updating Nginx configuration..."
                    sudo cp nginx/default /etc/nginx/sites-available/default
                    sudo nginx -t
                    sudo systemctl restart nginx
                """
            }
        }
    }

    post {
        success {
            echo '🎉 Deployment completed successfully!'
            sh 'curl -X POST -H "Content-Type: application/json" -d "{\"text\":\"✅ Deployment successful! 🚀\"}" YOUR_SLACK_WEBHOOK_URL'
        }
        failure {
            echo '❌ Deployment failed!'
            sh 'curl -X POST -H "Content-Type: application/json" -d "{\"text\":\"❌ Deployment failed! Check Jenkins console for details.\"}" YOUR_SLACK_WEBHOOK_URL'
        }
    }
}
