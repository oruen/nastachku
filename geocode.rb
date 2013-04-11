# encoding: utf-8
require 'csv'
require 'open-uri'

cities = CSV.read("./data/users2.txt").map {|i| i[2]}.uniq[1..-1].reject {|i| i.empty?}[1..-1]
coords = {}
cities.each {|i| coords[i] = JSON.parse(open("http://geocode-maps.yandex.ru/1.x/?format=json&geocode=#{CGI.escape(i)}").read)["response"]["GeoObjectCollection"]["featureMember"][0]["GeoObject"]["Point"]["pos"].split(" "); sleep 1}
File.write("./data/js/geocode.js", "window.Geocode = {\n#{coords.map {|k, v| '"' + k + '": ' + v.map(&:to_f).to_s + ",\n"}.join("")}};")
