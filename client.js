var _ = require('underscore')

module.exports = {

    create: function(config) {
        this.config = config
        this.client = require('knox').createClient(config)
        return this
    }
    ,
    urlFor: function(key) {
        return 'https://s3.amazonaws.com/'+ this.config.bucket + '/' + this.config.folder + '/' + key
    }
    ,
    // save a jpg from the local filesystem and call cb(err, data)
    // save(path, cb)
    // save({src:'path/to/local.jpg', dest:'remote.jpg'}, cb)
    save: function(opts, cb) {

        var self       = this
        ,   options    = _.isObject(opts)
        ,   filePath   = options ? opts.src  : opts
        ,   remoteName = options ? opts.dest : require('guid').create().toString() +'.jpg' // <--FIXME hardcoded name as jpg bad
        ,   contentType = options ? opts.type : 'image/jpeg' // <--FIXME as above

        require('fs').readFile(filePath, function(err, buf) {
            
            if (err) cb(err, null)
            
            var bucket = self.config.folder + '/' + remoteName
            ,   req    = self.client.put(bucket, {'Content-Length': buf.length, 'Content-Type': contentType})
            
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
        ,   self = this

        this.client.get('?prefix=' + this.config.folder + '/').on('response', function(res){
            
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
                                    return o != 'https://s3.amazonaws.com/'+ self.config.bucket + '/' + self.config.folder + '/'
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
        var self = this
        this.keys(function(err, keys) {
            cb(err, keys.map(function(key) {
                return 'https://s3.amazonaws.com/'+ self.config.bucket + '/' + key
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
        this.client.del(key).on('response', function(res){
            res.on('end', cb || function(){})
        }).end()
    }
}
