# This app runs a node server API and a React client on Heroku

## Design Points

A combo of two npm projects, the backend server and the frontend UI. So there are two `package.json` configs.

  1. [`package.json`](package.json) for [Node server](server/) & [Heroku deploy](https://devcenter.heroku.com/categories/deployment)
      * `heroku-postbuild` script compiles the webpack bundle during deploy
      * `cacheDirectories` includes `react-ui/node_modules/` to optimize build time
  2. [`react-ui/package.json`](react-ui/package.json) for [React web UI](react-ui/)
      * generated by [create-react-app](https://github.com/facebookincubator/create-react-app)

## Deploy to Heroku

```bash
git clone https://github.com/ctti-clinicaltrials/PROPHETIC.git
cd /
heroku create
git push heroku master
```

This deployment will automatically:

  * detect [Node buildpack](https://elements.heroku.com/buildpacks/heroku/heroku-buildpack-nodejs)
  * build the app with
    * `npm install` for the Node server
    * `heroku-postbuild` for create-react-app
  * launch the web process with `npm start`
    * serves `../react-ui/build/` as static files

👓 More about [deploying to Heroku](https://devcenter.heroku.com/categories/deployment).

## Local Development

### Run the API Server

In a terminal:

```bash
# Initial setup
npm install

# Start the server
npm start
```

### Run the React UI

The React UI is configured to proxy backend requests to the local Node server. (See [`"proxy"` config](react-ui/package.json))

In a separate terminal from the API server, start the UI:

```bash
# Always change directory, first
cd react-ui/

# Initial setup
npm install

# Start the server
npm start
```
