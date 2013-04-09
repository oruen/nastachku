#!/usr/bin/env Rscript

users <- read.delim("./data/users.txt")
users$created_at <- as.Date(users$created_at)
write.csv(users, file="data/users2.txt", row.names=FALSE)
