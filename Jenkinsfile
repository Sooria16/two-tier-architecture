pipeline {
    agent any

    environment {
        NODE_VERSION = '18.x'
        NGINX_WEBROOT = '/var/www/html'
    }

    stages {
        stage('Clean Workspace') {
            steps {
                cleanWs()
                sh 'echo "Workspace cleaned"'
            }
        }

        stage('Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[
                        url: 'https://github.com/Sooria16/two-tier-architecture.git',
                        credentialsId: 'YOUR_GITHUB_CREDENTIALS_ID'
                    ]],
                    extensions: [[
                        $class: 'CleanBeforeCheckout'
                    ]]
                ])
            }
        }

        stage('Setup Environment') {
            steps {
                script {
                    try {
                        sh '''
                            echo "Setting up Node.js..."
                            curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION} | sudo -E bash -
                            sudo apt-get install -y nodejs
                            
                            echo "Installing PM2..."
                            sudo npm install -g pm2
                            
                            echo "Node.js version:"
                            node -v
                            echo "npm version:"
                            npm -v
                        '''
                    } catch (e) {
                        error "Failed to set up environment: ${e.message}"
                    }
                }
            }
        }

        stage('Deploy Backend') {
            steps {
                dir('backend') {
                    script {
                        try {
                            sh '''
                                echo "Installing backend dependencies..."
                                npm install --production
                                
                                echo "Stopping existing backend..."
                                pm2 delete two-tier-backend || true
                                
                                echo "Starting backend..."
                                NODE_ENV=production PORT=3000 pm2 start server.js --name "two-tier-backend" -f
                                pm2 save
                                
                                # Setup PM2 to start on boot
                                sudo env PATH=$PATH:/usr/bin /usr/local/lib/node_modules/pm2/bin/pm2 startup systemd -u jenkins --hp /var/lib/jenkins
                                pm2 save
                                
                                echo "Backend started successfully"
                            '''
                        } catch (e) {
                            error "Backend deployment failed: ${e.message}"
                        }
                    }
                }
            }
        }

        stage('Deploy Frontend') {
            steps {
                script {
                    try {
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
                            
                            echo "Frontend deployed successfully"
                        """
                    } catch (e) {
                        error "Frontend deployment failed: ${e.message}"
                    }
                }
            }
        }
    }

    post {
        always {
            echo "Build completed with status: ${currentBuild.currentResult}"
            // Clean up workspace after build
            cleanWs()
        }
        success {
            echo '🎉 Deployment completed successfully!'
        }
        failure {
            echo '❌ Deployment failed!'
            // Get build logs
            script {
                def log = currentBuild.rawBuild.getLog(100).join('\n')
                echo "Build Logs:\n${log}"
            }
        }
    }
}
