#POST
/itr/api/users/register

/itr/api/users/login

/itr/api/users/logout

/itr/api/users/:userId/tickets/:ticketId/comments

/itr/api/users/:userId/tickets

/itr/api/users/:userId/logs

#GET
/itr/api/users

/itr/api/users?:project

/itr/api/users/:userId

/itr/api/users/:userId/settings

/itr/api/users/:userId/tickets

/itr/api/tickets/:ticketId/comments

/itr/api/logs

/itr/api/analytics?:type

#PUT
/itr/api/users/:userId

/itr/api/users/:userId/tickets/:ticketId/comments/:commentId

/itr/api/users/:userId/settings/:settingId

/itr/api/tickets/:ticketId

/itr/api/projects/:projectId

/itr/api/settings

#DELETE
/itr/api/users/:userId/comments/:commentId

/itr/api/tickets/:ticketId
