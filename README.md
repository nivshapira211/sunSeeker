# SunSeeker

SunSeeker is a collaborative platform designed for discovering and planning sunrise and sunset viewing experiences. It bridges the gap between beautiful photography and practical planning by providing the exact technical data needed to recreate a captured moment.

## About the App

The core value of SunSeeker lies in its combination of a visually immersive experience with actionable technical information. Users don't just see a photo; they learn exactly where it was taken and the precise time they need to be there to witness the same event.

The app also offers personalized suggestions for nearby viewing spots and optimal times based on the user's current location.

## Key Features

* **Sunrise & Sunset Feed**:
* Browse a feed of photos uploaded by the community.


* Engage with content through likes and comments.


* Access the exact time and location data for every photo in the feed.




* **Personal Content Management**:
* Upload your own sunrise and sunset photography.


* Maintain a personal history of uploaded photos.


* 
**AI-Powered Validation**: Built-in validation ensures that all uploaded images are authentic sunrise or sunset photos.




* **Sunrise & Sunset Assistant (AI-Powered)**:
* Get help finding the ideal geographic spot for your next viewing.


* Identify the optimal time to arrive for the best experience.




* **User Management**:
* Secure account registration, login, and logout functionality.
* Login uses Google OAuth: set `VITE_GOOGLE_OAUTH_URL` in the frontend (see `frontend/.env.example`) to your backend's Google OAuth URL; the Login action redirects there directly.

## Local setup (register / login with MongoDB)

* **Backend**: Uses MongoDB at `localhost:27017` with database name **posts-app**. Set `MONGO_URI` in `backend/.env` (see `backend/.env.example`), e.g. `mongodb://localhost:27017/posts-app`, so register and login persist users to the DB.
* **Frontend**: Set `VITE_API_BASE_URL` in `frontend/.env` (e.g. `https://localhost:3000/api`) so the UI sends register and login requests to the backend; user data is then stored in MongoDB.
