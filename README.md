# 📊 PriceLens – Smart Offline Price Comparison Platform

PriceLens is a location-based price comparison web application designed to bridge the gap between **offline retail stores** and **digital product discovery**.  
It helps customers find the **best price at the nearest shop**, while empowering shopkeepers with **real-time inventory control, discounts, and alerts**.

Built using **React + TypeScript (TSX)**, **Leaflet with OpenStreetMap**, and **Supabase** for backend services.

---

## 🚀 Problem Statement

- Customers waste time visiting stores where products are **out of stock**
- Offline shops lack **digital visibility**
- No real-time price or availability comparison across nearby stores
- Shopkeepers cannot easily broadcast **offers, sales, or restock updates**

---

## 🎯 Solution – What PriceLens Does

PriceLens enables:
- 📍 **Location-aware price comparison**
- 🏪 **Shopkeeper dashboards** for inventory & offers
- 🔔 **Real-time stock alerts**
- 🛍️ **Smart product search** within a customizable distance radius

---

## 🧠 Core Features

---

## 🌍 Location-Based Search (OSM + Leaflet)

- Uses **OpenStreetMap (OSM)** with **Leaflet**
- Automatically detects user location
- Adjustable search radius (default: **10 KM**, adjustable via scrollbar)
- Displays nearest shops offering the searched product
- One-click **Google Maps navigation** to the shop

---

## 👤 Customer Module

### Authentication
- Customer Login & Signup
- Stores:
  - Name
  - Email

### Profile Page
- View personal details
- Saved preferences (distance radius, searches)

### Product Search
- Compare prices from nearby offline stores
- View:
  - Best price
  - Distance from current location
  - Stock availability
  - Active offers & gifts
- Redirect to Google Maps for navigation

---

## 🏪 Shopkeeper Dashboard

### Shop Registration
Shopkeepers can add and manage:
- Shop Name
- Owner Name
- Phone Number
- Address
- Latitude
- Longitude
- Shop Category

---

### Product Management
- Add / Edit / Delete products
- Set product price
- Assign categories
- Enable / disable product visibility

---

## 📦 Real-Time Inventory Alerts (Phase 2 Feature)

### Problem Solved
- Prevents customers from visiting **out-of-stock** shops
- Provides real-time product availability

### Features
- Stock status:
  - ✅ In Stock
  - ⚠️ Limited
  - ❌ Out of Stock
- Display remaining quantity (e.g., *"Only 3 left"*)
- Optional restock date
- Real-time visibility for customers
- Notification when item is restocked

---

## 🎁 Special Offers & Gifts

### Product-Level Offers
Shopkeepers can add:
- Scratch & Win offers
- Free gifts (e.g., free charger)
- Buy One Get One offers
- Custom promotional descriptions

These offers are shown as **highlighted alerts** during customer product searches.

---

## 💸 General Discount System

A flexible discount system for shopkeepers:

### Discount Options
- Apply discount to **all products**
- Apply discount to **selected products**
- Enable or disable discounts at any time

### Examples
- "Flat 10% off on all items"
- "Festival Sale – Limited Time Offer"

Discount badges are displayed on all applicable products in real time.

---

## ⚡ Real-Time Updates

Powered by **Supabase Realtime**:
- Inventory status changes
- Offer activation / deactivation
- Discount updates
- Restock notifications

---

## 🛠️ Tech Stack

### Frontend
- React
- TypeScript (TSX)
- Leaflet
- OpenStreetMap
- Tailwind CSS

### Backend & Services
- Supabase
  - Authentication
  - PostgreSQL Database
  - Realtime subscriptions
  - Row Level Security (RLS)

---

## 🗺️ System Architecture

```
Customer / Shopkeeper
↓
React Frontend
↓
Leaflet + OpenStreetMap
↓
Supabase Backend
↓
Realtime Updates & Notifications
```

---

## 🔐 Authentication & Security

- Supabase Email & Password Authentication
- Role-based access:
  - Customer
  - Shopkeeper
- Secure data access using Row Level Security (RLS)

---

## 📈 Future Enhancements

- Push notifications (mobile)
- AI-based price trend analysis
- Shop ratings & reviews
- Barcode / QR-based product scanning
- Loyalty points & cashback rewards

---

## 🧪 Project Status

- ✅ Phase 1: Core platform completed  
- ✅ Phase 2: Inventory alerts, offers & discounts 
and Many Feature are coming soon that includes ML integration
---

## 👨‍💻 Project Use Cases

- Final Year Engineering Project
- Startup MVP
- Hackathons
- Portfolio & Resume Showcase

---

## ❤️ Conclusion

PriceLens digitizes offline retail by combining **location intelligence**, **real-time inventory**, and **smart price comparison**, making shopping faster for customers and smarter for shopkeepers.

---