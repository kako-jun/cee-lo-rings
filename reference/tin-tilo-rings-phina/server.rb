
require 'webrick'

server = WEBrick::HTTPServer.new({
  DocumentRoot: './phinajs',
  BindAddress:  '0.0.0.0',
  Port:         42002,
})

server.start
