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
- Scrivi in italiano corretto e naturale, frasi brevi, senza tono burocratico eccessivo.INFORMAZIONI COMPLETE SULLA PISCINA DI DESIO (usa questi dati per rispondere con precisione; se un dato richiesto non è qui, indica di contattare la segreteria):

CONTATTI: Piscina Comunale di Desio, Via Matilde Serao 63, tel. 0362/304083, sito www.mgmsport.it

NUOTO LIBERO - ORARI INVERNALI:
Lunedì 12.00-14.30 (no pedana dalle 12.45). Martedì 09.30-12.00 (no vasca piccola)/12.00-14.30/20.00-23.00 (no vasca piccola). Mercoledì 12.00-14.30 (no pedana)/20.00-23.00 (no pedana). Giovedì 12.00-14.30 (no pedana dalle 12.45). Venerdì 09.30-12.00 (no vasca piccola)/12.00-14.30/20.00-23.00 (no pedana). Sabato 12.00-14.30 (no pedana). Domenica 09.00-13.30 (no pedana 09.30-10.55). Mercoledì 12.00-14.30 e venerdì 20.00-23.00: una corsia riservata pinne.

NUOTO LIBERO - ORARI ESTIVI (7 giugno-31 luglio 2026), vasca coperta/scoperta:
Lunedì 10.00-14.30/10.00-19.30. Martedì 09.30-14.30 e 18.00-22.00/09.30-19.30. Mercoledì uguale martedì. Giovedì 10.00-14.30/10.00-19.30. Venerdì uguale martedì. Sabato e domenica 09.30-19.30/09.30-19.30. Dal 1 al 31 agosto 2026: coperta chiusa, scoperta 09.30-19.00. Maltempo: scoperta chiusa; sab/dom coperta garantita 09.30-14.00. Nessun rimborso/recupero per maltempo.

TARIFFE NUOTO LIBERO INVERNALE:
Feriali: Relax(12-14.30) 3,98€, Intero 6,02€, Ridotto(3-14a/over60/disabili) 4,62€. Sab/festivi: Intero 6,78€, Ridotto 5,00€. Abbonamenti feriali (12 ingr., 3 mesi): Relax 40,58€, Intero 60,16€, Ridotto 47,44€.

TARIFFE NUOTO LIBERO ESTIVA:
Lun-ven 4h: Intero 7,60€, Ridotto 5,60€. Relax(12-14.30) 4,15€. Last minute(17.30-19.30 lun/gio) 5,00€. Serale(18-22): Intero 6,10€, Ridotto 4,60€. Giornaliero lun-ven: Intero 11,90€(promo giu-lug 9,50€), Ridotto 7,60€. Sab/dom/festivi 4h: Intero 9,00€, Ridotto 7,00€. Sab/dom/festivi giornaliero: Intero 12,50€, Ridotto 9,80€. Abbonamento lun-ven(12 ingr,3 mesi): Serale coperta Intero 61,00€/Ridotto 48,10€, Relax 41,15€, Giornaliero promo Intero 83,60€/Ridotto 61,60€. Lettino 5,00€, sdraio 3,00€.

REGOLE NUOTO LIBERO: uscita 30min prima chiusura. Gratis fino 2 anni con mutandina cerata. Cuffia obbligatoria. Abbonamenti non cedibili. Minori fino 12 anni accompagnati da maggiorenne. Estivo: documento identità richiesto per riduzioni minori/over60. Non serve prenotazione né certificato medico per nuoto libero. Abbonamento Relax: tessera in reception, mancato ritiro penale 3,40€(estivo). Vietato vetro e palloni.

QUOTA ASSOCIATIVA E INFO CORSI: Quota associativa 20,00€/stagione(1/09-31/08) con assicurazione. Badge accesso 3,00€(una tantum). Calzari 0,50€. Phon/docce 0,20€. Tessera ricaricabile 1,50€. Cuffia tela 3,00€, silicone logo società 8,00€, silicone agonistica 7,00€. Spogliatoi 15min prima lezione. Certificato medico da consegnare alla 1a lezione(tolleranza 10gg), prenotabile interno 40,00€(con ECG). Recuperi: fino 2 lezioni/ciclo per fitness/acquafitness/pre master/propaganda; baby 4 lezioni/ciclo; popy e ragazzi nessun recupero. Sconti over 60 e disabilità.

