import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageSquare, Bot, User, HelpCircle } from 'lucide-react';

export default function Chatbot({ database, apiKey, t, lang }) {
  const { sales, expenses, inventory } = database;
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: lang === 'hi' 
        ? "नमस्ते! मैं आपका एआई बिजनेस सलाहकार हूँ। मैं आपकी बिक्री बढ़ाने, स्टॉक प्रबंधित करने या मार्केटिंग करने में आपकी मदद कर सकता हूँ। मुझसे कोई भी प्रश्न पूछें!"
        : lang === 'es'
        ? "¡Hola! Soy su consultor de negocios AI. Puedo ayudarle a analizar ventas, optimizar su inventario o generar ideas de marketing. ¿En qué puedo ayudarle hoy?"
        : "Hello! I am your AI Business Growth Copilot. I can help you analyze sales trends, optimize inventory, or brainstorm marketing strategies. Ask me anything!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Construct business context for Gemini
  const getBusinessContextString = () => {
    const totalRev = sales.reduce((sum, item) => sum + item.amount, 0);
    const totalExp = expenses.reduce((sum, item) => sum + item.amount, 0);
    const profit = totalRev - totalExp;
    const lowStock = inventory.filter(i => i.stock < i.minStock).map(i => `${i.name} (Stock: ${i.stock})`).join(', ');

    return `You are a virtual business growth consultant. Here is the current financial state of the small business:
- Total Sales: $${totalRev}
- Total Expenses: $${totalExp}
- Net Profit: $${profit}
- Low Stock Items: ${lowStock || 'None'}
- Top Selling items: Coffee, Cappuccino, Lattes, Milk.
Keep your answers brief (under 100 words), highly actionable, and friendly. Provide calculations if needed. Speak in the user's language (Language code: ${lang}).`;
  };

  // Simulated fallback bot responses (offline mode)
  const getOfflineResponse = (query) => {
    const q = query.toLowerCase();
    
    // Revenue calculations
    const totalRev = sales.reduce((sum, item) => sum + item.amount, 0);
    const totalExp = expenses.reduce((sum, item) => sum + item.amount, 0);
    const profit = totalRev - totalExp;

    if (lang === 'hi') {
      if (q.includes('बिक्री') || q.includes('कम') || q.includes('सेल')) {
        return `हमारी बिक्री का विश्लेषण करने पर पता चलता है कि कुल राजस्व $${totalRev} है। मुख्य गिरावट सप्ताह 6 में थी जब कैपुचीनो की मांग घटी थी। आगामी सप्ताह में ग्राहकों को आकर्षित करने के लिए सुबह 9-11 बजे 'हैप्पी आवर' छूट या कूपन लॉन्च करने की सलाह दी जाती है।`;
      }
      if (q.includes('स्टॉक') || q.includes('सामग्री') || q.includes('मिल्क') || q.includes('दूध')) {
        const low = inventory.filter(i => i.stock < i.minStock);
        if (low.length > 0) {
          return `चेतावनी: वर्तमान में आपके पास ${low.length} वस्तुएं कम स्टॉक में हैं, जिसमें मुख्य रूप से '${low[0].name}' शामिल है जो अगले 24 घंटों में समाप्त हो सकता है। कृपया तुरंत ऑर्डर करें।`;
        }
        return "आपका स्टॉक स्तर वर्तमान में ठीक है। कोई भी आवश्यक सामग्री अभी समाप्त होने के कगार पर नहीं है।";
      }
      if (q.includes('मुनाफा') || q.includes('प्रॉफिट') || q.includes('नुकसान')) {
        return `आपका शुद्ध लाभ $${profit} है और कुल खर्च $${totalExp} है। खर्चे घटाने के लिए अपने 'Inventory' खर्च (जो कि कुल खर्चों का सबसे बड़ा हिस्सा है) को सुव्यवस्थित करें और थोक विक्रेताओं से बातचीत करें।`;
      }
      return "दिलचस्प सवाल है! मैं एक बिज़नेस कंसलटेंट हूँ। आप मुझसे पूछ सकते हैं: 1. मेरी बिक्री कैसे बढ़ाएं? 2. स्टॉक अलर्ट क्या हैं? 3. मुनाफा बढ़ाने के तरीके?";
    } else if (lang === 'es') {
      if (q.includes('ventas') || q.includes('bajar') || q.includes('vender')) {
        return `Nuestros datos muestran ventas acumuladas de $${totalRev}. Hubo una caída leve en la Semana 6, pero se recuperó en la Semana 7. Para acelerar las ventas, le sugiero lanzar un combo 'Desayuno Express' (Café + Tostada) para los clientes apurados.`;
      }
      if (q.includes('stock') || q.includes('inventario') || q.includes('leche')) {
        const low = inventory.filter(i => i.stock < i.minStock);
        if (low.length > 0) {
          return `¡Alerta de stock! Su artículo '${low[0].name}' está por debajo del nivel mínimo. Considere reabastecer hoy para evitar perder ventas de cafetería.`;
        }
        return "Sus niveles de stock están saludables. Ningún producto corre riesgo de desabastecimiento inmediato.";
      }
      if (q.includes('ganancia') || q.includes('rentabilidad') || q.includes('gastos')) {
        return `Su ganancia neta es de $${profit} sobre un gasto total de $${totalExp}. Para mejorar los márgenes, intente optimizar los insumos con un nuevo proveedor mayorista de vasos y granos.`;
      }
      return "¡Excelente pregunta! Como su consultor virtual, puedo ayudarle con: 1. Estrategias de ventas, 2. Alertas de inventario, 3. Análisis de costos y rentabilidad.";
    } else {
      // English Default
      if (q.includes('sale') || q.includes('drop') || q.includes('revenue') || q.includes('grow')) {
        return `Our analytics show total sales of $${totalRev}. Week 6 had a slight dip, but Week 7/8 bounced back by 8%. To accelerate growth, launch a 'Midweek Coffee Treat' promotion on Wednesdays (traditionally your slowest day) offering 15% off large lattes.`;
      }
      if (q.includes('stock') || q.includes('inventory') || q.includes('order') || q.includes('milk')) {
        const low = inventory.filter(i => i.stock < i.minStock);
        if (low.length > 0) {
          return `Critical inventory alert: ${low.map(item => item.name).join(', ')} is running low. Milk is consuming at 12L/day and will deplete in 16 hours. I suggest placing a replenishment order immediately.`;
        }
        return "All stock levels are healthy! No inventory run-outs predicted for the next 5 days based on usage speed.";
      }
      if (q.includes('profit') || q.includes('margin') || q.includes('expense') || q.includes('cost')) {
        return `Your net profit stands at $${profit} with expenses of $${totalExp}. Operating margin is ${((profit/totalRev)*100).toFixed(1)}%. To increase profit, negotiate bulk terms on Coffee Beans (our highest expense) and optimize utility usage during non-peak hours.`;
      }
      return "I can help you review performance! Ask me questions like: 'Why did my sales drop last week?', 'What are my stock warnings?', or 'How can I lower my utility bills?'";
    }
  };

  // Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    const userMsg = { id: Date.now(), sender: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    if (apiKey) {
      // REAL GEMINI API CALL
      try {
        const context = getBusinessContextString();
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: `${context}\n\nUser Question: ${userText}` }]
              }]
            })
          }
        );
        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
          const aiResponse = data.candidates[0].content.parts[0].text;
          setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: aiResponse }]);
        } else {
          throw new Error("Invalid API response format");
        }
      } catch (err) {
        console.error(err);
        setMessages(prev => [...prev, { 
          id: Date.now() + 1, 
          sender: 'bot', 
          text: `Error connecting to Gemini: ${err.message}. Falling back to offline simulator.\n\nOffline: ${getOfflineResponse(userText)}` 
        }]);
      } finally {
        setLoading(false);
      }
    } else {
      // OFFLINE SIMULATION
      setTimeout(() => {
        const offlineReply = getOfflineResponse(userText);
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: offlineReply }]);
        setLoading(false);
      }, 1000);
    }
  };

  const sampleQuestions = lang === 'hi' 
    ? ["बिक्री में सुधार कैसे करें?", "स्टॉक कब समाप्त होगा?", "खर्च कैसे कम करें?"]
    : lang === 'es'
    ? ["¿Cómo mejorar ventas?", "¿Cuándo se agota el stock?", "¿Cómo recortar gastos?"]
    : ["How to improve sales?", "When will stock run out?", "How to reduce expenses?"];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Header */}
      <div className="top-header">
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{t('aiConsultantTitle')}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {lang === 'hi' ? 'अपने व्यवसाय से संबंधित प्रश्न पूछें और त्वरित वित्तीय समाधान प्राप्त करें।' : lang === 'es' ? 'Haga preguntas sobre su negocio y reciba asesoría financiera y operativa al instante.' : 'Ask questions about your sales, P&L, or stock to get instant financial advice.'}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1.2fr', gap: '1.5rem', flexWrap: 'wrap' }} className="chat-layout">
        
        {/* Chat Console Card */}
        <div className="glass-card chat-container">
          {/* Chat History */}
          <div className="chat-history">
            {messages.map(msg => (
              <div key={msg.id} className={`chat-message ${msg.sender}`}>
                <div className="chat-avatar">
                  {msg.sender === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div className="chat-bubble">
                  {msg.text}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="chat-message bot">
                <div className="chat-avatar">
                  <Bot size={18} />
                </div>
                <div className="chat-bubble" style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                  <div style={{ width: '6px', height: '6px', backgroundColor: 'var(--text-secondary)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both' }}></div>
                  <div style={{ width: '6px', height: '6px', backgroundColor: 'var(--text-secondary)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both 0.2s' }}></div>
                  <div style={{ width: '6px', height: '6px', backgroundColor: 'var(--text-secondary)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both 0.4s' }}></div>
                </div>
                <style>{`
                  @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1.0); }
                  }
                `}</style>
              </div>
            )}
            <div ref={chatEndRef}></div>
          </div>

          {/* Chat input area */}
          <form onSubmit={handleSendMessage} className="chat-input-area">
            <input 
              type="text" 
              className="form-control"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('chatbotPlaceholder')}
              disabled={loading}
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Send size={16} /> {t('send')}
            </button>
          </form>
        </div>

        {/* Right Help Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* API Info Card */}
          {!apiKey && (
            <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-purple)', backgroundColor: 'var(--accent-purple-glow)' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Sparkles size={20} style={{ color: 'var(--accent-purple)', flexShrink: 0 }} />
                <div>
                  <h4 style={{ color: 'var(--accent-purple)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Unlock Real Gemini AI
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {t('apiKeyRequired')} Paste your key in the <strong>Settings</strong> panel.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Questions Card */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HelpCircle size={18} className="brand-icon" /> Suggested Questions
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {sampleQuestions.map((q, idx) => (
                <button 
                  key={idx}
                  className="btn btn-secondary" 
                  style={{ justifyContent: 'flex-start', fontSize: '0.825rem', padding: '0.6rem 0.8rem', textAlign: 'left' }}
                  onClick={() => setInput(q)}
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
