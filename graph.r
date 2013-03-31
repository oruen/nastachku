#!/usr/bin/env Rscript
library(ggplot2)

users <- read.delim("./users.txt")


# Распределение по городам
area <- data.frame(table(users$city))
colnames(area) <- c("city", "population")
area$city <- with(area, reorder(city, population))

qplot(data=area, x=city, y=population) + coord_flip() + scale_y_log10()

total <- sum(area$population)
area <- transform(area, percent=(area$population * 100 / total))


# распределение по компаниям
companies <- data.frame(table(users$company))
colnames(companies) <- c("company", "population")
companies <- subset(companies, companies$population > 5 & companies$company != "")
companies$company <- with(companies, reorder(company, population))

qplot(data=companies, x=company, y=population, geom="bar") + stat_identity(geom="bar") + coord_flip()


# распределение по дате регистрации
dates <- data.frame(table(as.Date(users$created_at)))
colnames(dates) <- c("date", "population")
qplot(data=dates, x=dates$date, y=dates$population, geom="bar", stat="identity") + geom_bar(stat="identity") + theme(axis.text.x=element_text(angle=90))

# Boxplot из количества регистраций за день
qplot("Daily", population, data=dates, geom="boxplot")

# Распределение регистраций для пары городов
qplot(date, data=users[users$city == "Москва" | users$city == "Ульяновск" | users$city == "Самара", ], geom="histogram") + theme(axis.text.x=element_text(angle=90)) + facet_grid(. ~city)

qplot(companies[companies$population >= 10,]


# Распределение регистраций в компаниях с больших количеством участников
large.companies <- companies[companies$population >= 10,]
large.companies.users <- subset(users, is.element(company, large.companies$company))
qplot(date, data=large.companies.users, geom="histogram") + facet_wrap(~company) + theme(axis.text.x=element_text(angle=90))

