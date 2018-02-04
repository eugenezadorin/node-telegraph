# Prerequisites

Project depends on [mmmagic](https://github.com/mscdex/mmmagic) and [sharp](https://github.com/lovell/sharp) packages, which uses C++ libraries. It may cause problems if you developing under Windows. In that case you can try running:

    npm install --global windows-build-tools

See also — https://github.com/Microsoft/nodejs-guidelines/blob/master/windows-environment.md#compiling-native-addon-modules

# Installation

    # get sources and install dependencies
    git clone https://github.com/eugenezadorin/node-telegraph.git
    cd node-telegraph
    npm install

    # setup your app secret in .env file
    mv .env.example .env

    # start app on http://localhost:3000/
    npm run server

    # to work on frontend run webpack watcher
    npm run webpack

    # use --production option to apply UglifyJs
    npm run webpack --production

Notice the project is under development.