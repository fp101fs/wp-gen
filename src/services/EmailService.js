import { Resend } from 'resend';
import { debugLog, debugError } from '../utils/debugUtils';

class EmailService {
  constructor() {
    this.resend = new Resend(process.env.REACT_APP_RESEND_API_KEY);
  }

  async sendWelcomeEmail(userEmail, userName = '') {
    try {
      const firstName = userName ? userName.split(' ')[0] : '';
      const greeting = firstName ? `Hi ${firstName}` : 'Hi there';
      
      const { data, error } = await this.resend.emails.send({
        from: 'PlugPress <onboarding@plugpress.org>',
        to: [userEmail],
        subject: 'Welcome to PlugPress - Start Building WordPress Plugins with AI!',
        html: this.getWelcomeEmailTemplate(greeting, userEmail)
      });

      if (error) {
        debugError('Welcome email send failed:', error);
        return { success: false, error: error.message };
      }

      debugLog('Welcome email sent successfully:', data.id);
      return { success: true, emailId: data.id };
      
    } catch (error) {
      debugError('EmailService.sendWelcomeEmail error:', error);
      return { success: false, error: error.message };
    }
  }

  getWelcomeEmailTemplate(greeting, userEmail) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to PlugPress</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: bold; color: #8B5CF6; margin-bottom: 10px; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 8px; margin-bottom: 20px; }
          .cta-button { display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .steps { margin: 20px 0; }
          .step { margin: 15px 0; padding: 15px; background: white; border-left: 4px solid #8B5CF6; border-radius: 4px; }
          .footer { text-align: center; font-size: 14px; color: #666; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">PlugPress</div>
            <p>AI-Powered WordPress Plugin Builder</p>
          </div>

          <div class="content">
            <h2>${greeting}! 🎉</h2>
            <p>Welcome to PlugPress! You've just joined thousands of developers who are building WordPress plugins faster than ever with AI.</p>

            <div class="steps">
              <div class="step">
                <strong>🚀 Step 1:</strong> Describe your plugin idea in plain English
              </div>
              <div class="step">
                <strong>⚡ Step 2:</strong> Watch AI generate your complete plugin code
              </div>
              <div class="step">
                <strong>📦 Step 3:</strong> Download and install to WordPress in seconds
              </div>
            </div>

            <p>Ready to build your first plugin?</p>
            <a href="https://plugpress.org" class="cta-button">Start Building Now</a>
          </div>

          <div class="footer">
            <p>Questions? Reply to this email or visit our <a href="https://plugpress.org/learn">Help Center</a></p>
            <p>PlugPress - Making WordPress plugin development accessible to everyone</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();
export default emailService;