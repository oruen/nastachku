# encoding: utf-8
require "bundler/setup"
require "nokogiri"
require "csv"
require "open-uri"
require "action_view"

include ActionView::Helpers::SanitizeHelper

mentions = []
0.upto(90) do |i|
  url = "http://blogs.yandex.ru/search.xml?rd=0&spcctx=doc&text=nastachku&p=#{i}"
  items = []
  puts "#{i}"
  begin
    until items.size > 0
      puts "need moar items"
      sleep 3
      items = Nokogiri::HTML(open(url)).css(".Ppb-c-SearchStatistics .b-item")
    end
  rescue
    puts "retry"
    retry
  end
  mentions.push *(items.map do |m|
    [m.css("a")[0].attributes["href"].value, m.css("ul li")[0].content, m.content.gsub("\n", " ")]
  end)
end

CSV.open "data/mentions.txt", "wb", col_sep: "\t" do |f|
  f << %w(link date content)
  mentions.each do |mention|
    f << mention
  end
end

