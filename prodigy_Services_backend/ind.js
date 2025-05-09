const http = require("http");
const nodemailer = require("nodemailer");

const server = http.createServer((request, response) => {
    const auth = nodemailer.createTransport({
        service: "gmail",
        secure: true,
        port: 465,
        auth: {
            user: "adityajaiswal7823@gmail.com", // Replace with your Gmail
            pass: "xrzq stzs sfyn rsqk" // Replace with your App Password
        }
    });

    const receiver = {
        from: "adityajaiswal7823@gmail.com",
        to: "giramgayatri@gmail.com",
        subject: "hiii  chimda  ",
        text: " good luck for your exam preparation "
    };

    auth.sendMail(receiver, (error, emailResponse) => {
        if (error) {
            console.error("Error sending email:", error);
            response.writeHead(500, { "Content-Type": "text/plain" });
            response.end("Failed to send email.");
            return;
        }
        console.log("Email sent successfully!");
        response.writeHead(200, { "Content-Type": "text/plain" });
        response.end("Email sent successfully!");
    });
});

server.listen(8080, () => {
    console.log("Server running on http://localhost:8080");
});
