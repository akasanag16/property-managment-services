const RentPayment = require('../models/RentPayment');
const User = require('../models/User');
const Apartment = require('../models/Apartment');
const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Function to send email reminder
const sendEmailReminder = async (tenant, apartment, payment) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: tenant.email,
    subject: 'Rent Payment Reminder',
    html: `
      <h2>Rent Payment Reminder</h2>
      <p>Dear ${tenant.name},</p>
      <p>This is a reminder that your rent payment for apartment ${apartment.apartmentId} is due on ${payment.dueDate.toLocaleDateString()}.</p>
      <p>Amount due: $${payment.amount}</p>
      <p>Please make the payment before the due date to avoid any late fees.</p>
      <p>Thank you,</p>
      <p>Property Management Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Reminder email sent to ${tenant.email}`);
  } catch (error) {
    console.error('Error sending reminder email:', error);
  }
};

// Function to check and update payment status
const checkPaymentStatus = async () => {
  try {
    const now = new Date();
    
    // Find pending payments that are due today or overdue
    const payments = await RentPayment.find({
      status: 'pending',
      dueDate: { $lte: now }
    }).populate('tenant').populate('apartment');

    for (const payment of payments) {
      // Update status to overdue if payment is past due
      if (payment.dueDate < now) {
        payment.status = 'overdue';
        await payment.save();

        // Send overdue reminder if not already sent
        const hasOverdueReminder = payment.reminders.some(r => r.type === 'overdue');
        if (!hasOverdueReminder) {
          await sendEmailReminder(payment.tenant, payment.apartment, payment);
          payment.reminders.push({ type: 'overdue' });
          await payment.save();
        }
      }
    }
  } catch (error) {
    console.error('Error checking payment status:', error);
  }
};

// Function to send upcoming payment reminders
const sendUpcomingReminders = async () => {
  try {
    const now = new Date();
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(now.getDate() + 3);

    // Find pending payments due in the next 3 days
    const payments = await RentPayment.find({
      status: 'pending',
      dueDate: { $gt: now, $lte: threeDaysFromNow }
    }).populate('tenant').populate('apartment');

    for (const payment of payments) {
      // Send initial reminder if not already sent
      const hasInitialReminder = payment.reminders.some(r => r.type === 'initial');
      if (!hasInitialReminder) {
        await sendEmailReminder(payment.tenant, payment.apartment, payment);
        payment.reminders.push({ type: 'initial' });
        await payment.save();
      }
    }
  } catch (error) {
    console.error('Error sending upcoming reminders:', error);
  }
};

// Schedule the tasks
const scheduleTasks = () => {
  console.log('Rent scheduler initialized');
  // TODO: Implement actual rent scheduling logic
};

module.exports = { scheduleTasks }; 