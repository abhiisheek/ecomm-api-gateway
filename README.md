# Ecomm API Gateway

This node.js based api gateway app for an e-comming appliaction.

## Setup/Run App

1. Clone the repo
2. Install NodeJS
3. Create `.env` in the root directory of the project which contains mongoDB username & password required to connect to the DB. (Contents shared seperately)
4. Open terminal, go to the project directory and run below commands
   
```shell
npm i
npm start
```
        

## Build Docker Image & Run

Build the docker images  by running following:

1. Make sure dockerd is up & running
2. Navigate to the home directory say 
```shell
cd <..>/user-apis
```

3. Build docker image
```shell
docker build -t ecomm-api-gateway .
```
4. Run generated image
```shell
docker run -d -p 5000:5000 ecomm-api-gateway
```