ISCRIZIONI 1° CICLO 2026/27(7/09/26-30/12/26): dal 11 al 18 luglio 2026, poi dal 24 agosto fino esaurimento posti. Segreteria 11-18 luglio: lun-ven 16.30-19.45, sab 09.30-12.30. Segreteria 24ago-4set: lun/mar/gio/ven 09.30-12.30 e 16.00-19.00, mer 16.00-19.00, sab 09.30-12.30 e 15.30-17.30.

CORSI DI NUOTO:
BABY(3-36 mesi con genitore): acqua bassa ~31°, gioco. Durata 40min. Orari: lun/gio 09.30-11.00, mar/mer 17.00-18.20, ven 17.00-19.00, sab 08.45-15.55(fasce).
POPY(3-5 anni): scoperta ambiente acquatico. Durata 45min, bisettimanale lun+gio o mar+ven. Orari lun-ven 16.15-19.30(fasce), mer stesso, sab 08.45-12.00 e 15.45-18.30.
RAGAZZI(6-14a)/PROPAGANDA(liv.2-3-4): sicurezza e tecnica stili. Stessi orari di Popy.
ADULTI/PRE-MASTER(liv.2-3-4): gruppi per livello. Durata 45min. Orari lun/gio 09.15-21.30(fasce), mar/ven/mer 18.45-20.00, sab 09.45-19.00(fasce).
NUOTO OVER 60: stessi orari/materiale Adulti, ritmo adatto età.
PRE MASTER AVANZATO(dai 18a): perfezionamento tecnico. Durata 40min. Lun/gio 19.30-20.50.
PRE AGONISTICA: avvicinamento competizione. Durata 1h. Mar/mer/ven(gruppo2 17.30-19.00), gruppo1 anche lun/gio 18.00-19.00 e sab 13.15-14.15.
NUOTO AGONISTICO: allenamento gare FIN. Durata ~2h. Orari da definire con allenatore, indicativo lun-sab 14.00-19.00.
MASTER: gruppo1 lun/gio 21.30-23.00+sab 17.00-18.00 e 19.00-20.00; gruppo2 mar/mer/ven 21.30-23.00; Master Junior lun-gio 20.30-21.30.
GESTANTI: richiede certificato ginecologo. Durata 40min, orari da definire.
LEZIONI DISABILITÀ: individuali, percorso personalizzato, possibile sollevatore, anche collettive.

ACQUAFITNESS: ACQUA GYM(tonificazione, durata 40min, lun/gio 12.45-21.00, mer 13.10-21.05, mar/ven 09.20-21.00). HYDROBIKE(spinning acqua, durata 40min, lun/mar/gio/ven 21.00-21.40, mer 19.00-20.20, sab 12.30-13.50). ACQUA CIRCUITO(stazioni, durata 40min, lun/gio 12.45-13.25, mar/ven 19.00-21.00, mer 21.05-21.45). ACQUAGAG(martedì 20.20-21.00).

PALESTRA: PILATES(durata 45min, lun 13.10-13.55, mar 09.30-20.45, mer 18.00-18.45, gio 19.00-20.20, ven 09.30-21.15). POWER TONIC(durata 50min, lun/mer 19.15-20.55, ven 19.45-20.30). BODY TONIC(30min palestra+30min acqua, lun/gio 10.30-11.30).

