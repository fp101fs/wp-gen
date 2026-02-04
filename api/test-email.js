const { Resend } = require('resend');

module.exports = async (req, res) => {
  console.log('🧪 Email test endpoint called');
  
  // Check environment
  const apiKey = process.env.RESEND_API_KEY;
  console.log('API Key exists:', !!apiKey);
  console.log('API Key starts with re_:', apiKey?.startsWith('re_'));
  console.log('API Key length:', apiKey?.length);
  
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'No API key found',
      env: Object.keys(process.env).filter(k => k.includes('RESEND'))
    });
  }
  
  // Test Resend initialization
  try {
    const resend = new Resend(apiKey);
    console.log('✅ Resend client created successfully');
    
    // Try a simple email send
    const { data, error } = await resend.emails.send({
      from: 'hello@kromio.com',
      to: ['test@example.com'], // This won't actually send anywhere
      subject: 'Test Email',
      html: '<p>This is a test</p>'
    });
    
    if (error) {
      console.log('❌ Resend error:', JSON.stringify(error, null, 2));
      return res.status(200).json({ 
        success: false,
        error: error,
        message: 'Resend API error (detailed)'
      });
    }
    
    console.log('✅ Email would be sent, ID:', data.id);
    return res.status(200).json({ 
      success: true,
      emailId: data.id,
      message: 'Test successful'
    });
    
  } catch (err) {
    console.log('💥 Unexpected error:', err.message);
    console.log('Error stack:', err.stack);
    return res.status(500).json({ 
      error: err.message,
      stack: err.stack
    });
  }
};