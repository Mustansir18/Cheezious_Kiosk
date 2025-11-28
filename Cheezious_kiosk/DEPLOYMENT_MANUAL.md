# Cheezious Connect: Deployment Manual for Windows Server

This document provides a comprehensive guide for deploying the Cheezious Connect Next.js application on a Windows Server machine for use as a self-service kiosk.

## 1. Prerequisites

Before you begin, ensure your Windows Server (2019, 2022, or newer recommended) has the necessary hardware and software.

### 1.1. Hardware Requirements

The actual requirements will vary based on customer traffic and order volume. However, the following specifications provide a good starting point.

#### Minimum Requirements (for testing or low traffic)
- **CPU:** 2 Cores
- **RAM:** 4 GB
- **Storage:** 40 GB SSD
- **OS:** Windows Server 2019 or newer

#### Recommended Requirements (for production)
- **CPU:** 4+ Cores
- **RAM:** 8+ GB
- **Storage:** 80+ GB SSD (Solid State Drive is highly recommended for performance)
- **OS:** Windows Server 2022 or newer

### 1.2. Software Prerequisites

Ensure the following software is installed on your server:

#### 1.2.1. Node.js and npm
The application is built on Node.js.
- **Download:** Get the latest LTS version from the [official Node.js website](https://nodejs.org/).
- **Installation:** Run the installer and follow the on-screen instructions. The installer includes `npm` (Node Package Manager).
- **Verification:** Open PowerShell or Command Prompt and run the following commands to ensure installation was successful:
  ```powershell
  node -v
  npm -v
  ```

#### 1.2.2. IIS (Internet Information Services)
IIS will act as a reverse proxy, directing incoming web traffic to the running Node.js application.
- **Installation:**
  1. Open **Server Manager**.
  2. Go to **Manage** > **Add Roles and Features**.
  3. Select "Role-based or feature-based installation".
  4. Select your server.
  5. Under "Server Roles", check **Web Server (IIS)**.
  6. Proceed with the default features and complete the installation.

#### 1.2.3. IIS Modules: URL Rewrite and ARR
These modules are essential for IIS to function as a reverse proxy.
- **URL Rewrite:** Allows IIS to modify request URLs. Download and install it from [here](https://www.iis.net/downloads/microsoft/url-rewrite).
- **Application Request Routing (ARR):** Enables request forwarding. Download and install it from [here](https://www.iis.net/downloads/microsoft/application-request-routing). After installation, open IIS Manager, click your server name, find "Application Request Routing Cache," open it, and under "Actions" on the right, click **Server Proxy Settings...** and check **Enable proxy**.

#### 1.2.4. PM2 (Process Manager)
PM2 is a production process manager for Node.js applications. It will keep your application running continuously and restart it if it crashes.
- **Installation:** Open PowerShell or Command Prompt and install it globally:
  ```powershell
  npm install pm2 -g
  ```

## 2. Deployment Steps

Follow these steps to deploy the application on your server.

### Step 2.1: Prepare the Application
1. **Copy Files:** Transfer the entire `Cheezious_kiosk` application folder to a directory on your server (e.g., `C:\inetpub\wwwroot\cheezious-connect`).
2. **Install Dependencies:** Navigate to the application directory in PowerShell or Command Prompt and run:
   ```powershell
   npm install
   ```
3. **Build the Application:** Run the production build command. This compiles the application into an optimized set of files.
   ```powershell
   npm run build
   ```

### Step 2.2: Run the Application with PM2
1. **Start the App:** In the application directory, start the Next.js application using PM2. This command will start the app, name it `cheezious-connect`, and listen on port `9002`.
   ```powershell
   pm2 start npm --name "cheezious-connect" -- start -p 9002
   ```
2. **Verify App is Running:** Check the status of your app:
   ```powershell
   pm2 list
   ```
   You should see `cheezious-connect` with a status of `online`.

3. **Enable Startup on Reboot:** To ensure the app restarts automatically if the server reboots, run:
   ```powershell
   pm2 startup
   pm2 save
   ```
   This will generate a command you need to run to register PM2 as a startup service.

### Step 2.3: Configure IIS as a Reverse Proxy
1. **Create a New Website:**
   - Open IIS Manager.
   - In the "Connections" pane, right-click on "Sites" and select "Add Website".
   - **Site name:** `Cheezious Connect`
   - **Physical path:** Point this to your application folder (e.g., `C:\inetpub\wwwroot\cheezious-connect`).
   - **Binding:** Set the hostname (e.g., `cheezious.yourdomain.com`) and choose port `80` (or `443` if you have an SSL certificate configured).
   - Click "OK".

2. **Create the Rewrite Rule:**
   - Select your newly created site in IIS Manager.
   - In the main panel, double-click **URL Rewrite**.
   - In the "Actions" pane on the right, click **Add Rule(s)...** and select **Reverse Proxy**. Click "OK". (If you get a warning about enabling the proxy, click "OK".)
   - In the "Inbound Rules" server field, enter the address where your Next.js app is running: `localhost:9002`.
   - Click "OK".

Your `web.config` file in the application's root directory should now contain a rule similar to this:
```xml
<configuration>
    <system.webServer>
        <rewrite>
            <rules>
                <rule name="ReverseProxyInboundRule1" stopProcessing="true">
                    <match url="(.*)" />
                    <action type="Rewrite" url="http://localhost:9002/{R:1}" />
                </rule>
            </rules>
        </rewrite>
    </system.webServer>
</configuration>
```

## 3. Application Operation

The Cheezious Connect application is now running as a standalone system.
- **Order Management:** All orders placed through the kiosk are stored locally in the browser's session storage. Order data is managed within the application and can be viewed in the Admin and Cashier dashboards.
- **Data Persistence:** Order data persists for the duration of a browser session. Closing the browser or clearing session data will remove the order history.
- **External Sync:** The integration with external systems like Microsoft Dynamics 365 has been disabled. The `syncOrderToExternalSystem` function in `src/ai/flows/sync-order-flow.ts` is configured to process orders internally and will not make external API calls.

## 4. Final Verification

- Open a web browser on the server or a client machine and navigate to the hostname you configured in IIS (e.g., `http://cheezious.yourdomain.com`).
- The Cheezious Connect homepage should load.
- Place a test order and verify that it appears correctly in the Admin or Cashier dashboard within the application.
- You can monitor the application logs using PM2:
  ```powershell
  pm2 logs cheezious-connect
  ```

Your deployment is now complete. The application will run as a service on your Windows Server, proxied through IIS, and manage orders as a self-contained system.
