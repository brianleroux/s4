var _ = require('underscore')
,   config = require('./test/config')
,   client = require('knox').createClient(config)

module.exports = {
    create: function(config) {
    
    }
    ,
    // save a jpg from the local filesystem and call cb(err, data)
    save: function(path, cb) {

        require('fs').readFile(path, function(err, buf) {
            
            if (err) cb(err, null)
            
            var guid   = require('guid').create().toString() +'.jpg' 
            ,   bucket = config.folder + '/' + guid
            ,   req    = client.put(bucket, {'Content-Length': buf.length, 'Content-Type': 'image/jpeg'})
            
            req.on('response', function(res) {
                if (200 == res.statusCode) {
                    cb(null, req.url)
                }
                else {
                    cb(new Error('failed to save to s3'), null)
                }
            })
            req.end(buf)
        }) 
    }
    ,
    // keys (options, cb)
    // keys (cb)
    keys: function() {
        var args = [].slice.call(arguments)
        ,   opts = _.isObject(args[0]) ? args[0] : {}
        ,   cb   = _.isFunction(args[0]) ? args[0] : args[1]

        client.get('?prefix=' + config.folder + '/').on('response', function(res){
            
            var nasty = ''
            ,   xml2js = require('xml2js')
            ,   parser = new xml2js.Parser()

            res.setEncoding('utf8')
            
            res.on('data', function(data){ nasty += data })

            res.on('end', function() {
                parser.parseString(nasty, function (err, result) {
                    if (err) { 
                        cb.call(err, null) 
                    }
                    else {
                        if (result.Contents === undefined) {
                            cb(null, [])
                        }
                        else {
                            // if xml2js has one item it returns Contents has an obj instead of an array..
                            if (_.isArray(result.Contents)) {
                                var clean = result.Contents.map(function(o) { 
                                    return o.Key 
                                }).filter(function(o) {
                                    return o != 'https://s3.amazonaws.com/'+ config.bucket + '/' + config.folder + '/'
                                })
                                cb(null, clean)
                            }
                            else {
                                cb(null, [result.Contents.Key])
                            }
                        }
                    }
                })
            })
        }).end()    
    
    }
    ,
    // retrieve the photos and call cb(err, data)
    // all(options, cb)
    // all(cb)
    all: function(cb) {
        this.keys(function(err, keys) {
            cb(err, keys.map(function(key) {
                return 'https://s3.amazonaws.com/'+ config.bucket + '/' + key
            }))
        })
    }
    ,
    // total anihilation
    nuke: function(cb) {
        // FIXME this is laaaame
        var self = this
        self.keys(function(err, keys) {
            if (keys.length == 0) {
                cb()
                return
            }
            else {
                keys.forEach(function(key) {
                    self.destroy(key)
                })
                cb()
            }
        })
    }
    ,
    // destroy a photo by key
    destroy: function(key, cb) {
        client.del(key).on('response', function(res){
            res.on('end', cb || function(){})
        }).end()
    }
}