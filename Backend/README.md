# User Registration API Documentation

## Endpoint

`POST /users/register`

## Description

Registers a new user in the system. Requires a valid email, a password, and a first name (last name is optional).

## Request Body

Send a JSON object with the following structure:

```json
{
  "fullname": {
    "firstname": "John",      // required, min 3 chars
    "lastname": "Doe"         // optional, min 3 chars if provided
  },
  "email": "john@example.com", // required, valid email
  "password": "secret123"      // required, min 6 chars
}
```

## Responses

- **201 Created**
  - User registered successfully.
  - Response body:
    ```json
    {
      "user": { ...userObject },
      "token": "jwt_token_here"
    }
    ```

- **400 Bad Request**   
  - Validation failed (e.g., missing fields, invalid email, short password).
  - Response body:
    ```json
    {
      "errors": [
        {
          "msg": "Error message",
          "param": "field",
          "location": "body"
        }
      ]
    }
    ```

- **500 Internal Server Error**
  - Unexpected server error.

## Notes

- Password is hashed before storage.
- JWT token is returned for authentication.
- Email must be unique.

---

# User Login API Documentation

## Endpoint

`POST /users/login`

## Description

Authenticates a user with email and password. Returns a JWT token if credentials are valid.

## Request Body

```json
{
  "email": "john@example.com",   // required, valid email
  "password": "secret123"        // required, min 6 chars
}
```

## Responses

- **200 OK**
  - Login successful.
  - Response body:
    ```json
    {
      "user": { ...userObject },
      "token": "jwt_token_here"
    }
    ```

- **400 Bad Request**
  - Validation failed (e.g., missing fields, invalid email, short password).
  - Response body:
    ```json
    {
      "errors": [
        {
          "msg": "Error message",
          "param": "field",
          "location": "body"
        }
      ]
    }
    ```

- **401 Unauthorized**
  - Invalid email or password.
  - Response body:
    ```json
    {
      "error": "Invalid email or password"
    }
    ```

- **500 Internal Server Error**
  - Unexpected server error.

## Notes

- Returns JWT token for authenticated sessions.
- Password is never returned in the response.

---

# User Profile API Documentation

## Endpoint

`GET /users/profile`

## Description

Returns the authenticated user's profile information. Requires authentication via JWT token (sent as a cookie or in the `Authorization` header).

## Request

- **Headers**
  - `Authorization: Bearer <jwt_token>` (if not using cookies)

## Responses

- **200 OK**
  - Returns the user's profile.
    ```json
    {
      "_id": "user_id",
      "fullname": {
        "firstname": "John",
        "lastname": "Doe"
      },
      "email": "john@example.com",
      // ...other fields
    }
    ```

- **401 Unauthorized**
  - Missing or invalid token.

---

# User Logout API Documentation

## Endpoint

`GET /users/logout`

## Description

Logs out the authenticated user by clearing the authentication token (cookie) and blacklisting the token. Requires authentication.

## Request

- **Headers**
  - `Authorization: Bearer <jwt_token>` (if not using cookies)

## Responses

- **200 OK**
  - Logout successful.
    ```json
    {
      "message": "Logged out successfully"
    }
    ```

- **401 Unauthorized**
  - Missing or invalid token.

## Notes

- After logout, the token is blacklisted and cannot be used again.

---

# Captain Registration API Documentation

## Endpoint

`POST /captains/register`

## Description

Registers a new captain (driver) in the system. Requires valid email, password, first name, and vehicle details.

## Request Body

```json
{
  "fullname": {
    "firstname": "Jane",      // required, min 3 chars
    "lastname": "Smith"       // optional, min 3 chars if provided
  },
  "email": "jane@example.com",   // required, valid email
  "password": "secret123",       // required, min 6 chars
  "vehicle": {
    "color": "Red",             // required, min 3 chars
    "plate": "ABC123",          // required, min 3 chars
    "capacity": 4,              // required, integer >= 1
    "vehicleType": "car"        // required, one of: car, motorcycle, auto
  }
}
```

## Responses

- **201 Created**
  - Captain registered successfully.
  - Response body:
    ```json
    {
      "token": "jwt_token_here", // JWT token for authentication
      "captain": {
        "_id": "captain_id",
        "fullname": {
          "firstname": "Jane",
          "lastname": "Smith"
        },
        "email": "jane@example.com",
        "status": "inactive", // default status
        "vehicle": {
          "color": "Red",
          "plate": "ABC123",
          "capacity": 4,
          "vehicleType": "car"
        }
        // ...other fields
      }
    }
    ```

- **400 Bad Request**
  - Validation failed (e.g., missing fields, invalid email, short password, invalid vehicle data) or captain already exists.
  - Response body (validation error):
    ```json
    {
      "errors": [
        {
          "msg": "Error message", // e.g. "Invalid Email"
          "param": "field",       // e.g. "email"
          "location": "body"
        }
      ]
    }
    ```
    or (captain already exists):
    ```json
    {
      "message": "Captain already exist"
    }
    ```

- **500 Internal Server Error**
  - Unexpected server error.

## Notes

- Password is hashed before storage.
- JWT token is returned for authentication.
- Email must be unique for captains.
- Vehicle type must be one of: `car`, `motorcycle`, `auto`.

---

# Captain Login API Documentation

## Endpoint

`POST /captains/login`

## Description

Authenticates a captain with email and password. Returns a JWT token if credentials are valid.

## Request Body

```json
{
  "email": "jane@example.com",   // required, valid email
  "password": "secret123"        // required, min 6 chars
}
```

## Responses

- **200 OK**
  - Login successful.
  - Response body:
    ```json
    {
      "token": "jwt_token_here", // JWT token for authentication
      "captain": { ...captainObject }
    }
    ```

- **400 Bad Request**
  - Validation failed (e.g., missing fields, invalid email, short password).
  - Response body:
    ```json
    {
      "errors": [
        {
          "msg": "Error message",
          "param": "field",
          "location": "body"
        }
      ]
    }
    ```

- **401 Unauthorized**
  - Invalid email or password.
  - Response body:
    ```json
    {
      "message": "Invalid email or password"
    }
    ```

- **500 Internal Server Error**
  - Unexpected server error.

---

# Captain Profile API Documentation

## Endpoint

`GET /captains/profile`

## Description

Returns the authenticated captain's profile information. Requires authentication via JWT token (sent as a cookie or in the `Authorization` header).

## Request

- **Headers**
  - `Authorization: Bearer <jwt_token>` (if not using cookies)

## Responses

- **200 OK**
  - Returns the captain's profile.
    ```json
    {
      "captain": {
        "_id": "captain_id",
        "fullname": {
          "firstname": "Jane",
          "lastname": "Smith"
        },
        "email": "jane@example.com",
        "status": "inactive",
        "vehicle": {
          "color": "Red",
          "plate": "ABC123",
          "capacity": 4,
          "vehicleType": "car"
        }
        // ...other fields
      }
    }
    ```

- **401 Unauthorized**
  - Missing or invalid token.

---

# Captain Logout API Documentation

## Endpoint

`GET /captains/logout`

## Description

Logs out the authenticated captain by clearing the authentication token (cookie) and blacklisting the token. Requires authentication.

## Request

- **Headers**
  - `Authorization: Bearer <jwt_token>` (if not using cookies)

## Responses

- **200 OK**
  - Logout successful.
    ```json
    {
      "message": "Logout successfully"
    }
    ```

- **401 Unauthorized**
  - Missing or invalid token.

## Notes

- After logout, the token is blacklisted and cannot be used again.
#   A o o C h a l e -  
 