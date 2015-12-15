REST paths
============

Every route is prefixed by: `/itr/api`.

### Users
##### GET
`/users?:project` - retrieve users belonging to given project

`/users/:id` - retrieve user with id

##### POST
`/users/register` - register a new user

`/users/login` - login a user

`/users/logout` - logout a user

##### PUT
`/users/:id` - update a user with the given id

### Comments
##### GET
`/comments/:id` - retrieve comment with given id

##### POST
`/users/:id/tickets/:ticketId/comments`

##### PUT
`/comments/:id` - update comment with given id

##### DELETE
`/comments/:id` - delete comment with given id

### Logs
##### GET
`/logs`  - retrieve all logs

##### POST
`/users/:id/logs`  - add log entry

### Tickets
##### GET
`/users/:id/tickets` - retrieve tickets for user

##### POST
`/users/:id/tickets` - create ticket for user

##### PUT
`/tickets/:id` - update ticket with given id

##### DELETE
`/tickets/:id` - delete ticket with given id

### Settings
##### GET
`/users/:id/settings` - retrieve settings for user with given id

##### PUT
`/users/:id/settings` - update settings for user with given id

### Analytics
##### GET
`/analytics?:type` - retrieve analytics with given type


