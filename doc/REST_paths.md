REST paths
============

Every route is prefixed by: `/itr/api`

### Users
##### GET
`/users?:project` - retrieve users belonging to given project

`/users/:id` - retrieve user with id

##### POST
`/users/register`

`/users/login`

`/users/logout`

##### PUT
`/users/:id`

### Comments
##### GET
`/comments/:id`

##### POST
`/users/:id/tickets/:ticketId/comments`

##### PUT
`/comments/:id`

##### DELETE
`/comments/:id`

### Logs
##### GET
`/logs`

##### POST
`/users/:id/logs`

### Tickets
##### GET
`/users/:id/tickets`

##### POST
`/users/:id/tickets`

##### PUT
`/tickets/:id`

##### DELETE
`/tickets/:id`

### Settings
##### GET
`/users/:id/settings`

##### PUT
`/users/:id/settings`

### Analytics
##### GET
`/analytics?:type`


