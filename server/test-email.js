import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'QQ',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const mailOptions = {
  from: `"AI日历" <${process.env.EMAIL_USER}>`,
  to: 'zyx555zyx@qq.com',
  subject: '📅 测试邮件 - AI日历提醒',
  text: '这是一封测试邮件，验证邮件发送功能是否正常工作。',
  html: `
    <div style="font-family: 'Microsoft YaHei', sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #fff8e7 0%, #ffe4c4 100%); border-radius: 16px; border: 3px solid #d4a574;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 48px;">📅</span>
      </div>
      <h2 style="color: #8b6914; margin: 0 0 15px; font-size: 20px;">测试邮件</h2>
      <div style="background: white; padding: 15px; border-radius: 8px; border: 2px dashed #d4a574;">
        <p style="margin: 8px 0;">这是一封测试邮件，验证邮件发送功能是否正常工作。</p>
        <p style="margin: 8px 0; color: #8b7355;">如果您收到这封邮件，说明邮件服务配置成功！</p>
      </div>
    </div>
  `
};

console.log('开始发送测试邮件...');
console.log('发件人:', process.env.EMAIL_USER);
console.log('收件人:', 'zyx555zyx@qq.com');

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('邮件发送失败:', error);
    console.error('错误详情:', error.message);
  } else {
    console.log('邮件发送成功!');
    console.log('消息ID:', info.messageId);
    console.log('响应:', info.response);
  }
});