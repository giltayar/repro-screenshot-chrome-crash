# repro-screenshot-chrome-crash

Reproduce a bug in Chrome 83 that crashes the browser when taking a screenshot

## To reproduce

1. Run `npm install`
1. Run `npm run build` to create the docker image `repro-screenshot-chrome-crash`
1. Run `npm start`. It:
   1. Deletes previous chrome docker container
   1. run the chrome docker image
   1. runs the repro puppeteer code at `index.js`
   1. Crashes every single time
