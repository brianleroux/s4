# super simple s3

Super high level wrapper lib for Amazon S3. API is Lawnchair-ish mixed with some Node-isms. Ish.

## Why?

Wanted something cleaner to quickly fuck around w/ S3 without diving into lower level and more verbose http business. If you want to be close to the metal I suggest Knox and/or just using Mikeals Request. 

## Install

    npm install sss3

## Usage

    var config = {key:'', secret:'', bucket:'io.brian.photos', folder:'funny'}
    ,   photos = require('sss3').init(config)
    ,   pic    = require('path').join(__dirname, 'funny.jpg')

    photos.save(pic, function(err, key) {
        console.log('key to pic: ' + key)
    })

### API

    save

    keys

    all

    nuke

    destroy
