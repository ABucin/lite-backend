lite-backend
============

Backend for the LITE project. 

### Pre-requisites:

1. Install Node.js from `http://nodejs.org/` .
2. Install MongoDB from `http://www.mongodb.org/downloads` .

### Technology stack

* Node.js
  * express
  * passport
  * mocha
  * nodemon
* MongoDB

### REST API

Every route is prefixed by **/itr/api** and secured using Basic authentication (will be OAuth2 in the future).

#### Analytics

/analytics?type={type} **[GET]**

#### Authentication

/auth/login **[POST]**

/auth/logout **[POST]**

/auth/register **[POST]**

#### Comments

/comments/{commentId} **[PUT, DELETE]**

#### Logs

/logs **[GET, POST]**

#### Settings

/settings **[GET, PUT]**

/settings/{settingId} **[PUT]**

#### Tickets

/tickets **[GET, POST]**

/tickets/{ticketId} **[PUT, DELETE]**

/tickets/{ticketId}/comments **[GET, POST]**

#### Users

/users **[GET]**

/users?project={project} **[GET]**

/users/{userId} **[GET, PUT]**