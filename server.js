// server.js
// This is a minimal HTTP server written in Node's native http module

// this is Node.js native modules
const http = require('http') // handles http connection
const url = require('url')   // used to parse url strings
const path = require('path') // used to inspect & create filepath
const fs = require('fs')     // reads file from local folder

// This is a dictionaly I made to look up mimetype for each file extentions
// I made this to serve html/css/js/json files on glitch.com but if you want to serve more assets like images & video, 
// you should use mimetype check packages so you don't have to keep track off all file extentions
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
  //   If user requests https://website.com/ then pathname is '/', extention is empty
  //   If user requests https://website.com/aboutme/ then pathname is '/aboutme/', extention is empty
  //   If user requests https://website.com/style.css then pathname is '/style.css', extention is '.css'
  let pathname = url.parse(req.url).pathname
  let extention = path.extname(pathname)

  // If request is NOT for root directory & pathname end with '/' redirect to non trailing / url
  //   ex : https://website.com/aboutme/ will redirect to https://website.com/aboutme <= no / at the end
  if (pathname !== '/' && pathname[pathname.length - 1] === '/') {
    res.writeHead(302, {'Location': pathname.slice(0, -1)})
    res.end()
    return
  }
  
  // If request is for root directory we should use index.html
  // Else if file extention is empty, that means user accessed '/aboutme' instead of '/aboutme.html' 
  // so add file extention to the pathname
  if (pathname === '/') { 
    extention = '.html' 
    pathname = '/index.html'
  } else if (!extention) { 
    extention = '.html' 
    pathname += extention
  }

  // path.join glues bunch of words into a valid file path on the computer (server)
  const filepath = path.join(process.cwd(), '/public', pathname) 
  
  // OK, now we know which file user is requesting (pathname) & where the file should live on the computer (filepath)
  // Let's check if the file exist on the computer
  fs.exists(filepath, function (exists, err) {
    
    // Oops the file requested does not exist on the computer (or it is not html/css/js/json file)
    // Respond to client with "Not Found"
    if (!exists || !mimetype[extention]) {
      console.log('File does not exist: ' + pathname)
      res.writeHead(404, {'Content-Type': 'text/plain'})
      res.write('404 Not Found')
      res.end()
      return
    }

    // Set status code & content-type header to the response
    res.writeHead(200, {'Content-Type': mimetype[extention]})

    // Read file from the computer and stream it to the response
    const fileStream = fs.createReadStream(filepath)
    fileStream.pipe(res)
  })

}).listen(process.env.PORT)
