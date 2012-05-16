should = require 'should'
config = require './config'
photo = require('./../client').create(config)

describe 'Photo', ->
  
  describe '#nuke()', ->
    it 'should destroy everything', (done)->
      photo.nuke ->
        photo.all (err, data)->
          data.length.should.eql(0)
          done()
  
  describe '#save()', ->
    it 'should save', (done)->
      photo_path = require('path').join __dirname, 'test.jpg'
      photo.save photo_path, (err, url)->
        throw err if err
        done()
  
  describe '#all()', ->
    it 'should list all photos', (done)->
      photo.all (err, data)->
        throw err if err
        data.length.should.eql(1)
        done()
  
  describe '#destroy()', ->
    it 'should remove a photo', (done)->
      photo.keys (err, keys)->
        throw err if err
        only_photo = keys[0]
        photo.destroy only_photo, ->
          photo.all (err, data)->
            data.length.should.eql(0)
            done()
