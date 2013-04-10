#!/usr/bin/env Rscript

users <- read.delim("./data/users.txt")
users$created_at <- as.Date(users$created_at)
write.csv(users, file="data/users2.txt", row.names=FALSE)

mentions <- read.delim("./data/mentions.txt")
mentions <- mentions[substr(mentions$content, 0, 4) != "RT @",]
mentions$date <- as.Date(mentions$date)
write.csv(mentions, file="data/mentions2.txt", row.names=FALSE)
