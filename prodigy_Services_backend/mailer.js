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
            from: '"Prodigy Services Team" <adityajaiswal7823@gmail.com>', // Sender name and email
            to: toEmail, // Recipient email
            subject: "Welcome to Prodigy Services!", // Updated subject
            html: `
                <h1>Welcome to Prodigy Services, ${userName}!</h1>
                <p>We're excited to have you on board with Prodigy Services. Start exploring our premium services and take your experience to the next level!</p>
                <p>Our services include:</p>
                <ul>
                    <li><strong>Custom Solutions:</strong> Tailored services designed for your needs.</li>
                    <li><strong>24/7 Support:</strong> Our dedicated team is always here to help.</li>
                    <li><strong>Exclusive Offers:</strong> Enjoy special deals and discounts on our services.</li>
                </ul>
                <br>
                <p>Best regards,<br>The Prodigy Services Team</p>
            `,
        };

        await transporter.sendMail(mailOptions); // Send the email
        console.log(`Welcome email sent to ${toEmail}`);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};


module.exports = sendWelcomeEmail;
