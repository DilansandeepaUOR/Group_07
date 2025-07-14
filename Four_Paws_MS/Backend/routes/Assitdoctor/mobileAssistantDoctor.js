const express = require('express');
const router = express.Router();
const db = require('../../db');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Middleware
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Request logging middleware
router.use((req, res, next) => {
  console.log(`Mobile Service API - ${req.method} ${req.originalUrl}`);
  next();
});

const sendMobileServiceEmail = async (serviceData, status, date, time, notes) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    if (!transporter) {
      throw new Error("Email service not available");
    }

    // Format date
    const formattedDate = date
      ? new Date(date).toDateString() // e.g., 'Sun Jul 13 2025'
      : 'Not specified';

    // Format time to '03:49 PM'
    const formattedTime = time
      ? new Date(`1970-01-01T${time}Z`).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: 'Asia/Colombo',
        })
      : 'Not specified';

    // Status message & subject setup
    let statusMessage = '';
    let subject = '';

    switch (status?.toLowerCase()) {
      case 'confirmed':
        statusMessage = 'Your mobile service appointment has been <span style="color: #28a745; font-weight: bold;">CONFIRMED</span>.';
        subject = 'Mobile Service Appointment Confirmed - Four Paws Clinic';
        break;
      case 'completed':
        statusMessage = 'Your mobile service appointment has been <span style="color: #17a2b8; font-weight: bold;">COMPLETED</span>.';
        subject = 'Mobile Service Appointment Completed - Four Paws Clinic';
        break;
      case 'cancelled':
        statusMessage = 'Your mobile service appointment has been <span style="color: #dc3545; font-weight: bold;">CANCELLED</span>.';
        subject = 'Mobile Service Appointment Cancelled - Four Paws Clinic';
        break;
      default:
        statusMessage = 'Your mobile service appointment status has been <span style="color: #6c757d; font-weight: bold;">UPDATED</span>.';
        subject = 'Mobile Service Appointment Update - Four Paws Clinic';
    }

    // Styled HTML content for the email
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; min-width: 600px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0;">
        <!-- Header -->
        <div style="background-color: #028478; color: #fff; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Four Paws Clinic</h1>
          <p style="margin: 5px 0 0; font-size: 14px;">Mobile Veterinary Service</p>
        </div>

        <!-- Body -->
        <div style="background-color: #fff; padding: 25px;">
          <h2 style="color: #028478; font-size: 20px; margin-top: 0;">Appointment Update</h2>

          <!-- Status Message -->
          <div style="background-color: #e6f4f1; padding: 15px 20px; border-radius: 6px; border-left: 5px solid #028478; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 16px; font-weight: 600;">${statusMessage}</p>
          </div>

          <!-- Pet Info -->
          <div style="margin-bottom: 20px;">
            <h3 style="color: #028478; font-size: 16px; margin-bottom: 10px;">Pet Information</h3>
            <p style="margin: 0;"><strong>Pet Name:</strong> ${serviceData.Pet_name || 'Not specified'}</p>
          </div>

          <!-- Location Info -->
          <div style="margin-bottom: 20px;">
            <h3 style="color: #028478; font-size: 16px; margin-bottom: 10px;">Location</h3>
            <p style="margin: 0;">${serviceData.address || 'Not specified'}</p>
          </div>

          <!-- Date & Time -->
          <div style="margin-bottom: 20px;">
            <h3 style="color: #028478; font-size: 16px; margin-bottom: 10px;">Date & Time</h3>
            <p style="margin: 0;"><strong>Date:</strong> ${formattedDate}</p>
            <p style="margin: 0;"><strong>Time:</strong> ${formattedTime}</p>
          </div>

          <!-- Notes -->
          ${notes ? `
            <div style="margin-bottom: 20px;">
              <h3 style="color: #028478; font-size: 16px; margin-bottom: 10px;">Notes</h3>
              <p style="margin: 0; background-color: #f1f5f9; padding: 12px 15px; border-left: 4px solid #028478; border-radius: 4px;">
                ${notes}
              </p>
            </div>
          ` : ''}

          <!-- Footer Info -->
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 13px; color: #6c757d; text-align: center;">
            <p style="margin: 0;">Service ID: ${serviceData.id}</p>
            <p style="margin: 5px 0 0;">Contact: ${process.env.EMAIL_USER}</p>
          </div>
        </div>
      </div>
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: serviceData.E_mail,
      subject,
      html: htmlContent,
    });

    console.log(`Mobile service confirmation email sent to ${serviceData.E_mail}`);
    return true;

  } catch (error) {
    console.error('Error sending mobile service email:', error);
    throw error;
  }
};

