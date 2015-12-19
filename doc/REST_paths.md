REST paths
============

| Entity       | Action     | Path                                       | Description
| -------------| -----------| -------------------------------------------| ------------------------------------------
| Analytics    | `GET`      | `/itr/api/analytics?{type}`                        | retrieve analytics with given type
| Comments     | `GET`      | `/itr/api/comments/{id}`                           | retrieve comment with given id
|              | `POST`     | `/itr/api/users/{id}/tickets/{ticketId}/comments`  | -
|              | `PUT`      | `/itr/api/comments/{id}`                           | update comment with given id
|              | `DELETE`   | `/itr/api/comments/{id}`                           | delete comment with given id
| Logs         | `GET`      | `/itr/api/logs`                                    | retrieve all logs
|              | `POST`     | `/itr/api/users/{id}/logs`                         | add log entry
| Settings     | `GET`      | `/itr/api/users/{id}/settings`                     | retrieve settings for user with given id
|              | `PUT`      | `/itr/api/users/{id}/settings`                     | update settings for user with given id
| Tickets      | `GET`      | `/itr/api/users/{id}/tickets`                      | retrieve tickets for user
|              | `POST`     | `/itr/api/users/{id}/tickets`                      | create ticket for use
|              | `PUT`      | `/itr/api/tickets/{id}`                            | update ticket with given id
|              | `DELETE`   | `/itr/api/tickets/{id}`                            | delete ticket with given id
| Users        | `GET`      | `/itr/api/users?{project}`                         | retrieve users belonging to given project
|              |            | `/itr/api/users/{id}`                              | retrieve user with id
|              | `POST`     | `/itr/api/users/register`                          | register a new user
|              |            | `/itr/api/users/login`                             | login a user
|              |            | `/itr/api/users/logout`                            | logout a user
|              | `PUT`      | `/itr/api/users/{id}`                              | update a user with the given id