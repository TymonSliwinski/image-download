# image-downloader  
This app is service for queueing and downloading images to the server.  
It uses PostgreSQL as main database. For queueing - BullMQ with Redis.  
# Installation  
1. ```git clone```
2. create .env file like this in */backend*  
```
PORT=5000

DB_PASSWORD=postgres
DB_USER=postgres
DB_NAME=postgres
DB_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/image_download

REDIS_URL=redis://redis:6379
```  
When starting backend with ```npm start``` from terminal, not in docker,  
use "localhost" insead of container names for *postgres* and *redis*
3. ```docker-compose up```  
# How to use  
The API provides several REST endpoints:
* **GET** /api/image/[?page=1&size=20]  
returns data of images in the database with pagination  
* **POST** /api/image/  
adds new image to database and download queue based on url and name sent as request body  
* **GET** /api/image/:id  
returns data of the image specified by id  
* **DELETE** /api/image/:id  
removes image specified by id from database  
* **GET** /api/image/:id/download  
downloads requested image using *response.download()* method