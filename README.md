# FindBack AI – Smart Lost and Found Management System

FindBack AI is a web-based Lost and Found Management System designed to help people report lost and found items and identify potential matches through similarity-based matching.

## Live Demo

- **Frontend:** https://findback-ai-1.onrender.com
- **Backend API:** https://findback-ai-q4we.onrender.com
- **GitHub Repository:** https://github.com/harshit-srivastva77/FindBack-AI

## Problem Statement

People often struggle to recover lost belongings because information about lost and found items is scattered and difficult to compare manually.

## Proposed Solution

FindBack AI provides a centralized platform where users can report lost and found items. Its similarity-based matching system compares item details and displays potential matches with a matching percentage.

## Key Features

- Report Lost Items
- Report Found Items
- Browse Reported Items
- Search Items
- Filter Items by Category
- Similarity-Based Item Matching
- Matching Percentage
- MongoDB Data Storage
- Live Web Deployment

## Technology Stack

**Frontend**
- React
- TypeScript
- Vite
- CSS

**Backend**
- Node.js
- Express.js

**Database**
- MongoDB
- Mongoose

**Deployment**
- Render

**Version Control**
- Git and GitHub

## How It Works

1. A user submits details of a lost or found item.
2. The item information is stored in MongoDB.
3. The matching system compares lost and found item details.
4. Potential matches are displayed with a similarity percentage.
5. Users can search and filter reported items.

## Matching System

FindBack AI uses a similarity-based matching approach that compares item information such as category, name, location, and description.

The system calculates a similarity score and displays potential matches to help users identify related lost and found reports.

*Note: The current prototype uses similarity-based matching and does not use a separately trained machine learning model.*

## Project Structure

```text
FindBack-AI/
│
├── frontend/
│   └── React Application
│
├── backend/
│   └── Node.js and Express API
│
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check API status |
| GET | `/api/items` | Get all items |
| POST | `/api/items` | Add an item |
| DELETE | `/api/items/:id` | Delete an item |

## Future Scope

- AI/ML-based advanced item matching
- User authentication
- Image-based item recognition
- Notifications for potential matches
- Contact and item recovery workflow

## Author

**Harshit Srivastva**

## License

This project is developed as an academic Ideathon project.