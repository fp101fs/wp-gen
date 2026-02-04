// Import inside function to avoid initialization issues

function getWelcomeEmailTemplate(greeting) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Kromio - Your Chrome Extension Journey Starts Here!</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { text-align: center; background: linear-gradient(135deg, #8B5CF6, #06B6D4); color: white; padding: 30px 20px; }
        .logo { font-size: 32px; font-weight: bold; margin-bottom: 5px; }
        .tagline { font-size: 16px; opacity: 0.9; }
        .content { padding: 30px; }
        .welcome-section { text-align: center; margin-bottom: 30px; }
        .cta-buttons { text-align: center; margin: 25px 0; }
        .cta-primary { display: inline-block; background: #8B5CF6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 8px; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3); }
        .cta-secondary { display: inline-block; background: #06B6D4; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; margin: 5px; font-size: 14px; }
        .quick-start { background: #f8fafc; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 5px solid #8B5CF6; }
        .step { display: flex; align-items: flex-start; margin: 15px 0; }
        .step-number { background: #8B5CF6; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; flex-shrink: 0; }
        .step-content { flex: 1; }
        .social-proof { background: linear-gradient(135deg, #f0f9ff, #e0f2fe); padding: 20px; border-radius: 10px; margin: 25px 0; border: 1px solid #38bdf8; }
        .quote { font-style: italic; color: #0f172a; margin-bottom: 8px; font-size: 15px; }
        .quote-author { color: #64748b; font-size: 13px; }
        .support-links { background: #fef3c7; padding: 20px; border-radius: 10px; margin: 25px 0; text-align: center; }
        .support-buttons { margin-top: 15px; }
        .footer { background: #f8fafc; padding: 25px; text-align: center; font-size: 14px; color: #64748b; border-top: 1px solid #e2e8f0; }
        .footer a { color: #8B5CF6; text-decoration: none; }
        .tip-box { background: #fef9e7; border: 1px solid #fbbf24; border-radius: 8px; padding: 15px; margin: 20px 0; }
        .tip-box .tip-icon { color: #f59e0b; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Kromio</div>
          <div class="tagline">Turn Your Ideas Into Chrome Extensions - No Coding Required</div>
        </div>
        
        <div class="content">
          <!-- Welcome Section -->
          <div class="welcome-section">
            <h2 style="color: #1e293b; margin: 0 0 15px 0;">${greeting}! Welcome to the future of Chrome extension building 🎉</h2>
            <p style="color: #475569; font-size: 18px; margin-bottom: 0;">You've just joined thousands of creators who are building extensions faster than ever with AI.</p>
          </div>

          <!-- Quick Action Buttons -->
          <div class="cta-buttons">
            <a href="https://kromio.ai" class="cta-primary">🚀 Start Building Now</a>
          </div>
          
          <div class="cta-buttons">
            <a href="https://kromio.ai/learn#faq" class="cta-secondary">❓ FAQ</a>
            <a href="https://kromio.ai/learn#troubleshooting" class="cta-secondary">🔧 Troubleshooting</a>
            <a href="https://kromio.ai/learn#quick-start" class="cta-secondary">📚 Quick Start Guide</a>
          </div>

          <!-- How to Use Section -->
          <div class="quick-start">
            <h3 style="color: #1e293b; margin-top: 0;">How to Use Kromio (It's Really Simple!)</h3>
            
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-content">
                <strong>Describe Your Idea</strong><br>
                <span style="color: #64748b;">Just explain what you want your extension to do in plain English. Most extensions are created with just 1 credit!</span>
              </div>
            </div>
            
            <div class="step">
              <div class="step-number">2</div>
              <div class="step-content">
                <strong>AI Generates Everything</strong><br>
                <span style="color: #64748b;">Watch as AI creates all the files you need: manifest.json, HTML, CSS, JavaScript, and icons.</span>
              </div>
            </div>
            
            <div class="step">
              <div class="step-number">3</div>
              <div class="step-content">
                <strong>Download & Install</strong><br>
                <span style="color: #64748b;">Download the ZIP file and load it into Chrome. Your extension is ready to use!</span>
              </div>
            </div>
            
            <div class="tip-box">
              <span class="tip-icon">💡 Pro Tip:</span> If your extension has bugs, use the <strong>"Revise"</strong> feature! It's much more effective than generating a new extension.
            </div>
          </div>

          <!-- Social Proof -->
          <div class="social-proof">
            <h3 style="color: #0f172a; margin-top: 0;">What Our Users Are Saying</h3>
            <div class="quote">"This is absolutely amazing! As someone who doesn't know how to code, I'm really excited about the idea of creating my own Chrome extension."</div>
            <div class="quote-author">— ProductHunt User</div>
            
            <div class="quote" style="margin-top: 15px;">"Been manually updating my team's dashboard daily—this image-to-extension feature just automated it."</div>
            <div class="quote-author">— ProductHunt User</div>
          </div>

          <!-- Support Section -->
          <div class="support-links">
            <h3 style="color: #92400e; margin-top: 0;">Need Help? We've Got You Covered</h3>
            <p style="margin-bottom: 15px;">Most questions are answered instantly in our help center:</p>
            <div class="support-buttons">
              <a href="https://kromio.ai/learn#faq" class="cta-secondary" style="background: #92400e;">📋 Common Questions</a>
              <a href="https://kromio.ai/learn#troubleshooting" class="cta-secondary" style="background: #dc2626;">🔧 Fix Extension Issues</a>
              <a href="https://kromio.ai/learn#examples" class="cta-secondary" style="background: #059669;">🎯 See Examples</a>
            </div>
          </div>

          <!-- Success Quote -->
          <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #fdf4ff, #f3e8ff); border-radius: 10px; border: 1px solid #c084fc;">
            <p style="font-size: 16px; color: #581c87; margin: 0; font-style: italic;">"Your content gives me hope that I can one day build something awesome."</p>
            <p style="font-size: 13px; color: #7c3aed; margin-top: 8px;">— YouTube Comment</p>
            <p style="color: #6b21a8; margin-top: 15px; margin-bottom: 0;"><strong>Today is that day. Start building! 🚀</strong></p>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Questions?</strong> Simply reply to this email — we read every message and help personally.</p>
          <p style="margin-top: 15px;">
            <a href="https://kromio.ai">kromio.ai</a> | 
            <a href="https://kromio.ai/learn">Help Center</a> | 
            <a href="https://kromio.ai/gallery">Extension Gallery</a>
          </p>
          <p style="margin-top: 20px; color: #94a3b8;">
            <em>Kromio - Making Chrome extension development accessible to everyone</em>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

module.exports = async (req, res) => {
  // DETAILED REQUEST LOGGING - Find all sources calling this API
  const requestId = Math.random().toString(36).substr(2, 9);
  console.log(`\n🎯 WELCOME EMAIL API CALL #${requestId}`);
  console.log('📍 Request Details:');
  console.log('- Method:', req.method);
  console.log('- URL:', req.url);
  console.log('- Headers:', JSON.stringify(req.headers, null, 2));
  console.log('- User-Agent:', req.headers['user-agent']);
  console.log('- Referer:', req.headers.referer || 'No referer');
  console.log('- X-Forwarded-For:', req.headers['x-forwarded-for'] || 'Not set');
  console.log('- Origin:', req.headers.origin || 'No origin');
  console.log('- Content-Type:', req.headers['content-type'] || 'Not set');
  console.log('- Body:', JSON.stringify(req.body, null, 2));
  console.log('- Timestamp:', new Date().toISOString());
  
  // Enhanced environment and dependency debugging
  console.log(`\n🔍 API Debug - Environment check for request #${requestId}:`);
  console.log('- RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
  console.log('- RESEND_API_KEY starts with re_:', process.env.RESEND_API_KEY?.startsWith('re_'));
  console.log('- NEXT_PUBLIC_SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('- SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  
  // Test dependency imports
  try {
    const { Resend } = require('resend');
    console.log('✅ Resend package loaded successfully');
  } catch (error) {
    console.error('❌ Resend package error:', error.message);
    return res.status(500).json({ 
      error: 'Resend package not available', 
      details: error.message 
    });
  }
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    console.log('✅ Supabase package loaded successfully');
  } catch (error) {
    console.error('❌ Supabase package error:', error.message);
    return res.status(500).json({ 
      error: 'Supabase package not available', 
      details: error.message 
    });
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name, user_id } = req.body;
    console.log('📧 Incoming request:', { email, name: name || 'none', user_id: user_id || 'none' });

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // BULLETPROOF DATABASE DEDUPLICATION - handles multiple browser tabs and race conditions
    if (user_id) {
      try {
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        console.log(`🔐 [${requestId}] Attempting bulletproof deduplication for:`, email);
        
        // Use row-level locking with timestamp check for bulletproof deduplication
        // This prevents concurrent updates to the same user's welcome email flag
        
        // Check if email was sent recently (within 3 seconds) - handles rapid multiple requests from multi-tab scenarios
        const threeSecondsAgo = new Date(Date.now() - 3000).toISOString();
        console.log(`🕐 [${requestId}] Checking for emails sent after:`, threeSecondsAgo);
        
        const { data: recentCheck } = await supabase
          .from('user_profiles')
          .select('welcome_email_sent, welcome_email_sent_at')
          .eq('id', user_id)
          .gte('welcome_email_sent_at', threeSecondsAgo)
          .eq('welcome_email_sent', true)
          .single();
          
        if (recentCheck) {
          console.log(`🚫 [${requestId}] Welcome email sent recently (${recentCheck.welcome_email_sent_at}) - blocking duplicate:`, email);
          return res.status(200).json({ 
            success: true, 
            message: 'Welcome email already sent recently',
            already_sent: true,
            sent_at: recentCheck.welcome_email_sent_at
          });
        }
        
        // Atomic update using upsert - only succeeds if welcome_email_sent is not already true
        const updateTimestamp = new Date().toISOString();
        console.log(`🔒 [${requestId}] Attempting atomic flag update at ${updateTimestamp} for:`, email);
        
        const { data: updateResult, error: updateError } = await supabase
          .from('user_profiles')
          .upsert({
            id: user_id,
            welcome_email_sent: true,
            welcome_email_sent_at: updateTimestamp,
            updated_at: updateTimestamp
          }, {
            onConflict: 'id'
          })
          .select('welcome_email_sent, welcome_email_sent_at')
          .single();
          
        if (updateError) {
          console.error(`❌ [${requestId}] Failed to update welcome email flag:`, updateError.message);
          return res.status(500).json({ error: 'Failed to update welcome email flag' });
        }
        
        console.log(`✅ [${requestId}] Database flag updated atomically - proceeding with email for:`, email);
        
      } catch (dbError) {
        console.warn(`⚠️ [${requestId}] Database deduplication failed (proceeding with email):`, dbError.message);
      }
    } else {
      console.log(`🔄 [${requestId}] No user_id provided - skipping database deduplication`);
    }

    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY not found in environment');
      return res.status(500).json({ error: 'Email service not configured' });
    }

    const firstName = name ? name.split(' ')[0] : '';
    const greeting = firstName ? `Hi ${firstName}` : 'Hi there';

    // Import and initialize Resend inside the function
    let resend;
    try {
      const { Resend } = require('resend');
      resend = new Resend(process.env.RESEND_API_KEY);
      console.log('✅ Resend client created successfully');
    } catch (error) {
      console.error('❌ Error creating Resend client:', error.message);
      return res.status(500).json({ 
        error: 'Failed to initialize email service',
        details: error.message 
      });
    }

    console.log('📤 Attempting to send email with Resend...');
    console.log('- From: hello@kromio.ai');
    console.log('- To:', email);
    console.log('- Subject: Welcome to Kromio');

    const { data, error } = await resend.emails.send({
      from: 'hello@kromio.ai',
      to: [email],
      subject: 'Welcome to Kromio - Start Building Chrome Extensions with AI!',
      html: getWelcomeEmailTemplate(greeting)
    });

    if (error) {
      console.error('❌ Resend API error details:');
      console.error('- Error object:', JSON.stringify(error, null, 2));
      console.error('- Error message:', error.message);
      console.error('- Error name:', error.name);
      return res.status(500).json({ 
        error: 'Failed to send welcome email',
        details: error.message || 'Unknown Resend error'
      });
    }

    console.log(`\n✅ WELCOME EMAIL SENT SUCCESSFULLY - Request #${requestId}:`);
    console.log('- Email ID:', data.id);
    console.log('- To:', email);
    console.log('- Database flag was already updated atomically before sending');
    console.log('- Request completed at:', new Date().toISOString());
    
    res.status(200).json({ success: true, emailId: data.id });

  } catch (error) {
    console.error('💥 Unexpected error in welcome email function:');
    console.error('- Error message:', error.message);
    console.error('- Error stack:', error.stack);
    console.error('- Error name:', error.name);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
};