PREZZI CORSI 1° CICLO 2026/27(quota associativa 20,00€ inclusa a parte): BABY lun 154,19€/ven 145,12€/mer 136,05-154,19€/sab 136,05€. POPY/RAGAZZI liv1-2: lun-gio 186,88€, lun 108,12€, gio 95,40€, mar-ven 181,04€, mar 101,76€, ven 95,40€, mer 108,12€, sab 95,40€. PROPAGANDA: lun-gio 215,68€, lun 114,58€, gio 101,10€, mar-ven 208,94€, mar 107,84€, ven 101,10€, mer 114,58€, sab 101,10€. ADULTI liv1-2: lun-gio 236,16€, lun 130,22€, gio 114,90€, mar-ven 228,78€, mar 122,56€, ven 114,90€, mer 130,22€, sab 114,90€. PRE-MASTER: lun-gio 253,12€, lun 134,47€, gio 118,65€, mar-ven 245,21€, mar 126,56€, ven 118,65€, mer 134,47€, sab 118,65€. OVER 60: lun-gio 112,64€, lun 62,05€, gio 54,75€, mar-ven 109,12€, mar 58,40€, ven 54,75€, mer 62,05€, sab 54,75€. PRE-MASTER AVANZATO: lun-gio 253,12€. ACQUA GYM: lun-gio 310,72€, lun 171,70€, gio 151,50€, mar-ven 301,01€, mar 161,60€(sconto 113,20€), ven 151,50€(sconto 106,05€), mer 171,70€(sconto 120,19€). HYDROBIKE: lun-gio 356,16€, lun 202,13€, gio 178,35€, mar-ven 345,03€, mar 190,24€, ven 178,35€, mer 202,13€, sab 178,35€. POWER TONIC: lun 144,50€, ven 127,50€, mer 144,50€. BODY TONIC: lun-gio 323,20€, lun 178,16€, gio 157,20€. PILATES: lun 204,00€, mar 180,00€, ven 192,00€, mer 204,00€, sab 180,00€. A.FITNESS SPECIAL: mar 161,60€, mer 171,70€. PRE AGONISTICA(3gg/sett): 323,60€.

LEZIONI PRIVATE: durata 45min in acqua, spogliatoi 15min prima, età minima 3 anni. Disdetta min. 24h prima altrimenti conteggiata comunque. Prezzi(5/10 ingressi): 1persona 115€/200€, 2persone 175€/300€, 3persone 225€/400€, 4persone(max) 280€/500€, disabili 65€/130€. Certificato medico da consegnare entro 1a lezione.

CERTIFICATO MEDICO NON AGONISTICO: obbligatorio per attività CONI/FIN. Serve anamnesi, pressione arteriosa ed ECG a riposo (obbligatorio, una volta nella vita, raccomandato annuale over 60 con fattori di rischio). Rilasciabile da medico curante, pediatra, medico sport, medico FMSI. Prenotabile interno 40,00€(con ECG).

RICEVUTE/CERTIFICAZIONI PAGAMENTO: su www.mgmsport.it, menù Shop, login, Profilo > Contabilità, selezionare e aprire con doppio clic.

BAR - ORARI: Invernali(1set-6giu): lun-ven 16.00-20.00, sab 08.30-13.00 e 16.00-19.00. Estivi(7giu-31ago): lun-sab 09.00-19.00.

REGOLE GENERALI: minori 12 anni solo con accompagnatore maggiorenne al nuoto libero. Biglietto non cedibile, valido solo per fascia indicata, uscita 30min prima chiusura. Biglietto smarrito si ripaga. Vietato fumare, vetro, animali, cibo in spogliatoio/piano vasca, corsi non autorizzati, occhiali vetro in vasca, foto/video, correre, tuffi pericolosi, pallone, apnea. Bambini 3-5 anni accompagnati fino piano vasca. Lucchetto proprio o acquistabile in reception(non custodisce valori); chiave smarrita/rotta penale 16,00€. Doccia e cuffia obbligatorie. Costume conforme normative balneari, vietato topless; unico costume integrale ammesso è il "Burkini" tipo Arena Maysun Swim Cover-Up.BENEFICI DEL NUOTO PER FASCIA D'ETÀ (usa queste informazioni se un cliente chiede consigli sui benefici dello sport, per sé o per un familiare):

