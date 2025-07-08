import express from "express";
import nodemailer from "nodemailer";
import multer from "multer";
import { parse } from "csv-parse";
import fs from "fs";
import twilio from "twilio";
import puppeteer from "puppeteer";
import { MessageAttempt } from "../db.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

let browser = null;
let page = null;

async function initBrowser() {
  if (!browser) {
   browser = await puppeteer.launch({
  headless: false,
  args: [
    "--no-sandbox", 
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-accelerated-2d-canvas",
    "--disable-gpu",
    "--window-size=1280,720"
  ],
  defaultViewport: null
});
    page = await browser.newPage();
    await page.goto("https://web.whatsapp.com");
    console.log("WhatsApp Web ready!");
  }
}

async function sendWhatsappMessage(number, message) {
  try {
    await page.goto(
      `https://web.whatsapp.com/send?phone=${number}&text=${encodeURIComponent(
        message
      )}`
    );

    // Increase timeout to 45 seconds for the page to fully load
    await page.waitForSelector('button[aria-label="Send"]', { timeout: 45000 });

    // Try multiple methods to send the message
    try {
      // Method 1: Direct click
      const sendButton = await page.$('button[aria-label="Send"]');
      if (sendButton) {
        await sendButton.click();

        // Method 2: Force click if normal click fails
        await page.evaluate(() => {
          const button = document.querySelector('button[aria-label="Send"]');
          if (button) button.click();
        });

        // Method 3: Try using keyboard Enter key as fallback
        await page.keyboard.press("Enter");

        // Increase delay after sending to ensure it completes
        await new Promise((resolve) => setTimeout(resolve, 3000));
        return true;
      }
    } catch (clickError) {
      // Try keyboard method as last resort
      try {
        await page.keyboard.press("Enter");
        await new Promise((resolve) => setTimeout(resolve, 3000));
        return true;
      } catch (keyboardError) {
        console.error("All send methods failed:", keyboardError);
        return false;
      }
    }

    return false;
  } catch (error) {
    console.error("Error in sendWhatsappMessage:", error);
    return false;
  }
}

// Helper function to process CSV file
// Modified processCSV function to handle both buffer and file path
const processCSV = (file) => {
  return new Promise((resolve, reject) => {
    const records = [];
    const parser = parse({ columns: true, skip_empty_lines: true });

    parser.on("readable", () => {
      let record;
      while ((record = parser.read()) !== null) {
        records.push(record);
      }
    });

    parser.on("error", (err) => reject(err));
    parser.on("end", () => resolve(records));

    // Handle both buffer and file path cases
    if (file.buffer) {
      // If file is in memory
      parser.write(file.buffer.toString());
      parser.end();
    } else {
      // If file is saved to disk
      fs.createReadStream(file.path)
        .pipe(parser)
        .on('error', (err) => reject(err));
    }
  });
};

