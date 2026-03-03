import dotenv from 'dotenv';
dotenv.config();
console.log(Object.keys(process.env).filter(k => k.includes('API') || k.includes('KEY')));
console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
