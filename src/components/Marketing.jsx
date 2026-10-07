import React, { useState } from 'react';
import { Megaphone, Copy, Check, Sparkles, Send } from 'lucide-react';

export default function Marketing({ database, apiKey, t, lang }) {
  const [form, setForm] = useState({
    objective: 'productPromo',
    channel: 'whatsapp',
    subject: 'Cold Brew Coffee',
    details: 'Buy 1 Get 1 Free on all large cups, available this weekend only!'
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  // Offline mockup generators
  const generateLocalCampaign = () => {
    const { objective, channel, subject, details } = form;
    
    if (lang === 'hi') {
      if (channel === 'whatsapp') {
        return `📣 *विशेष ऑफर!* 📣\n\nप्रिय ग्राहक, *${subject}* का आनंद लें! \n\n*ऑफर विवरण:* ${details}\n\nआज ही हमारी शॉप पर पधारें या ऑर्डर करने के लिए इस लिंक पर क्लिक करें: https://wa.me/918356077864\n\n_अस्वीकरण: सीमित समय का ऑफर!_`;
      }
      if (channel === 'sms') {
        return `ऑफर अलर्ट! ${subject} पर विशेष डील। विवरण: ${details}. आज ही Brewtopia कैफ़े आएं! अनसब्सक्राइब करने के लिए STOP लिखें।`;
      }
      return `विषय: ☕ आपके लिए विशेष उपहार - ${subject} पर बड़ा ऑफर!\n\nप्रिय बिज़नेस पार्टनर,\n\nहमें आपके लिए ${subject} पर एक रोमांचक घोषणा करते हुए बेहद खुशी हो रही है।\n\nऑफर विवरण: ${details}\n\nआज ही हमारी दुकान पर आएं और इसका लाभ उठाएं।\n\nसादर,\nBrewtopia टीम`;
    } else if (lang === 'es') {
      if (channel === 'whatsapp') {
        return `📣 *¡Gran Promoción de ${subject}!* 📣\n\nEstimado cliente, disfrute de nuestra especialidad en *${subject}*.\n\n*Detalles de la oferta:* ${details}\n\nVisítenos hoy o haga su pedido aquí: https://wa.me/918356077864\n\n_¡Oferta por tiempo limitado!_`;
      }
      if (channel === 'sms') {
        return `¡Alerta de Promoción! Gran descuento en ${subject}. Detalles: ${details}. ¡Visítenos hoy en Brewtopia!`;
      }
      return `Asunto: ☕ ¡Algo especial para usted! Promoción en ${subject}\n\nEstimado cliente,\n\nQueremos consentirle esta semana con nuestra mejor oferta en ${subject}.\n\nDetalles: ${details}\n\n¡Le esperamos hoy en nuestro local para disfrutar juntos!\n\nAtentamente,\nEl Equipo de Brewtopia`;
    } else {
      // English
      if (channel === 'whatsapp') {
        return `📣 *Exclusive Offer: ${subject}!* 📣\n\nHi there! We are excited to present our special campaign for *${subject}*.\n\n*Offer Details:* ${details}\n\nDrop by today or click here to order directly: https://wa.me/918356077864\n\n_Hurry, this offer is valid for a limited time only!_`;
      }
      if (channel === 'sms') {
        return `Promo Alert! Get ${subject} today. Details: ${details}. Don't miss out, visit Brewtopia Café today! Text STOP to opt-out.`;
      }
      return `Subject: ☕ Handcrafted Brews Just For You - Special Deal on ${subject}!\n\nDear Customer,\n\nWe love having you as our regular guest. To show our appreciation, we have launched a special promotion for ${subject}.\n\nHere is what you get: ${details}\n\nSimply show this email at the counter to claim your discount. See you soon!\n\nWarm regards,\nThe Brewtopia Team`;
    }
  };

  // Trigger Gemini API Campaign Creator
  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult('');
    setCopied(false);

    if (apiKey) {
      try {
        const prompt = `Write a professional small business marketing copy in ${lang === 'hi' ? 'Hindi' : lang === 'es' ? 'Spanish' : 'English'}.
Objective: ${form.objective} (Product Promotion, Discount or Customer Loyalty)
Channel: ${form.channel} (WhatsApp message with emojis, short SMS, or full Email newsletter)
Product/Subject: ${form.subject}
Offer Details: ${form.details}
Make it engaging, include call to action, and format it cleanly using markdown/emojis. Keep it under 150 words.`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: prompt }]
              }]
            })
          }
        );
        const data = await response.json();
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
          setResult(data.candidates[0].content.parts[0].text);
        } else {
          throw new Error("Invalid API response structure");
        }
      } catch (err) {
        console.error(err);
        setResult(`(API Error - Falling back to template generator)\n\n${generateLocalCampaign()}`);
      } finally {
        setLoading(false);
      }
    } else {
      setTimeout(() => {
        setResult(generateLocalCampaign());
        setLoading(false);
      }, 1000);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const text = encodeURIComponent(result);
    window.open(`https://api.whatsapp.com/send?phone=918356077864&text=${text}`, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Header */}
      <div className="top-header">
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{t('marketingCampaignGen')}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {lang === 'hi' ? 'व्हाट्सएप, एसएमएस या ईमेल के लिए तुरंत एआई-जनरेटेड विज्ञापन कॉपी बनाएं।' : lang === 'es' ? 'Cree textos publicitarios al instante para WhatsApp, SMS o correo electrónico.' : 'Instantly generate high-converting promotional copies for WhatsApp, SMS, or emails.'}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem', flexWrap: 'wrap' }} className="marketing-layout">
        
        {/* Left Form Panel */}
        <div className="glass-card">
          <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Megaphone size={20} className="brand-icon" /> Campaign Details
            </h3>

            <div className="form-group">
              <label className="form-label">{t('campaignType')}</label>
              <select 
                className="form-control"
                value={form.objective}
                onChange={(e) => setForm({...form, objective: e.target.value})}
              >
                <option value="productPromo">{t('productPromo')}</option>
                <option value="discountEvent">{t('discountEvent')}</option>
                <option value="customerLoyalty">{t('customerLoyalty')}</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t('targetChannel')}</label>
              <select 
                className="form-control"
                value={form.channel}
                onChange={(e) => setForm({...form, channel: e.target.value})}
              >
                <option value="whatsapp">WhatsApp Message</option>
                <option value="sms">SMS Text</option>
                <option value="email">Email Newsletter</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                {lang === 'hi' ? 'विषय या उत्पाद का नाम' : lang === 'es' ? 'Nombre del Producto / Evento' : 'Product / Event Name'}
              </label>
              <input 
                type="text" 
                className="form-control"
                value={form.subject}
                onChange={(e) => setForm({...form, subject: e.target.value})}
                placeholder="e.g. Cold Brew Coffee"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                {lang === 'hi' ? 'ऑफर विवरण और लाभ' : lang === 'es' ? 'Detalles de la Oferta' : 'Key Offer / Event Details'}
              </label>
              <textarea 
                className="form-control"
                rows="3"
                value={form.details}
                onChange={(e) => setForm({...form, details: e.target.value})}
                placeholder="e.g. Buy 1 Get 1 Free, valid this Saturday!"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '0.5rem' }}>
              <Sparkles size={16} /> {loading ? 'Drafting Campaign...' : t('generateCampaign')}
            </button>
          </form>
        </div>

        {/* Right Output Panel */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '380px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{t('generatedCampaign')}</h3>
            {result && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={handleSendWhatsApp}>
                  <Send size={14} /> Send to WhatsApp
                </button>
                <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={handleCopy}>
                  {copied ? <Check size={14} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexGrow: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
              <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-purple)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                AI is tailoring your copy...
              </div>
            </div>
          ) : result ? (
            <div style={{ flexGrow: 1, background: '#070a13', border: '1px solid var(--card-border)', padding: '1.25rem', borderRadius: '10px', whiteSpace: 'pre-wrap', fontFamily: form.channel === 'email' ? 'var(--font-sans)' : 'monospace', fontSize: '0.925rem', color: 'var(--text-primary)', overflowY: 'auto', maxHeight: '340px' }}>
              {result}
            </div>
          ) : (
            <div style={{ display: 'flex', flexGrow: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem' }}>
              <Megaphone size={40} style={{ marginBottom: '1rem', strokeWidth: 1.5 }} />
              Fill out the details and click "Generate" to create your tailored copy.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
