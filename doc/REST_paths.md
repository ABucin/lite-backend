REST paths
============

| Entity       | Action     | Path                                       | Description
| -------------| -----------| -------------------------------------------| ------------------------------------------
| Analytics    | `GET`      | `/itr/api/v1/analytics?{type}`                        | retrieve analytics with given type
| Comments     | `GET`      | `/itr/api/v1/comments/{id}`                           | retrieve comment with given id
|              | `POST`     | `/itr/api/v1/users/{id}/tickets/{ticketId}/comments`  | -
|              | `PUT`      | `/itr/api/v1/comments/{id}`                           | update comment with given id
|              | `DELETE`   | `/itr/api/v1/comments/{id}`                           | delete comment with given id
| Logs         | `GET`      | `/itr/api/v1/logs`                                    | retrieve all logs
|              | `POST`     | `/itr/api/v1/users/{id}/logs`                         | add log entry
| Settings     | `GET`      | `/itr/api/v1/users/{id}/settings`                     | retrieve settings for user with given id
|              | `PUT`      | `/itr/api/v1/users/{id}/settings`                     | update settings for user with given id
| Tickets      | `GET`      | `/itr/api/v1/users/{id}/tickets`                      | retrieve tickets for user
|              | `POST`     | `/itr/api/v1/users/{id}/tickets`                      | create ticket for use
|              | `PUT`      | `/itr/api/v1/tickets/{id}`                            | update ticket with given id
|              | `DELETE`   | `/itr/api/v1/tickets/{id}`                            | delete ticket with given id
| Users        | `GET`      | `/itr/api/v1/users?{project}`                         | retrieve users belonging to given project
|              |            | `/itr/api/v1/users/{id}`                              | retrieve user with id
|              | `POST`     | `/itr/api/v1/users/register`                          | register a new user
|              |            | `/itr/api/v1/users/login`                             | login a user
|              |            | `/itr/api/v1/users/logout`                            | logout a user
|              | `PUT`      | `/itr/api/v1/users/{id}`                              | update a user with the given id