@echo off
START "DB_SERVER" C:/mongodb/bin/mongod.exe --dbpath C:/mongodb/data
START "APP_SERVER" node ./server/server.js