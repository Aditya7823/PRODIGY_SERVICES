const nodemailer = require("nodemailer");

// Configure the transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "adityajaiswal7823@gmail.com", // Your Gmail address
        pass: "xrzq stzs sfyn rsqk",   // Your Gmail App Password
    },
});

// Function to send the welcome email
const sendWelcomeEmail = async (toEmail, userName) => {
    try {
        const mailOptions = {
            from: '"BlogifyX Team" <adityajaiswal7823@gmail.com>', // Sender name and email
            to: toEmail, // Recipient email
            subject: "Welcome to BlogifyX!", // Email subject
            html: `
                <h1>Welcome to BlogifyX, ${userName}!</h1>
                <p>We're thrilled to have you join our platform. Start sharing your stories and connecting with the community today!</p>
                <p>Visit our website to get started: <a href="http://localhost:3000">BlogifyX</a></p>
                <br>
                <p>Best regards,<br>The BlogifyX Team</p>
            `,
        };

        await transporter.sendMail(mailOptions); // Send the email
        console.log(`Welcome email sent to ${toEmail}`);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

module.exports = sendWelcomeEmail;
