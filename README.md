# Smart HTS web
- express
- sqlite
- passport


> <b>LIVE DEMO</b>: http://35.239.148.76

## Prerequisites

### Get root privilege
```bash
sudo su
```

### Install nodejs v10
- https://github.com/nodesource/distributions/blob/master/README.md

### Install yarn
- https://yarnpkg.com/en/docs/install

### Install PM2
```bash
sudo yarn global add pm2
# sudo npm install -g pm2
```

## Getting started

### Configuration
- `.env` file

### Install packages
```bash
yarn         # npm install
```

### Start app

#### development
```bash
yarn start   # npm start   (node)
yarn run dev # npm run dev (nodemon)
```

#### production
```bash
yarn run prod # npm run prod (pm2)
```

