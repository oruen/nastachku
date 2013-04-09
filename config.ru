require 'bundler/setup'
require 'rack'

run Rack::Directory.new("./data")
