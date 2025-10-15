/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// 初始化 Firebase Admin
admin.initializeApp();

// 直接在代码中配置邮件设置
const mailConfig = {
  email: 'your-development-email@gmail.com', // 替换为你的测试邮箱
  password: 'your-app-password' // 替换为应用专用密码
};

// 邮件传输器配置
function getMailTransport() {
  try {
    // 首先尝试从环境配置获取
    const envConfig = functions.config().gmail;
    
    if (envConfig && envConfig.email && envConfig.password) {
      const nodemailer = require('nodemailer');
      console.log('Using environment configuration for email');
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: envConfig.email,
          pass: envConfig.password,
        },
      });
    } else {
      // 使用硬编码配置
      console.log('Using hardcoded configuration for email');
      const nodemailer = require('nodemailer');
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: mailConfig.email,
          pass: mailConfig.password,
        },
      });
    }
  } catch (error) {
    console.warn('Email configuration failed, using mock mode:', error.message);
    // 返回模拟邮件传输器
    return {
      sendMail: (mailOptions) => {
        console.log('Mock email sent:', {
          to: mailOptions.to,
          subject: mailOptions.subject,
          html: mailOptions.html ? 'HTML content available' : 'No HTML'
        });
        return Promise.resolve({ messageId: 'mock-message-id-' + Date.now() });
      }
    };
  }
}

const mailTransport = getMailTransport();

/**
 * 独立的冲突检查逻辑
 */
async function checkAppointmentConflictInternal(nutritionistId, dateTime, duration = 60) {
  try {
    const appointmentTime = new Date(dateTime);
    const appointmentEnd = new Date(appointmentTime.getTime() + duration * 60000);

    // Query appointments for the same nutritionist in conflicting time slots
    const conflictsQuery = await admin.firestore()
      .collection('appointments')
      .where('nutritionistId', '==', nutritionistId)
      .where('status', 'in', ['confirmed', 'pending'])
      .get();

    const conflicts = [];

    conflictsQuery.forEach(doc => {
      const appointment = doc.data();
      const existingStart = appointment.dateTime.toDate();
      const existingEnd = new Date(existingStart.getTime() + (appointment.duration || 60) * 60000);

      // Check for time conflict
      if (appointmentTime < existingEnd && appointmentEnd > existingStart) {
        conflicts.push({
          id: doc.id,
          existingStart: existingStart,
          existingEnd: existingEnd,
          client: appointment.userId
        });
      }
    });

    return {
      hasConflict: conflicts.length > 0,
      conflicts: conflicts,
      suggestion: conflicts.length > 0 ? 'Please choose a different time' : 'Time slot available'
    };
  } catch (error) {
    console.error('Error in internal conflict check:', error);
    throw error;
  }
}

/**
 * 发送单个邮件的云函数
 */
exports.sendEmail = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Only authenticated users can send emails'
    );
  }

  const { to, subject, message } = data;

  // Validate input data
  if (!to || !subject || !message) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Recipient, subject and message are required'
    );
  }

  try {
    const fromEmail = mailConfig.email || 'noreply@nutritionedu.com';
    const mailOptions = {
      from: `"Nutrition Education" <${fromEmail}>`,
      to: to,
      subject: subject,
      html: message,
    };

    await mailTransport.sendMail(mailOptions);
    
    // Log the email sending
    await admin.firestore().collection('emailLogs').add({
      from: context.auth.uid,
      to: to,
      subject: subject,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'success'
    });

    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Failed to send email:', error);
    
    // Log failure
    await admin.firestore().collection('emailLogs').add({
      from: context.auth.uid,
      to: to,
      subject: subject,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'failed',
      error: error.message
    });

    throw new functions.https.HttpsError(
      'internal',
      'Failed to send email: ' + error.message
    );
  }
});

/**
 * 发送批量邮件的云函数
 */
exports.sendBulkEmail = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Only authenticated users can send bulk emails'
    );
  }

  const { users, subject, message, userGroup } = data;

  if (!users || !subject || !message) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Users list, subject and message are required'
    );
  }

  try {
    const results = {
      success: 0,
      failed: 0,
      details: []
    };

    const fromEmail = mailConfig.email || 'noreply@nutritionedu.com';

    // Send email to each user
    for (const user of users) {
      try {
        const mailOptions = {
          from: `"Nutrition Education" <${fromEmail}>`,
          to: user.email,
          subject: subject,
          html: message.replace('{{firstName}}', user.firstName || 'User'),
        };

        await mailTransport.sendMail(mailOptions);
        results.success++;
        results.details.push({
          email: user.email,
          status: 'success'
        });
        
        console.log(`Email sent successfully: ${user.email}`);
      } catch (error) {
        results.failed++;
        results.details.push({
          email: user.email,
          status: 'failed',
          error: error.message
        });
        
        console.error(`Failed to send email to ${user.email}:`, error.message);
      }
    }

    // Log bulk sending
    await admin.firestore().collection('bulkEmailLogs').add({
      sentBy: context.auth.uid,
      userGroup: userGroup,
      subject: subject,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      totalSent: users.length,
      success: results.success,
      failed: results.failed
    });

    return {
      success: true,
      message: `Bulk email completed. Success: ${results.success}, Failed: ${results.failed}`,
      details: results
    };
  } catch (error) {
    console.error('Bulk email sending failed:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Bulk email sending failed: ' + error.message
    );
  }
});