// Get today's mobile service requests
router.get('/today', async (req, res) => {
  try {
    const [services] = await db.promise().query(`
      SELECT 
        ms.*, 
        p.Pet_name,
        p.Pet_Breed,
        p.Pet_gender,
        po.Owner_name,
        po.Owner_address,
        po.Phone_number,
        po.E_mail
      FROM mobile_service ms
      LEFT JOIN pet p ON ms.pet_id = p.Pet_id
      LEFT JOIN pet_owner po ON ms.petOwnerID = po.Owner_id
      WHERE DATE(ms.created_at) = CURDATE()
      ORDER BY ms.created_at ASC
    `);

    res.json({
      success: true,
      services
    });
  } catch (err) {
    console.error('Mobile Service API - Database error:', err);
    res.status(500).json({
      success: false,
      error: 'Error retrieving today\'s mobile service requests'
    });
  }
});

// Get upcoming mobile service requests (after today)
router.get('/upcoming', async (req, res) => {
  try {
    const [services] = await db.promise().query(`
      SELECT 
        ms.*, 
        p.Pet_name,
        p.Pet_Breed,
        p.Pet_gender,
        po.Owner_name,
        po.Phone_number,
        po.E_mail
      FROM mobile_service ms
      LEFT JOIN pet p ON ms.pet_id = p.Pet_id
      LEFT JOIN pet_owner po ON ms.petOwnerID = po.Owner_id
      WHERE DATE(ms.created_at)
      ORDER BY ms.created_at ASC
      LIMIT 50
    `);

    res.json({
      success: true,
      services
    });
  } catch (err) {
    console.error('Mobile Service API - Database error:', err);
    res.status(500).json({
      success: false,
      error: 'Error retrieving upcoming mobile services'
    });
  }
});

// Update mobile service status
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { status, special_notes } = req.body;

  try {
    await db.promise().query(
      'UPDATE mobile_service SET status = ?, special_notes = ? WHERE id = ?',
      [status, special_notes, id]
    );

    // Fetch the updated service details to send email
    try {
      const [services] = await db.promise().query(`
        SELECT 
          ms.*, 
          p.Pet_name,
          p.Pet_Breed,
          p.Pet_gender,
          po.Owner_name,
          po.Phone_number,
          po.E_mail,
          po.Owner_address as address
        FROM mobile_service ms
        LEFT JOIN pet p ON ms.pet_id = p.Pet_id
        LEFT JOIN pet_owner po ON ms.petOwnerID = po.Owner_id
        WHERE ms.id = ?
      `, [id]);

      if (services.length > 0 && services[0].E_mail) {
        // Send confirmation email
        await sendMobileServiceEmail(
          services[0],
          status,
          services[0].date,
          services[0].time,
          special_notes
        );
      }
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Don't fail the request if email fails, just log it
    }

    res.json({
      success: true,
      message: 'Mobile service updated successfully. Confirmation email sent.'
    });
  } catch (error) {
    console.error('Mobile Service API - Update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update mobile service',
      details: error.message
    });
  }
});

