// server.js
// This is a minimal HTTP server written in Node's native http module


// this is Node.js native modules
const http = require('http') // handles http connection
const url = require('url')   // used to parse url strings
const path = require('path') // used to inspect & create filepath
const fs = require('fs')     // reads file from local folder

// This is a dictionaly I made to look up mimetype for each file extentions
const mimetype = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json'
}

// OK, let's make http server
http.createServer(function (req, res) {
  // req : has alot of data about what client (browser) sent to the server
  // res : has lots of methods to respond to the client request
  
  // Find out which URL(static file) client requested & find the file extention for it
  //   If user requests https://gray-spark.glitch.me/ then pathname is '/'
  //   If user requests https://gray-spark.glitch.me/aboutme/ then pathnme is '/aboutme/'
  //   If user requests https://gray-spark.glitch.me/style.css then pathnme is '/style.css'
  let pathname = url.parse(req.url).pathname
  let extention = path.extname(pathname)

  // If request is NOT for root directory & pathname end with '/' redirect to non trailing / url
  //   ex : https://gray-spark.glitch.me/aboutme/ will redirect to https://gray-spark.glitch.me/aboutme <= no / at the end
  if (pathname !== '/' && pathname[pathname.length - 1] === '/') {
    res.writeHead(302, {'Location': pathname.slice(0, -1)})
    res.end()
    return
  }
  
  // If request is for root directory we should use index.html
  // Else if file extention is empty, that means user accessed '/aboutme' instead of '/aboutme.html' 
  // so add file extention to the pathname
  if (pathname === '/') { 
    pathname = 'index.html'
  } else if (!extention) { 
    extention = '.html' 
    pathname += extention
  }

  // path.join glues bunch of words into a valid file path on the computer(server)
  const filepath = path.join(process.cwd(), '/public', pathname) 
  
  // OK, now we know which file user is requesting (pathname) & where the file should live in the computer (filepath)
  // Let's check if the file exist on the computer
  fs.exists(filepath, function (exists, err) {
    
    // Oops the file requested does not exist on the computer respond to client with "Not Found"
    if (!exists) {
      console.log('File does not exist: ' + pathname)
      res.writeHead(404, {'Content-Type': 'text/plain'})
      res.write('404 Not Found')
      res.end()
      return
    }

    // Set Content-Type header to the response
    res.writeHead(200, {'Content-Type': mimetype[extention]})

    // Read file from the computer and stream it to the response
    const fileStream = fs.createReadStream(filepath)
    fileStream.pipe(res)
  })

}).listen(process.env.PORT)