/**
 * 检查预约冲突的云函数
 */
exports.checkAppointmentConflict = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  const { nutritionistId, dateTime, duration = 60 } = data;

  if (!nutritionistId || !dateTime) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Nutritionist ID and date time are required'
    );
  }

  try {
    const result = await checkAppointmentConflictInternal(nutritionistId, dateTime, duration);
    return result;
  } catch (error) {
    console.error('Failed to check appointment conflict:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to check appointment conflict: ' + error.message
    );
  }
});

/**
 * 创建预约的云函数
 */
exports.createAppointment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  const { nutritionistId, type, dateTime, notes, duration = 60, serviceId, serviceTitle } = data;

  if (!nutritionistId || !type || !dateTime) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Nutritionist ID, appointment type and date time are required'
    );
  }

  try {
    // 冲突检查逻辑
    const conflictCheck = await checkAppointmentConflictInternal(nutritionistId, dateTime, duration);

    if (conflictCheck.hasConflict) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Selected time conflicts with existing appointments'
      );
    }

    // 创建预约数据对象
    const appointmentData = {
      userId: context.auth.uid,
      nutritionistId: nutritionistId,
      type: type,
      dateTime: admin.firestore.Timestamp.fromDate(new Date(dateTime)),
      duration: duration,
      notes: notes || '',
      status: 'confirmed',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // 如果有服务ID和标题，添加到预约数据中
    if (serviceId) {
      appointmentData.serviceId = serviceId;
    }
    if (serviceTitle) {
      appointmentData.serviceTitle = serviceTitle;
    }

    // Create the appointment
    const appointmentRef = await admin.firestore().collection('appointments').add(appointmentData);

    console.log(`Appointment created successfully: ${appointmentRef.id}, Service: ${serviceId} - ${serviceTitle}`);

    return {
      success: true,
      appointmentId: appointmentRef.id,
      message: 'Appointment created successfully'
    };
  } catch (error) {
    console.error('Failed to create appointment:', error);
    
    // 如果已经是 HttpsError，直接抛出
    if (error.code && error.message) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'Failed to create appointment: ' + error.message
    );
  }
});

/**
 * 更新营养师评分的云函数（在评分创建/更新时触发）
 */
exports.updateNutritionistRating = functions.firestore
  .document('ratings/{ratingId}')
  .onWrite(async (change, context) => {
    try {
      const ratingData = change.after.exists ? change.after.data() : null;
      
      // Skip if rating was deleted
      if (!ratingData) return null;

      const { itemId, rating } = ratingData;

      // Only process nutritionist ratings
      if (!itemId.startsWith('nutritionist-')) return null;

      const nutritionistId = itemId.replace('nutritionist-', '');

      // Get all ratings for this nutritionist
      const ratingsSnapshot = await admin.firestore()
        .collection('ratings')
        .where('itemId', '==', itemId)
        .get();

      let totalRating = 0;
      let ratingCount = 0;

      ratingsSnapshot.forEach(doc => {
        const data = doc.data();
        totalRating += data.rating;
        ratingCount++;
      });

      const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;

      // Update nutritionist document
      await admin.firestore()
        .collection('users')
        .doc(nutritionistId)
        .update({
          averageRating: averageRating,
          totalRatings: ratingCount,
          ratingUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

      console.log(`Updated nutritionist ${nutritionistId} rating: ${averageRating} (based on ${ratingCount} ratings)`);

      return null;
    } catch (error) {
      console.error('Failed to update nutritionist rating:', error);
      return null;
    }
  });

/**
 * 健康检查云函数
 */
exports.healthCheck = functions.https.onCall(async (data, context) => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  };
});

/**
 * 获取营养师列表的云函数
 */
exports.getNutritionists = functions.https.onCall(async (data, context) => {
  try {
    const { limit = 50, page = 1 } = data;
    
    const nutritionistsQuery = await admin.firestore()
      .collection('users')
      .where('role', '==', 'nutritionist')
      .where('isActive', '==', true)
      .limit(limit)
      .get();

    const nutritionists = [];
    
    nutritionistsQuery.forEach(doc => {
      const data = doc.data();
      nutritionists.push({
        uid: doc.id,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        specialty: data.specialty || '',
        qualifications: data.qualifications || '',
        bio: data.bio || '',
        experience: data.experience || 0,
        languages: data.languages || [],
        profileImage: data.profileImage || '',
        averageRating: data.averageRating || 0,
        totalRatings: data.totalRatings || 0
      });
    });

    return {
      success: true,
      nutritionists: nutritionists,
      total: nutritionists.length,
      page: page,
      limit: limit
    };
  } catch (error) {
    console.error('Failed to get nutritionists:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to get nutritionists: ' + error.message
    );
  }
});

// 导出所有函数
module.exports = exports;