#!/usr/bin/env Rscript
library(ggplot2)

users <- read.delim("./data/users.txt")

users <- transform(users, date=as.Date(users$created_at))

# Распределение по городам
area <- data.frame(table(users$city))
colnames(area) <- c("city", "population")
area$city <- with(area, reorder(city, population))

png("r/city_population_log.png", width=1280, height=768, res=150, type="quartz")
qplot(data=area[area$population > 1,], x=city, y=population) + coord_flip() + scale_y_log10()
dev.off()

total <- sum(area$population)
area <- transform(area, percent=(area$population * 100 / total))

png("r/city_population_percent.png", width=1280, height=768, res=150, type="quartz")
qplot(data=area[area$population > 1,], x=city, y=percent) + coord_flip()
dev.off()

# распределение по компаниям
companies <- data.frame(table(users$company))
colnames(companies) <- c("company", "population")
companies <- subset(companies, companies$population > 5 & companies$company != "")
companies$company <- with(companies, reorder(company, population))

png("r/companies.png", width=1280, height=768, res=150, type="quartz")
qplot(data=companies, x=company, y=population, geom="bar") + stat_identity(geom="bar") + coord_flip()
dev.off()


# распределение по дате регистрации
dates <- data.frame(table(as.Date(users$created_at)))
colnames(dates) <- c("date", "population")
png("r/reg_dates.png", width=1280, height=768, res=150, type="quartz")
qplot(data=dates, x=dates$date, y=dates$population, geom="bar", stat="identity") + geom_bar(stat="identity") + theme(axis.text.x=element_text(angle=90))
dev.off()

# Boxplot из количества регистраций за день
png("r/daily_reg.png", width=1280, height=768, res=150, type="quartz")
qplot("Daily", population, data=dates, geom="boxplot")
dev.off()

# Распределение регистраций для пары городов
png("r/city_hist.png", width=1280, height=768, res=150, type="quartz")
qplot(date, data=users[users$city == "Москва" | users$city == "Ульяновск" | users$city == "Самара", ], geom="histogram") + theme(axis.text.x=element_text(angle=90)) + facet_grid(. ~city)
dev.off()

# Распределение регистраций в компаниях с больших количеством участников
large.companies <- companies[companies$population >= 10,]
large.companies.users <- subset(users, is.element(company, large.companies$company))

png("r/company_hist.png", width=1280, height=768, res=150, type="quartz")
qplot(date, data=large.companies.users, geom="histogram") + facet_wrap(~company) + theme(axis.text.x=element_text(angle=90))
dev.off()

