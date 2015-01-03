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
* MongoDB

### REST API

Every route is prefixed by **/itr/api** and secured using Basic authentication (will be OAuth2 in the future).

#### Analytics

/analytics?:type **[GET]**

#### Comments

/comments/:commentId **[DELETE]**

#### Logs

/logs **[GET, POST]**

#### Projects

/projects/:projectId **[PUT]**

#### Settings

/settings **[GET, PUT]**

/settings/:settingId **[PUT]**

#### Tickets

/tickets **[GET, POST]**

/tickets/:ticketId **[PUT, DELETE]**

/tickets/:ticketId/comments **[GET, POST]**

/tickets/:ticketId/comments/:commentId **[PUT]**

#### Users

/users **[GET]**

/users?:project **[GET]**

/users/:userId **[GET, PUT]**

/users/login **[POST]**

/users/logout **[POST]**

/users/register **[POST]**