// In your backend router
router.post("/init-whatsapp", async (req, res) => {
  try {
    await initBrowser();
    
    // Return immediately with a status that QR code is ready
    res.json({ 
      success: true, 
      status: "AWAITING_AUTH",
      message: "Please authorize WhatsApp Web to continue"
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Add a check authorization status endpoint
router.get("/check-whatsapp-auth", async (req, res) => {
  try {
    if (!browser || !page) {
      return res.json({ 
        success: false, 
        status: "NOT_INITIALIZED" 
      });
    }

    // Check if WhatsApp Web is authenticated
    const isAuthenticated = await page.evaluate(() => {
      // Look for elements that indicate we're logged in
      return !document.querySelector('[data-testid="qrcode"]');
    });

    res.json({ 
      success: true, 
      status: isAuthenticated ? "AUTHORIZED" : "AWAITING_AUTH"
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});


// Endpoint for sending bulk WhatsApp messages
router.post("/send-bulk-whatsapp", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) throw new Error("No file uploaded");

    // Extract useSameMessage and common message from the request body
    const { useSameMessage, message: commonMessage } = req.body;

    // Parse the CSV file
    const records = await processCSV(req.file);
    const results = [];
    const errors = [];

    // Initialize the browser if not already initialized
    if (!browser || !page) await initBrowser();

    // Iterate through each record in the CSV
    for (const record of records) {
      try {
        // Determine the message to send
        const msg = useSameMessage === "true" ? commonMessage : record.message;

        // Send the WhatsApp message
        const success = await sendWhatsappMessage(record.phoneNumber, msg);

        // Record the result
        if (success) {
          results.push({ phoneNumber: record.phoneNumber, status: "success" });
        } else {
          errors.push({
            phoneNumber: record.phoneNumber,
            error: "Failed to send",
          });
        }
      } catch (error) {
        // Handle errors for individual messages
        errors.push({
          phoneNumber: record.phoneNumber,
          error: error.message || "Failed to send",
        });
      }
    }

    // Save the message attempt to the database
    const messageAttempt = new MessageAttempt({
      userId: req.body.userId || req.user?._id,
      messageType: "whatsapp",
      totalAttempts: records.length,
      successCount: results.length,
      failureCount: errors.length,
    });

    await messageAttempt.save();

    // Return the results
    res.json({
      success: true,
      results,
      errors,
      totalProcessed: records.length,
      successCount: results.length,
      errorCount: errors.length,
    });
  } catch (error) {
    // Handle any unexpected errors
    res.status(400).json({ success: false, error: error.message });
  }
});



router.post("/send-bulk-sms", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) throw new Error("No file uploaded");

    // Extract useSameMessage and common message from the request body
    const { useSameMessage, message: commonMessage } = req.body;

    // Parse the CSV file
    const records = await processCSV(req.file);
    const results = [];
    const errors = [];
    const userId = req.body.userId || req.user?._id;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, error: "User not authenticated" });
    }

    // Iterate through each record in the CSV
    for (const record of records) {
      try {
        // Determine the message to send
        const msg = useSameMessage === "true" ? commonMessage : record.message;

        // Validate the message
        if (!msg || typeof msg !== "string") {
          throw new Error("Message is missing or invalid");
        }

        // Send the SMS
        const result = await client.messages.create({
          body: msg,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: record.phoneNumber,
        });

        // Record the result
        results.push({ phoneNumber: record.phoneNumber, status: "success" });
      } catch (error) {
        // Handle errors for individual messages
        errors.push({ phoneNumber: record.phoneNumber, error: error.message });
      }
    }

    // Save the message attempt to the database
    const messageAttempt = new MessageAttempt({
      userId: userId,
      messageType: "sms",
      totalAttempts: records.length,
      successCount: results.length,
      failureCount: errors.length,
    });

    await messageAttempt.save();

    // Return the results
    res.json({
      success: true,
      results,
      errors,
      totalProcessed: records.length,
      successCount: results.length,
      errorCount: errors.length,
    });
  } catch (error) {
    // Handle any unexpected errors
    res.status(400).json({ success: false, error: error.message });
  }
});




// Endpoint for sending bulk emails
router.post("/send-bulk-email", upload.single("file"), async (req, res) => {
  try {
    const { senderEmail, senderPassword, useSameMessage, message } = req.body; // New fields
    if (!req.file) throw new Error("No CSV file uploaded");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: senderEmail, pass: senderPassword },
    });

    const records = await processCSV(req.file);
    const results = [];
    const failures = [];
    const userId = req.body.userId || req.user?._id;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, error: "User not authenticated" });
    }

    for (const record of records) {
      try {
        const msg = useSameMessage ? message : record.message; // Use the same message if specified
        const info = await transporter.sendMail({
          from: senderEmail,
          to: record.email,
          subject: record.subject || "Bulk Email",
          text: msg,
        });
        results.push({ email: record.email, status: "success" });
      } catch (error) {
        failures.push({ email: record.email, error: error.message });
      }
    }

    fs.unlinkSync(req.file.path); // Clean up uploaded file

    const messageAttempt = new MessageAttempt({
      userId: userId,
      messageType: "email",
      totalAttempts: records.length,
      successCount: results.length,
      failureCount: failures.length,
    });

    await messageAttempt.save();

    res.json({ success: true, sent: results, failed: failures });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path); // Clean up uploaded file in case of error
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
