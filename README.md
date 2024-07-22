# MediaHub API

MediaHub API is a comprehensive platform for video sharing and streaming, similar to YouTube. Built with Node.js, Express, and MongoDB, it provides a robust framework for user management, video handling, and various interactive features like likes and comments.

## Technologies Used

- **Node.js**
- **Express**
- **MongoDB**

## Features

- **User Management**: Register, login, and manage user profiles.
- **Video Management**: Upload, update, delete, and publish videos.
- **Video Search**: Query videos based on various criteria.
- **Interaction**: Like, comment, and create playlists.

## API Endpoints

The following routes are included:

### Users

- **POST /users/register**: Register a new user.
- **POST /users/login**: Login a user.
- **POST /users/logout**: Logout a user.
- **GET /users/channel**: Get a channel profile.
- **GET /users/history**: Get user history.

### Videos

- **POST /videos**: Publish a video.
- **GET /videos/:id**: Get a video by ID.
- **PATCH /videos/:id**: Update a video by ID.
- **DELETE /videos/:id**: Delete a video by ID.
- **PATCH /videos/:id/toggle-publish**: Toggle video publish status.
- **GET /videos**: Get videos via query.

### Tweets
- Routes for tweet management.

### Playlist
- Routes for playlist management.

### Like
- Routes for managing likes.

### Comment
- Routes for managing comments .

## Postman Collection

For detailed API testing and interaction, use the Postman collection provided:

[Postman Collection](https://www.postman.com/martian-crescent-666772/workspace/mediahub-api/collection/32525625-edb76880-074d-4fbc-9cf6-4fdf173357de?action=share&creator=32525625)

**Note:**
MediaHub API is not currently deployed. To use this API, you can clone the repository and add your environment variables with your own credentials. 

```bash
git clone https://github.com/DhyanRaiBM/NodeJS-Media-Hub-API.git
cd mediahub-api
# Add your environment variables in a .env file
npm install
npm start