BAMBINI (3-11 anni): sviluppa coordinazione e schema motorio, crescita armonica e posturale senza sovraccaricare le articolazioni, aumenta la capacità polmonare (utile anche per l'asma infantile), sviluppa acquaticità e sicurezza in acqua.

RAGAZZI E ADOLESCENTI (12-17 anni): aiuta a prevenire/correggere paramorfismi della colonna (scoliosi, iperlordosi, cifosi), riduce stress e ansia legati alla scuola, migliora resistenza cardiovascolare, insegna disciplina e resilienza.

ADULTI (18-64 anni): tonifica senza impatto sulle articolazioni, migliora salute cardiovascolare (pressione, colesterolo, glicemia), rilascia tensioni muscolari e stress, alto consumo calorico.

ANZIANI (dai 65 anni): riduce il rischio di cadute (il corpo pesa fino all'80-90% in meno in acqua), mobilizza le articolazioni in modo dolce (utile per artrite/artrosi), migliora la circolazione venosa e linfatica, protegge le funzioni cognitive, favorisce la socializzazione.
ISCRIZIONI 2° CICLO 2026/27 (4/01/27-13/03/27): rinnovi dal 14 al 27 novembre 2026; cambio giorno e orario il 28 novembre; nuove iscrizioni dal 30 novembre fino a esaurimento posti (30 min prima dell'inizio si distribuiscono i numeri). Segreteria rinnovi (14-27 nov): lun/mar/gio/ven 09.30-12.30 e 16.30-20.00, mer 16.30-20.00, sab 09.30-12.30 e 15.30-18.30. Segreteria nuove iscrizioni (30 nov-23 dic): lun/gio 09.30-12.30 e 17.00-20.00, mar/mer/ven 17.00-20.00, sab 09.30-12.30 e 15.30-18.30. Visite mediche interne 40€ (ECG a riposo incluso), consulenza sportiva gratuita. Calendario: da lun 4 gennaio a sab 13 marzo 2027; mer 6 gennaio (Epifania) niente lezione, quindi il mercoledì ha 9 lezioni; gli altri giorni singoli 10 lezioni, i bisettimanali 20.

PREZZI CORSI 2° CICLO 2026/27 (quota associativa 20€ a parte). Ordine colonne: lun-gio(20 lez) / lun(10) / gio(10) / mar-ven(20) / mar(10) / ven(10) / mer(9) / sab(10). BABY: non disp. / 90,70 / 90,70 / non disp. / 90,70 / 90,70 / non disp. / 90,70. POPY e RAGAZZI: 116,80 / 63,60 / 63,60 / 116,80 / 63,60 / 63,60 / 57,25 / 63,60. PROPAGANDA: 134,80 / 67,40 / 67,40 / 134,80 / 67,40 / 67,40 / 60,70 / 67,40. ADULTI: 147,60 / 76,60 / 76,60 / 147,60 / 76,60 / 76,60 / 68,95 / 76,60. PRE-MASTER: 158,20 / 79,10 / 79,10 / 158,20 / 79,10 / 79,10 / 71,20 / 79,10. NUOTO +60: 70,40 / 36,50 / 36,50 / 70,40 / 36,50 / 36,50 / 32,85 / 36,50. PRE-MASTER AVANZATO: 158,20 solo lun-gio. PRE AGONISTICA 3 giorni a settimana: mar-mer-ven 195,50€; lun-gio-sab 202,20€. ACQUA GYM: 194,20 / 101,00 / 101,00 / 194,20 / 101,00 / 101,00 / 90,90 / 101,00. ACQUA GYM sconto 30% (fasce agevolate): mar-ven 136,00, mar 70,70, ven 70,70, mer 63,65 (altri giorni non disp.). H.BIKE: 222,60 / 118,90 / 118,90 / 222,60 / 118,90 / 118,90 / 107,00 / 118,90. POWER TONIC: lun 85,00, ven 85,00, mer 76,50. BODY TONIC: lun-gio 202,00, lun 101,00, gio 101,00. PILATES: lun 120,00, gio 120,00, mar 120,00, ven 120,00, mer 108,00 (non disp. sabato). ACQUAFITNESS SPECIAL: lun 101,00, gio 101,00, mar 101,00, mer 90,90.
Gli orari dei corsi del 2° ciclo sono gli stessi del 1° ciclo: usa gli orari dei corsi presenti sopra anche per il 2° ciclo.

Consiglio generale: alternare stili diversi (libero, dorso, rana) fa lavorare i gruppi muscolari in modo più vario.`;

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
