# encoding: utf-8
require 'bundler/setup'
require 'json'
require 'open-uri'
require 'csv'
require 'active_support'
require 'active_support/all'

COMPANY_SYNONYMS = {
  "7pro" => "7про",
  "Brandy mint" => "Brandymint",
  "Cloud castle" => "Cloudcastle",
  "Cloud castle group" => "Cloudcastle",
  "Ecwid, inc" => "Ecwid",
  "Evercodelab" => "Evercode lab",
  "Evrone.ru" => "Evrone",
  "Forestvalley" => "Forest valley",
  "Funbox" => "Fun-box",
  "Griddymanimics" => "Grid dynamics",
  "Griddynamics" => "Grid dynamics",
  "Itech" => "Itech.group",
  "Itech mobile" => "Itech.group",
  "Itech-group" => "Itech.group",
  "Itech.games" => "Itech.group",
  "Qb-interactive" => "Qb interactive",
  "Simbirsoft ltd." => "Simbirsoft",
  "Simtech development" => "Simtech",
  "Smartteam" => "Smart team",
  "Turnkey ecommerce" => "Turnkey",
  "Undev.ru" => "Undev",
  "Ulgu" => "Улгу",
  "Веб-студия creater" => "Creater",
  "Веб-студия \"creater\"" => "Creater",
  "Волга-днепр международное обучение" => "Волга-днепр",
  "Гуз миац" => "Гуз \"миац\"",
  "Журнал \"деловое обозрение" => "Журнал \"деловое обозрение\"",
  "Зао \"региональный аттестационный центр\"" => "Зао \"рац\"",
  "Иату улгту" => "Улгту",
  "Министерство ульяновской области по развитию информационных технологий и электронной демократии" => "Министерство ит ульяновской области",
  "Молодёжный иницативный центр" => "Молодёжный инициативный центр",
  "Оао мтс" => "Мтс",
  "Ооо \"моё дело\"" => "Ооо \"мое дело\"",
  "Ооо \"мозаика\"" => "Мозаика",
  "Ооо \"скрипт\"" => "Skript",
  "Ооо \"фанбокс\"" => "Fun-box",
  "Ооо мое дело" => "Ооо \"мое дело\"",
  "Ооо мозаика" => "Мозаика",
  "Севенпро" => "7про",
  "Симбирсофт" => "Simbirsoft",
  "Симтек дев" => "Simtech",
  "Симтек девелопмент" => "Simtech",
  "Скрипт" => "Skript",
  "Смибирсофт" => "Simbirsoft",
  "Улгпу им и.н.ульянова" => "Улгпу",
  "Улгпу им. и.н. ульянова" => "Улгпу",
  "Улгту-фист" => "Улгту",
  "Улгу отдел локальных сетей" => "Улгу",
  "Ульяновский государственный технический университет" => "Улгту",
  "Фанбокс" => "Fun-box",
  "Фгбоу впо самгту" => "Фгбоу самгту",
  "Цбо улгту" => "Улгту",
  "Itech-games" => "Itech.group",
  "Ivi" => "Ivi.ru",
  "Provectus it" => "Provectus-it",
  "Seosa" => "Seosa.ru",
  "Turnkeye" => "Turnkey",
  "Webatmosfera" => "Webatmosfera.ru",
  "Волгоградский государственный университет" => "Волгу",
  "Ттк ульяновск" => "Ттк-ульяновск"
}

CITY_SYNONYMS = {
  "Ульяовск" => "Ульяновск",
  "Уяновск" => "Ульяновск",
  "Ульск" => "Ульяновск",
  "Москва-ульяновск" => "Москва",
  "San francisco" => "Сан-франциско",
  "Сан франциско" => "Сан-франциско",
  "Спб" => "Санкт-петербург",
  "Нижний" => "Нижний новгород",
  "Н новгород" => "Нижний новгород",
  "Владимирович" => "",
  "Евгеньевич" => "",
  "Тут" => "",
  "Х" => ""
}

def normalize str
  str && str.strip.mb_chars.capitalize.to_s
end

def adjust str, type
  return unless str
  normalized = normalize str
  const = Object.const_get("#{type.upcase}_SYNONYMS")
  const[normalized] || normalized
end

users = JSON.parse(open('http://nastachku.ru/users.json').read)["users"]

CSV.open "data/users.txt", "wb", col_sep: "\t" do |f|
  # header
  f << users.first.keys
  # users
  users.each do |user|
    user["company"] = adjust(user["company"], "company")
    user["city"] = adjust(user["city"], "city")
    f << user.values.map {|v| normalize v}
  end
end
