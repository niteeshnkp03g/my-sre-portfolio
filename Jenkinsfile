pipeline {
    agent any

    stages {

        stage('Validate') {
            steps {
                echo 'Checking portfolio files...'

                sh '''
                    test -f index.html
                    test -f style.css
                    test -f main.js
                    test -d images
                '''
            }
        }

        stage('Build') {
            steps {
                echo 'Preparing portfolio files...'

                sh '''
                    rm -rf build
                    mkdir -p build

                    cp index.html style.css main.js build/
                    cp Resume.pdf build/
                    cp -r images build/
                '''
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying portfolio to Apache...'

                sh '''
                    find /var/www/html -mindepth 1 -maxdepth 1 -exec rm -rf {} +

                    cp -r build/. /var/www/html/
                '''
            }
        }

        stage('Verify') {
            steps {
                echo 'Verifying website deployment...'

                sh '''
                    test -s /var/www/html/index.html
                    curl -fsS http://localhost/ > /dev/null
                '''
            }
        }
    }
}