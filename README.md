# repro-screenshot-chrome-crash

Reproduce a bug in Chrome that crashes the browser when taking a screenshot

## To reproduce

1. Run `npm install`
1. Run `npm run build` to create the docker image `repro-screenshot-chrome-crash`
1. Run `npm start` to run the docker image and runs the repro puppeteer code at `index.js`

## Fine tune the parameters

* The default program takes a full page screenshot. This crashes the browser.
* You can fine tune the following constants in `index.js`:
  * `FULL_PAGE`: if `true`, takes a full page screenshot, otherwise will take lots of section screenshots which
    the program should stitch together afterwards (this stitching is not shown)
  * `SECTION_HEIGHT`: if `FULL_PAGE` is false, this will define the size of the section to take a screenshot of
  * `BROWSER_WIDTH`: the width of the browser. The default width is very crashy. If you make it `1024`, then
    it usually works
  * `BROWSER_HEIGHT`: what it says. Irrelevant to the discussion.
  * `PAGE_HEIGHT`: the height of the page (in pixels) being shown. I was too lazy to calculate it... :-)
  * `SLEEP_BETWEEN_SECTION_SCREENSHOTS`: the time to sleep between each section screenshot. It seems that
    section screenshots _sometimes_ succeeds when doing section screenshots`

Changing the above sometimes works and makes everything succeed, and sometimes it doesn't.
