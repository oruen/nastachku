# encoding: utf-8
require "bundler/setup"
require "nokogiri"
require "csv"
require "open-uri"
require "action_view"

include ActionView::Helpers::SanitizeHelper

def parse_month str
  {
    "января" => 1,
    "февраля" => 2,
    "марта" => 3,
    "апреля" => 4,
    "мая" => 5,
    "июня" => 6,
    "июля" => 7,
    "августа" => 8,
    "сентября" => 9,
    "октября" => 10,
    "ноября" => 11,
    "декабря" => 12
  }[str]
end

def parse_date str
  if str.match(/(\d{1,2}) ([а-я]+) (\d{4}), \d{1,2}:\d{2}/)
    Date.new($3.to_i, parse_month($2), $1.to_i)
  elsif str.match(/\Aвчера/)
    Date.today - 1
  else
    Date.today
  end.to_s
end

mentions = []
0.upto(90) do |i|
  url = "http://blogs.yandex.ru/search.xml?rd=0&spcctx=doc&text=nastachku&server=twitter.com&lang=rus%2Cukr%2Cblr%2Ceng&holdres=mark&p=#{i}"
  items = []
  puts "#{i}"
  begin
    until items.size > 0
      puts "need moar items"
      sleep 2
      content = Nokogiri::HTML(open(url))
      puts content.to_xml
      items = content.css(".Ppb-c-SearchStatistics .b-item")
    end
  rescue
    puts "retry"
    retry
  end
  mentions.push *(items.map do |m|
    [m.css("a")[0].attributes["href"].value, parse_date(m.css("ul li")[0].content), m.css(".ItemMore-Description a")[0].content.gsub("\n", " ")]
  end)
end

CSV.open "data/mentions.txt", "wb", col_sep: "\t" do |f|
  f << %w(link date content)
  mentions.each do |mention|
    f << mention
  end
end

