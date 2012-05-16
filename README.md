# super simple storage solution client

Super high level wrapper client for Amazon S3.

## Why?

Wanted something cleaner to quickly fuck around w/ S3 without diving into lower level and more verbose http business. Especially decent in the terminal. If you want to be close to the metal I suggest Knox and/or just using Mikeals Request. 

## Install

    npm install s4

## Usage

    var config = {key:'', secret:'', bucket:'io.brian.photos', folder:'funny'}
    ,   photos = require('s4').create(config)
    ,   pic    = require('path').join(__dirname, 'funny.jpg')

    photos.save(pic, function(err, key) {
        console.log('key to pic: ' + key)
    })

### API

    create(config)

    save(path, callback)

    keys(callback)
    keys(options, callback)

    all(callback)
    all(options, callback)

    nuke(callback)

    destroy(callback)
