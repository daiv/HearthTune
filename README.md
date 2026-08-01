# HearthTune

Music Streaming & Playlist Management Application


## Overview
This application is a full-stack music streaming and playlist management solution featuring a React Native mobile client and a Node.js/TypeScript backend server integrated with GraphQL and MongoDB. It provides multi-source audio playback, intelligent queue management, user authentication, and a modern mobile interface.

---

<div display:flex>
<p>
  <img style=width:33%; padding-right: 1%; height: auto src="./githubAssets/login.png"/>
  <img style=width:33%; padding-right: 1%; height: auto src="./githubAssets/idle.png"/>
  <img style=width:33%; height: auto src="./githubAssets/searching.png"/>
</p>
<p style=display: fle justify-content: centerx>
  <img style=width:49%; padding-right: 1%; height: auto src="./githubAssets/searchResult.png"/>
  <img style=width:49%; height: auto src="./githubAssets/playing.png"/>
</p>
</div>



## Core Features & Architecture

### 1. Mobile Interface & Playback Experience
* **Modern UI Components:** Clean card layouts with native styling, subtle shadows, rounded borders, and dynamic active-track indicators across playlist and search views.
* **Animated Progress Tracking:** Integrated progress bars on active playlist items that dynamically fill as tracks advance using `react-native-track-player`.
* **Global Audio Controls:** A centralized bottom control bar featuring track progression, like/favorite actions, shuffle, repeat, and play/pause controls.
* **Smart Search System:** Dedicated search interface with responsive inputs, loading indicators, and optimized item actions to add tracks directly to the active queue.

### 2. Audio Engine & Queue Management
* **Multi-Source Audio Support:** Capabilities to handle and stream music from multiple backend data sources and local track detection.
* **Dynamic Queue & Rotation:** Automated queue control functions that support track skipping, shuffling, resetting, and automatically queueing related songs or recommendations upon reaching the end of the playlist.
* **Predictive Buffering:** Logic designed to buffer related songs for smooth, uninterrupted playback transitions.
* **Secure Streaming:** Protected audio delivery leveraging secure signed URL streaming mechanisms.

### 3. Backend, GraphQL & Database Architecture
* **GraphQL API:** Comprehensive queries and mutations managed through a centralized GraphQL client manager to handle song catalog searches and data fetching.
* **Repository Pattern & Persistence:** Clean separation of data layers using Mongoose for robust song and user state persistence in MongoDB.
* **Infrastructure:** Fully containerized setup using Docker for local development and backend execution.

### 4. Authentication & Security
* **JWT & Session Management:** Complete token-based authentication workflow supporting secure login, session handling, and user logout capabilities.
* **User Lifecycle:** End-to-end user invitation, registration flows, and validation logic.
* **Role-Based Access Control (RBAC):** Granular authorization policies securing backend operations and user data.
* **Device Tracking:** Device ID enforcement and secure local storage tracking for enhanced client security.

## Tech Stack
* **Server:**<br>
    <picture>![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)</picture>
    <picture>![Express](https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white)</picture>
    <picture>![HTTP](https://img.shields.io/badge/HTTP-API-lightgrey)</picture>
    <picture>![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)</picture>
    <picture>![Docker](https://img.shields.io/badge/docker-231bd5?style=flat&logo=docker&logoColor=white)</picture>
    <picture>![Graphql](https://img.shields.io/badge/GraphQl-531bd5?style=flat&logo=graphql&logoColor=white)</picture>
    <picture>![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)</picture>

* **Mobile:**<br>
    <picture>![React Native](https://img.shields.io/badge/React_Native-61DAFB?style=flat&logo=react&logoColor=black)</picture>
    <picture>![Expo](https://img.shields.io/badge/Expo-000020?style=flat&logo=expo&logoColor=white)</picture>
    <picture>![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)</picture>
    <picture>![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=flat&logo=react-query&logoColor=white)<picture>
    <picture>![Graphql](https://img.shields.io/badge/GraphQl-531bd5?style=flat&logo=graphql&logoColor=white)</picture>