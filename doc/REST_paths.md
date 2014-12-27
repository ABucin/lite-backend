Every route is prefixed by: **/itr/api**

###POST
/users/register

/users/login

/users/logout

/users/:userId/tickets/:ticketId/comments

/users/:userId/tickets

/users/:userId/logs

###GET
/users

/users?:project

/users/:userId

/users/:userId/settings

/users/:userId/tickets

/tickets/:ticketId/comments

/logs

/analytics?:type

###PUT
/users/:userId

/users/:userId/tickets/:ticketId/comments/:commentId

/users/:userId/settings/:settingId

/tickets/:ticketId

/projects/:projectId

/settings

###DELETE
/users/:userId/comments/:commentId

/tickets/:ticketId
