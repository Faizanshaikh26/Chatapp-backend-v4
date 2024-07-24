const forgotPassword = async (req, res) => {
    if (!req.body.email) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }
  
    const { email } = req.body;
  
    try {
      // Find the user by email
      const user = await User.findOne({ email: email });
  
      // If user not found, return error
      if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
      }
  
      // Generate reset token
      const token = generateToken();
  
      // Set reset password token and expiration time
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
      await user.save();
  
      // Send reset password email
      const transporter = nodemailer.createTransport({
        host: "smtp-relay.brevo.com",
        port: 587,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.BREVO_API_KEY,
        },
      });
      var mailOptions = {
        from: "InstaChatPvt@gmail.com",
        to: user.email,
        subject: "Reset password",
        text:
          `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
          `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
          `${req.headers.origin}/reset-password/${token}\n\n` +
          `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
      };
  
      await transporter.sendMail(mailOptions);
      console.log("Email sent successfully");
      res.status(200).json({ success: true, message: "Email sent successfully" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ success: false, error: "Failed to send email" });
    }
  };
  const resetPassword = async (req, res) => {
    const resetToken = req.params.token;
    const { newPassword } = req.body;
  
    try {
      // Find user with the reset token
      const user = await User.findOne({ resetPasswordToken: resetToken }).select(
        "+password"
      );
  
      if (!user) {
        return res
          .status(404)
          .json({ success: false, error: "Invalid or expired token" });
      }
  
      // Check if the token has expired
      if (user.resetPasswordExpires < Date.now()) {
        return res
          .status(401)
          .json({ success: false, error: "Token has expired" });
      }
  
      // Ensure newPassword is provided
      if (!newPassword) {
        return res
          .status(400)
          .json({ success: false, error: "New password is required" });
      }
  
      // Check if the new password is the same as the previous one
      const isSamePassword = await compare(newPassword, user.password);
      if (isSamePassword) {
        return res.status(400).json({
          success: false,
          error: "New password cannot be the same as the previous one",
        });
      }
  
      // Hash the new password
      const hashedPassword = await hash(newPassword, 12);
  
      // Update user's password and clear reset token fields
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
  
      res
        .status(200)
        .json({ success: true, message: "Password reset successfully" });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ success: false, error: "Failed to reset password" });
    }
  };