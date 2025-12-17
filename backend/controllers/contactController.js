const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error('SMTP Connection Error:', error);
  } else {
    console.log('SMTP Server is ready to take our messages');
  }
});

// @desc    Send contact email
// @route   POST /api/contact
// @access  Public
const sendContactEmail = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name, email, and message',
    });
  }

  try {
    const mailOptions = {
      from: `"${name}" <${email}>`, // Sent from user's email (as label) via our authenticated sender
      to: process.env.SMTP_USER, // Send to Admin
      replyTo: email, // Allow reply to user
      subject: `Contact Us: ${subject || 'New Message'}`,
      text: `
        Name: ${name}
        Email: ${email}
        
        Message:
        ${message}
      `,
      html: `
        <h3>New Contact Message</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #6b3f2f;">
          <p>${message.replace(/\n/g, '<br>')}</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message,
    });
  }
};

module.exports = {
  sendContactEmail,
};
