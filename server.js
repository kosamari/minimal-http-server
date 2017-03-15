// server.js
// This is a minimal HTTP server written in Node's native http module


const http = require('http')
const url = require('url')
const path = require('path')
const fs = require('fs')

const mimetype = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json'
}

http.createServer(function (req, res) {
  let pathname = url.parse(req.url).pathname
  let extention = path.extname(pathname)

  if (pathname !== '/' && pathname[pathname.length - 1] === '/') {
    res.writeHead(302, {'Location': pathname.slice(0, -1)})
    res.end()
    return
  }
  
  if (pathname === '/') {
    pathname = 'index.html'
  } else if (!extention) {
    extention = '.html'
    pathname += extention
  }

  const filepath = path.join(process.cwd(),'/public', pathname)
  
  fs.exists(filepath, function (exists, err) {
    if (!exists) {
      console.log('File does not exist: ' + pathname)
      res.writeHead(404, {'Content-Type': 'text/plain'})
      res.write('404 Not Found')
      res.end()
      return
    }

    res.writeHead(200, {'Content-Type': mimetype[extention]})

    const fileStream = fs.createReadStream(filepath)
    fileStream.pipe(res)
  })

}).listen(process.env.PORT)
