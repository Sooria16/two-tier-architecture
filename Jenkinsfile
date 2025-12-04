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
                        url: 'https://github.com/Sooria16/two-tier-architecture.git'
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
                        // Check if Node.js is installed
                        sh '''
                            echo "Checking Node.js installation..."
                            if ! command -v node &> /dev/null; then
                                echo "Node.js not found. Installing Node.js ${NODE_VERSION}..."
                                # For RHEL/CentOS/Fedora
                                if [ -f /etc/redhat-release ]; then
                                    curl -sL https://rpm.nodesource.com/setup_${NODE_VERSION} | sudo bash -
                                    sudo yum install -y nodejs
                                # For Amazon Linux 2023
                                elif [ -f /etc/system-release ] && grep -q "Amazon Linux 2023" /etc/system-release; then
                                    curl -sL https://rpm.nodesource.com/setup_${NODE_VERSION} | sudo bash -
                                    sudo dnf install -y nodejs
                                # For Amazon Linux 2
                                elif [ -f /etc/system-release ] && grep -q "Amazon Linux 2" /etc/system-release; then
                                    curl -sL https://rpm.nodesource.com/setup_${NODE_VERSION} | sudo bash -
                                    sudo yum install -y nodejs
                                else
                                    echo "Unsupported Linux distribution"
                                    exit 1
                                fi
                            fi
                            
                            echo "Node.js version:"
                            node -v
                            echo "npm version:"
                            npm -v
                            
                            # Install PM2 globally if not installed
                            if ! command -v pm2 &> /dev/null; then
                                echo "Installing PM2..."
                                sudo npm install -g pm2
                            fi
                            
                            echo "PM2 version:"
                            pm2 --version
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
                                sudo env PATH=$PATH:/usr/bin /usr/local/lib/node_modules/pm2/bin/pm2 startup
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
                            sudo chown -R nginx:nginx ${NGINX_WEBROOT} || sudo chown -R apache:apache ${NGINX_WEBROOT} || true
                            sudo chmod -R 755 ${NGINX_WEBROOT}
                            
                            # Copy Nginx config
                            echo "Updating Nginx configuration..."
                            sudo cp nginx/default /etc/nginx/conf.d/default.conf
                            sudo nginx -t
                            sudo systemctl restart nginx || sudo service nginx restart
                            
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
                def log = currentBuild.getLogs()
                echo "Last 100 lines of build log:\n${log}"
            }
        }
    }
}
