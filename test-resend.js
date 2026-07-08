const { Resend } = require('resend');

// Configuration (récupérée de ton .env.local)
const SUPABASE_URL = 'https://temvfvyvtklwjlhjcill.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlbXZmdnl2dGtsd2psaGpjaWxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNTQzMjgsImV4cCI6MjA5MDYzMDMyOH0.RY2GmtoERGVxxAL6-KwYd_WYhQc_8CyRquvxB0rKZGI';
const RESEND_API_KEY = 're_V4KzBrvt_HKMWqqp7cMUq2hVbRZKfquRF';

const resend = new Resend(RESEND_API_KEY);

async function runTest() {
  console.log("1. Récupération d'un email dans Supabase (via API REST)...");
  
  try {
    // On utilise fetch directement pour éviter les problèmes de WebSockets de la librairie Supabase
    const response = await fetch(`${SUPABASE_URL}/rest/v1/athletes?select=email,first_name,last_name&email=not.is.null&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    const athletes = await response.json();

    if (!athletes || athletes.length === 0) {
      console.error("Aucun athlète avec un email n'a été trouvé dans la base.");
      return;
    }

    const targetAthlete = athletes[0];
    const targetEmail = targetAthlete.email;
    const athleteName = `${targetAthlete.first_name} ${targetAthlete.last_name || ''}`.trim();

    console.log(`Email trouvé : ${targetEmail} (${athleteName})`);
    console.log("2. Tentative d'envoi via Resend...");

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Prep Athlete <contact@prepathlete.pro>',
      to: [targetEmail],
      subject: 'Test d\'envoi Prep Athlete (via DB)',
      html: `
        <h1>Bonjour ${athleteName} !</h1>
        <p>Ceci est un mail de test envoyé automatiquement depuis le script de développement.</p>
        <p>Si tu reçois ce mail, c'est que la connexion entre <strong>Supabase</strong> et <strong>Resend</strong> est opérationnelle !</p>
      `
    });

    if (emailError) {
      console.error("Erreur Resend :", emailError);
    } else {
      console.log("✅ Email envoyé avec succès ! ID :", emailData.id);
      console.log(`Vérifiez la boîte mail de : ${targetEmail}`);
    }

  } catch (err) {
    console.error("❌ Une erreur est survenue :", err.message);
  }
}

runTest();
