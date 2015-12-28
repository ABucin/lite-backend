REST paths
============

| Entity       | Action     | Path                                 | Description
| -------------| -----------| -------------------------------------| ------------------------------------------
| Analytics    | `GET`      | `/itr/api/v1/analytics?{type}`       | retrieve analytics with given type
| Comments     | `GET`      | `/itr/api/v1/comments/{id}`          | retrieve comment with given id
|              | `POST`     | `/itr/api/v1/tickets/{id}/comments`  | -
|              | `PUT`      | `/itr/api/v1/comments/{id}`          | update comment with given id
|              | `DELETE`   | `/itr/api/v1/comments/{id}`          | delete comment with given id
| Logs         | `GET`      | `/itr/api/v1/logs`                   | retrieve all logs
|              | `POST`     | `/itr/api/v1/logs`                   | add log entry for the currently authenticated user
| Settings     | `GET`      | `/itr/api/v1/settings`               | retrieve settings for the currently authenticated user
|              | `PUT`      | `/itr/api/v1/settings`               | update settings for the currently authenticated user
| Tickets      | `GET`      | `/itr/api/v1/tickets`                | retrieve tickets for the currently authenticated user
|              | `POST`     | `/itr/api/v1/tickets`                | create ticket for the currently authenticated user
|              | `PUT`      | `/itr/api/v1/tickets/{id}`           | update ticket with given id
|              | `DELETE`   | `/itr/api/v1/tickets/{id}`           | delete ticket with given id
| Users        | `GET`      | `/itr/api/v1/users?{project}`        | retrieve users belonging to given project
|              |            | `/itr/api/v1/users/{id}`             | retrieve user with id
|              | `POST`     | `/itr/api/v1/users/register`         | register a new user
|              |            | `/itr/api/v1/users/login`            | login a user
|              |            | `/itr/api/v1/users/logout`           | logout a user
|              | `PUT`      | `/itr/api/v1/users/{id}`             | update a user with the given id