router.get('/all', async (req, res) => {
  console.log("Fetching all mobile services");
  try {
    const [services] = await db.promise().query(`
      SELECT 
        ms.*, 
        p.Pet_name,
        p.Pet_Breed,
        p.Pet_gender,
        po.Owner_name,
        po.Phone_number,
        po.E_mail,
        po.Owner_address as address
      FROM mobile_service ms
      LEFT JOIN pet p ON ms.pet_id = p.Pet_id
      LEFT JOIN pet_owner po ON ms.petOwnerID = po.Owner_id
    `);

    res.json({
      success: true,
      services
    });
  } catch (err) {
    console.error('Mobile Service API - Database error:', err); 
    res.status(500).json({
      success: false,
      error: 'Error retrieving all mobile services',
      details: err.message
    });
  }
});

// Get single mobile service details
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [services] = await db.promise().query(`
  SELECT 
    ms.*, 
    p.Pet_name,
    p.Pet_Breed,
    p.Pet_gender,
    CASE
      WHEN TIMESTAMPDIFF(YEAR, p.Pet_dob, CURDATE()) >= 1 THEN 
        CONCAT(
          TIMESTAMPDIFF(YEAR, p.Pet_dob, CURDATE()), ' years ',
          MOD(TIMESTAMPDIFF(MONTH, p.Pet_dob, CURDATE()), 12), ' months'
        )
      WHEN TIMESTAMPDIFF(MONTH, p.Pet_dob, CURDATE()) >= 1 THEN 
        CONCAT(TIMESTAMPDIFF(MONTH, p.Pet_dob, CURDATE()), ' months')
      ELSE 
        CONCAT(DATEDIFF(CURDATE(), p.Pet_dob), ' days')
    END AS Age,
    po.Owner_name,
    po.Phone_number,
    po.E_mail,
    po.Owner_address AS address
  FROM mobile_service ms
  LEFT JOIN pet p ON ms.pet_id = p.Pet_id
  LEFT JOIN pet_owner po ON ms.petOwnerID = po.Owner_id
  WHERE ms.id = ?
`, [id]);


    if (services.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Mobile service not found'
      });
    }

    res.json({
      success: true,
      service: services[0]
    });
  } catch (error) {
    console.error('Mobile Service API - Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Error retrieving mobile service details',
      details: error.message
    });
  }
});




router.put('/appointment/:id', async (req, res) => {
  const { status, special_notes, date, time } = req.body;

  try {
    const { id } = req.params;

    // Build the update query and values array dynamically
    let updateFields = [];
    let values = [];

    if (status !== undefined) {
      updateFields.push('status = ?');
      values.push(status);
    }
    if (special_notes !== undefined) {
      updateFields.push('special_notes = ?');
      values.push(special_notes);
    }
    if (date !== undefined) {
      updateFields.push('date = ?');
      values.push(date);
    }
    if (time !== undefined) {
      updateFields.push('time = ?');
      values.push(time);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    values.push(id); // Add the ID to the end

    const updateQuery = `
      UPDATE mobile_service
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;

    const [result] = await db.promise().query(updateQuery, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Mobile service not found'
      });
    }

    // Fetch the updated service details to send email
    try {
      const [services] = await db.promise().query(`
        SELECT 
          ms.*, 
          p.Pet_name,
          p.Pet_Breed,
          p.Pet_gender,
          po.Owner_name,
          po.Phone_number,
          po.E_mail,
          po.Owner_address as address
        FROM mobile_service ms
        LEFT JOIN pet p ON ms.pet_id = p.Pet_id
        LEFT JOIN pet_owner po ON ms.petOwnerID = po.Owner_id
        WHERE ms.id = ?
      `, [id]);

      if (services.length > 0 && services[0].E_mail) {
        // Send confirmation email
        await sendMobileServiceEmail(
          services[0],
          status,
          date,
          time,
          special_notes
        );
      }
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Don't fail the request if email fails, just log it
    }

    res.json({
      success: true,
      message: 'Mobile service updated successfully. Confirmation email sent.'
    });

  } catch (error) {
    console.error('Error updating mobile service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update mobile service',
      details: error.message
    });
  }
});






module.exports = router;
