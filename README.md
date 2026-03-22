# 🚀 VedaAI

An AI-powered assignment and question generation platform built with a scalable full-stack architecture. VedaAI leverages modern web technologies and AI to automate the creation, validation, and management of educational content.


# ✨ Features

* 🧠 AI-based question & assignment generation
* ⚡ Real-time updates using WebSockets
* 📊 Interactive dashboard for managing content
* 🔄 Background job processing with queues (BullMQ)
* 🗂️ Modular and scalable architecture
* ☁️ Cloud-ready deployment setup


# 🏗️ Tech Stack

## Frontend

* Next.js (React + TypeScript)
* Zustand (State Management)
* Tailwind CSS

## Backend

* Node.js + Express (TypeScript)
* MongoDB (Mongoose)
* Redis (BullMQ for job queues)
* OpenAI API (AI-powered generation)

## Infrastructure

* Render (Deployment)
* MongoDB Atlas (Database)
* Upstash Redis (Queue system)


# 📦 Project Structure

VedaAI/
├── backend/        # API server, AI logic, job queues
├── frontend/       # Next.js application (UI)
└── README.md


# ⚙️ Setup Instructions

## 1. Clone the Repository

```bash
git clone https://github.com/KrishnaVala880/VedaAI.git
cd VedaAI
```

## 2. Install Dependencies

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd ../frontend
npm install
```

## 3. Environment Variables

Create a `.env` file in both `backend` and `frontend` directories.

You can copy from `.env.example` (create one if not present):

### Backend .env
```env
MONGODB_URI=
REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=
OPENAI_API_KEY=
FRONTEND_URL=
```

### Frontend .env
```env
NEXT_PUBLIC_API_URL=       ### Backend URL/api  e.g.: if Backend URL is https://vedaaibackend-xlv7.onrender.com then NEXT_PUBLIC_API_URL=https://vedaaibackend-xlv7.onrender.com/api
NEXT_PUBLIC_WS_URL=        ### Websocket URL  e.g.: if Backend URL is https://vedaaibackend-xlv7.onrender.com then NEXT_PUBLIC_WS_URL=wss://vedaaibackend-xlv7.onrender.com/ws
```

⚠️ Never commit your `.env` file to version control.


## 4. Run the Project Locally

### Start Backend

```bash
cd backend
npm run dev
```

### Start Frontend

```bash
cd ../frontend
npm run dev
```


## 🧠 Architecture Overview

* **Frontend** communicates with backend via REST APIs
* **WebSockets** enable real-time updates (e.g., job status)
* **Backend** handles:
  * AI-based question generation
  * Validation & processing
  * Data storage
* **Redis + BullMQ** manages background jobs and queues
* **MongoDB** stores structured data



## 🚀 Deployment

1. Push your code to GitHub
2. Deploy services on Render:

   * Backend → Web Service
   * Frontend → Static / Web Service
3. Configure:

   * MongoDB Atlas (Database)
   * Upstash Redis (Queue)
4. Add environment variables in Render dashboard



## 🔮 Future Improvements

* User authentication & role-based access
* Question difficulty tuning
* Multi-language support

