# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## High-level Code Architecture and Structure

This project is a modern terminal emulator and SSH manager named **Kerminal**, built with a combination of web technologies for the frontend and Rust for the backend, packaged as a desktop application using Tauri.

-   **Frontend (`src/`):** The user interface is built with **Vue 3** and the Composition API.
    -   **State Management:** State is managed by **Pinia**.
    -   **Styling:** **TailwindCSS** is used for styling.
    -   **Terminal Emulation:** The core terminal functionality is provided by **xterm.js**.
-   **Backend (`src-tauri/`):** The backend is written in **Rust** using the **Tauri v2** framework. This provides native performance, security, and access to system-level features.
    -   **SSH:** The `russh` library is used for the SSH protocol implementation.
    -   **Database:** The application supports multiple databases (SQLite, MySQL, PostgreSQL, MongoDB) for local and synchronized storage, using `SQLx` for SQL databases.
-   **Build Tool:** **Vite** is used as the frontend build tool.

## Common Commands

Here are the most common commands used in this project:

-   **Install Dependencies:**
    ```bash
    npm install
    ```
-   **Run in Development Mode:** This command starts the Vite development server for the frontend and launches the Tauri application.
    ```bash
    npm run tauri dev
    ```
-   **Build for Production:** This command builds the frontend and then builds the final Tauri application for the current platform.
    ```bash
    npm run tauri build
    ```
    The output bundles will be located in `src-tauri/target/release/bundle/`.
-   **Format Code:** This command uses Prettier to format the TypeScript, Vue, and CSS files in the project.
    ```bash
    npm run pretty
    ```
