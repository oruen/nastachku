# encoding: utf-8
require "bundler/setup"
require "nokogiri"
require "csv"
require "open-uri"
require "action_view"

include ActionView::Helpers::SanitizeHelper

mentions = []
0.upto(50) do |i|
  url = "http://blogs.yandex.ru/search.rss?text=nastachku&p=#{i}"
  items = []
  puts "#{i}"
  begin
    until items.size > 0
      puts "need moar items"
      sleep 3
      items = Nokogiri::XML(open(url)).xpath("//item")
    end
  rescue
    puts "retry"
    retry
  end
  mentions.push *(items.map do |m|
    [m.xpath("link")[0].content, Time.parse(m.xpath("pubDate")[0].content), sanitize(m.xpath("description")[0].content.gsub("\n", " "))]
  end)
end

CSV.open "data/mentions.txt", "wb", col_sep: "\t" do |f|
  f << %w(link date content)
  mentions.each do |mention|
    f << mention
  end
end

