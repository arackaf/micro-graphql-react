Spectacle Boilerplate
=====================

## Contents

- [Reference](#reference)
- [Getting Started](#getting-started)
- [Tutorial](#tutorial)
- [Build & Deployment](#build-deployment)

## Reference

The Spectacle core API is available in the [Spectacle Docs](https://github.com/FormidableLabs/spectacle/blob/master/README.md).

## Getting Started

1. Install dependencies

    ```sh
    $ yarn install
    ```

2. Start the webpack server. The server will run at the default `webpack-dev-server` address, [`localhost:8080`](http://localhost:8080).

    ```sh
    $ yarn start

    # Or with a specific port!
    $ yarn start --port=3000
    ```

## Tutorial

If want you a step-by-step guide for getting started with Spectacle, a basic tutorial is available [here](https://github.com/FormidableLabs/spectacle/blob/master/docs/tutorial.md).

## Build & Deployment

Building the dist version of the project is as easy as running

```sh
$ yarn build
```

From there you can deploy the built slides  in `dist` to services like Netlify, Surge, etc!
