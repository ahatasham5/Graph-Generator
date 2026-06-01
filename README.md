# GraphForge - Multi-Line Graph Generator

GraphForge is a web-based application for generating beautiful, dynamic multi-line graphs by simply pasting X, Y coordinate data directly from your spreadsheets.

## 🚀 How to Run (One-Click)

To start the entire application with a single click:

1. Double-click the **`start-app.bat`** file in this directory.
2. The script will automatically:
   - Start the FastAPI backend server
   - Start the Frontend HTTP server
   - Open your default web browser to the application page (`http://localhost:3001`)

*Note: You will see two black command prompt windows open. Leave them open while you are using the app.*

### Manual Start (Alternative)
If you prefer to start the components manually:
1. Double-click `start-backend.bat` to launch the API.
2. Double-click `start-frontend.bat` to launch the web interface.
3. Open `http://localhost:3001` in your browser.

## 📋 How to Use

1. **Paste Data:** Copy your X and Y columns from Excel or Google Sheets and paste them directly into the text area. Tabular data (tab-separated) is automatically detected and parsed.
2. **Add Series:** Click "+ Add Series" to add additional data lines to your graph.
3. **Customize:** Click "Rename" or use the color picker on any tab to customize the look of each line.
4. **Generate:** Click "Generate Graph" to render your chart. 
5. **Download:** Export your chart using the PNG download button.

## Requirements
- Windows OS
- Python 3 installed and added to your System PATH
