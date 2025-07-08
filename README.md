

---

# UniCom Hub 🚀  
A Multi-Channel Bulk Messaging Platform

UniCom Hub is a unified messaging solution designed to send personalized bulk messages across multiple platforms including *Email, **WhatsApp, and **SMS*. It streamlines client communication, supports message customization, and provides a scalable architecture for enterprise use.

---

## 🔧 Tech Stack

### 🖥 Frontend
- React.js (Single Page Application)
- Tailwind CSS (for clean UI)
- Axios (for API calls)

### ⚙ Backend
- Node.js (Express.js)
- MongoDB (Mongoose ORM)
- Puppeteer (WhatsApp automation)
- Nodemailer (Email)
- Twilio API (SMS)

---

## 📌 Features

- 📁 *CSV/Excel Upload*: Import contact lists with dynamic placeholders
- 💬 *Dynamic Message Customization*: Personalize messages using placeholders like {{name}}, {{email}}, etc.
- 📱 *Multi-Platform Messaging*:
  - WhatsApp (via Puppeteer + Web)
  - Email (via Nodemailer + Gmail SMTP)
  - SMS (via Twilio)
- 📊 *Real-Time Analytics*: Track delivery status and logs (Planned)
- 🔐 *Secure & Scalable*: Token-based API security and modular microservice-ready architecture

---

## 🧠 Use Cases

- Client onboarding communication
- Marketing campaigns
- Event or product announcements
- Bulk internal messaging for organizations

---

## 📦 Installation

```bash
git clone https://github.com/yourusername/unicom-hub.git
cd unicom-hub

Backend Setup

cd server
npm install
cp .env.example .env # Add your environment variables
npm start

Frontend Setup

cd client
npm install
npm start

````
---

#🔐 Environment Variables

Here’s what you’ll need to add in your .env file:

# MongoDB
MONGO_URI=your_mongodb_connection_string

# Email (SMTP)
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Twilio
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE=your_twilio_phone_number

# WhatsApp (no API key needed but browser automation should be active)


---

🧪 Sample Message Format

CSV File Columns:

name,email,phone
John Doe,john@example.com,+918888888888

Message Template:

Hi {{name}}, your email is {{email}} and we’ll contact you at {{phone}}.


---
