# 🍽️ Tastora – Real-Time Food Ordering & Delivery System

Tastora is a full-stack food ordering and delivery platform inspired by modern food delivery applications. It uses a microservices architecture to manage customers, restaurants, riders, administrators, orders, payments, and real-time delivery tracking.


- GitHub: [Souvik-101-gitHub](https://github.com/Souvik-101-gitHub)
- Project: [Tastora](https://github.com/Souvik-101-gitHub/Tastora)

 

  
## 🚀 Features

- **User Authentication:** Secure JWT-based authentication and role-based access control.
- **Multiple User Roles:** Dedicated functionality for Customers, Restaurant Owners, Riders, and Admins.
- **Restaurant Management:** Browse restaurants, explore menus, and manage food items.
- **Order Management:** Place orders and manage order status.
- **Real-Time Order Tracking:** Track orders and rider locations using Socket.IO and Leaflet maps.
- **Automatic Rider Location Updates:** Rider location updates every 10 seconds.
- **Nearby Rider Matching:** Find available riders within a 500-metre radius when an order is ready.
- **Online Payments:** Integrated Razorpay and Stripe payment gateways.
- **Asynchronous Communication:** RabbitMQ-based messaging between backend services.
- **Admin Dashboard:** Manage restaurants and riders.
  
## System Architecture
   <img width="3508" height="2480" alt="Tastora_All_Screenshots" src="https://github.com/user-attachments/assets/f586f51b-e2db-4b88-8e2e-125b38e0cb66" />

### Microservices Architecture
<img width="1518" height="962" alt="Tastora_Microservices_Architecture drawio" src="https://github.com/user-attachments/assets/290372ba-de6c-42dd-8f75-88891ad69776" />


## 🛠️ Tech Stack

### Frontend
- React.js
- TypeScript
- Vite
- Tailwind CSS
- Leaflet
- Socket.IO Client
- Axios

### Backend
- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT Authentication
- Socket.IO
- RabbitMQ

### Payment & Cloud Services
- Razorpay
- Stripe
- Cloudinary

### DevOps & Tools
- Docker
- Docker Compose
- Git & GitHub
- Postman

## 🏗️ Project Architecture

Tastora follows a microservices architecture with six independent backend services.

```text
Tastora/
│
├── frontend/
│
├── services/
│   ├── auth/
│   ├── restaurant/
│   ├── utils/
│   ├── realtime/
│   ├── rider/
│   └── admin/
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

Each service handles a separate business responsibility, making the application easier to maintain and extend.

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Souvik-101-gitHub/Tastora.git
```

### 2. Navigate to the Project

```bash
cd Tastora
```

### 3. Install Dependencies

Install the frontend and individual backend service dependencies using their respective `package.json` files.

```bash
cd frontend
npm install
```

Repeat for each backend service.

### 4. Configure Environment Variables

Create the required `.env` files for the frontend and backend services.

Configure the necessary values, including:

- MongoDB connection string
- JWT secret
- RabbitMQ connection URL
- Cloudinary credentials
- Razorpay API keys
- Stripe API keys
- Google OAuth credentials
- Service URLs and ports

**Never commit `.env` files or expose private API credentials.**

### 5. Run the Application

Start each backend service using its available npm development script.

Start the frontend:

```bash
cd frontend
npm run dev
```

### 6. Docker Setup

Docker and Docker Compose configuration are included in the project.

Once the Docker configuration and environment variables are ready, start the application using:

```bash
docker compose up --build
```

## 🔐 Security

- JWT-based authentication.
- Role-based authorization.
- Environment-based configuration.
- Protected API routes.
- Secure payment gateway integration.

## 🎯 Project Objective

The objective of Tastora is to build a scalable food delivery application that demonstrates practical knowledge of full-stack development, microservices architecture, REST APIs, real-time communication, database management, payment integration, and containerization.



---

⭐ If you find this project interesting, consider giving it a star!
