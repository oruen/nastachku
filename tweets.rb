# encoding: utf-8
require "bundler/setup"
require "nokogiri"
require "csv"

doc = Nokogiri::HTML(File.read("tweets.html"))

tweets = doc.css(".js-stream-item")

CSV.open "data/tweets.txt", "wb", col_sep: "\t" do |f|
  # header
  f << ["id", "username", "name", "date", "content"]
  # tweets
  tweets.each do |tweet|
    id = tweet.attribute("data-item-id").value.to_i
    username = tweet.css(".username").first.content
    name = tweet.css(".fullname").first.content
    date = tweet.css(".js-short-timestamp").first.attribute("data-time").value.to_i
    content = tweet.css(".js-tweet-text").first.content
    f << [id, username, name, date, content]
  end
end
