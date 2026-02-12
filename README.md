# Romantic Diary - SaaS Edition ❤️

A personalized, interactive digital diary that users can create and share with their Valentine.

## Features
- **3D Book Interface**: Realistic page flips, spiral binding, and leather textures.
- **Customization**: Users can write their own story and add photos.
- **Payment Integration**: Razorpay (Test Mode) to unlock sharing.
- **Responsive Design**: Works on Desktop, Tablets, and Mobile.

## Prerequisites
- Node.js installed.
- MongoDB installed and running locally.

## Setup
1.  **Clone/Download** the project.
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Configure Environment**:
    - Rename `.env_example` to `.env`.
    - Add your **Razorpay Test Keys** in `.env`.
    - (Optional) Update `MONGO_URI` if your MongoDB is not on localhost.

## Running the Project
1.  **Start MongoDB**: Ensure your local MongoDB instance is running.
2.  **Start the Server**:
    ```bash
    npm start
    ```
3.  **Open in Browser**:
    - Go to `http://localhost:3000`

## How to Uses
1.  **Signup**: Create an account with a unique link name (e.g., `rahul-loves-priya`).
2.  **Edit**: Use the Dashboard to customize the text and images of your diary pages.
3.  **Unlock**: Click "Pay ₹9" (Test Mode) to unlock the diary for public viewing.
4.  **Share**: Send the link `http://localhost:3000/u/rahul-loves-priya` to your Valentine!
