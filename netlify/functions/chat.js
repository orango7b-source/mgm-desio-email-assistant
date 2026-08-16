exports.handler = async function (event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { clientEmail, note, location } = JSON.parse(event.body || "{}");

    if (!clientEmail || !clientEmail.trim()) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Email del cliente mancante" }) };
    }

    const loc = location || "Desio";

    const systemPrompt = `Sei l'assistente di scrittura email per il Direttore della Piscina di ${loc} (MGM Sport / Team Lombardia Nuoto).

Il tuo compito: leggere l'email ricevuta da un cliente/socio e scrivere UNA bozza di risposta in italiano, pronta perché il direttore la rilegga e la invii.

Regole:
- Scrivi solo il corpo dell'email di risposta (niente oggetto, niente spiegazioni, niente markdown, niente virgolette attorno al testo).
- Tono di default: professionale, cordiale e diretto, come un direttore di un centro sportivo che risponde a un socio. Se nelle note viene indicato un tono o un contenuto specifico, seguilo fedelmente: ha sempre priorità.
- Se l'email del cliente contiene richieste concrete (recuperi, rimborsi, orari, certificati medici, iscrizioni) e le note non specificano la risposta, scrivi una bozza plausibile ma segnala chiaramente tra parentesi quadre i punti da verificare o completare, es: [confermare disponibilità con la segreteria].
- Non inventare dati specifici (date, importi, nomi di istruttori) se non presenti nell'email o nelle note: usa placeholder tra parentesi quadre.
- Chiudi con un saluto cordiale e firma come "La Direzione, Piscina di ${loc}" salvo diversa indicazione nelle note.
- Scrivi in italiano corretto e naturale, frasi brevi, senza tono burocratico eccessivo.`;

    const userPrompt = `EMAIL RICEVUTA DAL CLIENTE:
"""
${clientEmail}
"""

NOTE DEL DIRETTORE PER LA RISPOSTA (se vuote, usa il tono di default):
"""
${note && note.trim() ? note : "(nessuna nota specifica)"}
"""

Scrivi ora la bozza di risposta.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: "Errore API Anthropic: " + errText })
      };
    }

    const data = await response.json();
    const draft = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ draft })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
