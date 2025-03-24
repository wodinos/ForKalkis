import { useState, useEffect } from "react";

// Her er en sammenslått/"merge"-versjon, basert på koden du viste
// (med styling) og de nye funksjonene (localStorage, antall dager,
// validering, og evt. Hjelp-knapp / flerspråklig logikk).
// Hvis du ønsker å fjerne engelsk oversettelse, fjerner du bare TEXTS-objektet og det som er relatert til 'lang'.

// Språkfil med oversettelser
const TEXTS = {
  no: {
    title: "🧮 Fôrbestillingskalkulator",
    daysLabel: "Antall dager:",
    bufferLabel: "Buffer (f.eks. 1.2 for 20% ekstra):",
    siloSection: "📦 Siloer",
    removeSilo: "Fjern silo",
    addSilo: "➕ Legg til silo",
    totalLabel: "📊 Anbefalt bestilling:",
    totalText: "Total",
    totalFortype: "📦 Total per fôrtype:",
    nearest: "Bestill nærmeste mengde:",
    help: "Hjelp",
    helpClose: "Lukk forklaring",
    why750: "Hvorfor 750 kg?",
    why750Explain:
      "Fôret bestilles i sekker á 750 kg. Derfor runder vi av til nærmeste 750 kg for hver fôrtype.",
    smallDeviation:
      "Det kan føre til at totalen blir litt høyere eller lavere enn eksakt beregnet, men sikrer at du bestiller hele sekker.",
    howToTitle: "Hvordan bruke kalkulatoren?",
    howToSteps: [
      "1. Angi hvor mange dager du vil beregne for (f.eks. siste 7 dager).",
      "2. Sett bufferen – en faktor for å legge til en ekstra margin (f.eks. 1.2 for 20% ekstra).",
      "3. For hver silo, skriv inn hva slags fôr (fortype) og hvor mye som ble brukt over de valgte dagene.",
      "4. Om du trenger flere siloer, trykk 'Legg til silo'. Du kan også slette en silo du ikke lenger trenger.",
    ],
    helpSummary:
      "Resultatet viser total anbefalt bestilling basert på historisk forbruk, og hver silo får en andel av totalen. Sekkejusteringen forklares i seksjonen 'Hvorfor 750 kg?' ovenfor.",
    siloName: "silo",
    fortypeLabel: "Fôrtype",
    forbrukLabel: (days) => `Kg brukt siste ${days} dager`,
    negativeError: "Kan ikke angi negativt tall, setter til 0.",
    language: "English",
  },
  en: {
    title: "🧮 Feed Ordering Calculator",
    daysLabel: "Number of days:",
    bufferLabel: "Buffer (e.g. 1.2 for 20% extra):",
    siloSection: "📦 Silos",
    removeSilo: "Remove silo",
    addSilo: "➕ Add silo",
    totalLabel: "📊 Recommended ordering:",
    totalText: "Total",
    totalFortype: "📦 Total per feed type:",
    nearest: "Order nearest quantity:",
    help: "Help",
    helpClose: "Close help",
    why750: "Why 750 kg?",
    why750Explain:
      "Feed is delivered in 750 kg sacks, so we round up/down to the nearest 750 kg for each feed type.",
    smallDeviation:
      "This can cause the total to be slightly higher or lower than the exact calculation, but ensures you order whole sacks.",
    howToTitle: "How to use the calculator?",
    howToSteps: [
      "1. Enter how many days you want to base calculations on (e.g., the last 7 days).",
      "2. Set the buffer – a multiplier to add an extra margin (e.g., 1.2 for 20% extra).",
      "3. For each silo, specify the feed type and how much was used over the chosen days.",
      "4. If you need more silos, click 'Add silo'. You can also remove any silo you don't need.",
    ],
    helpSummary:
      "The result shows the total recommended order based on historical usage, and each silo gets a share of that total. Sack rounding is explained in the 'Why 750 kg?' section above.",
    siloName: "silo",
    fortypeLabel: "Feed type",
    forbrukLabel: (days) => `Kg used in last ${days} days`,
    negativeError: "Cannot set negative value, defaulting to 0.",
    language: "Norsk",
  },
};

export default function App() {
  // 1) Språkvalg
  const [lang, setLang] = useState(() => {
    const savedLang = localStorage.getItem("lang");
    return savedLang ? savedLang : "no";
  });

  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  const t = TEXTS[lang];

  // 2) Legg til en state for antall dager, med henting fra localStorage
  const [antallDager, setAntallDager] = useState(() => {
    const saved = localStorage.getItem("antallDager");
    return saved ? parseInt(saved, 10) : 7;
  });

  // 3) Buffer og siloer hentes og lagres i localStorage
  const [buffer, setBuffer] = useState(() => {
    const saved = localStorage.getItem("buffer");
    // Standard = 1.2 for 20% ekstra
    return saved ? parseFloat(saved) : 1.2;
  });

  const [siloer, setSiloer] = useState(() => {
    const saved = localStorage.getItem("siloer");
    if (saved) {
      return JSON.parse(saved);
    } else {
      // Default-oppsett
      return [
        { navn: "silo1", fortype: "200", forbruk: 0 },
        { navn: "silo2", fortype: "200", forbruk: 0 },
        { navn: "silo3", fortype: "1000", forbruk: 0 },
        { navn: "silo4", fortype: "1000", forbruk: 0 },
      ];
    }
  });

  // 4) useEffect for å lagre i localStorage ved endringer
  useEffect(() => {
    localStorage.setItem("antallDager", antallDager);
  }, [antallDager]);

  useEffect(() => {
    localStorage.setItem("buffer", buffer);
  }, [buffer]);

  useEffect(() => {
    localStorage.setItem("siloer", JSON.stringify(siloer));
  }, [siloer]);

  // 5) Beregninger basert på antallDager
  const totalForbruk = siloer.reduce(
    (sum, silo) => sum + (parseFloat(silo.forbruk) || 0),
    0
  );
  const dagligSnitt = antallDager > 0 ? totalForbruk / antallDager : 0;
  const anbefaltBestilling = dagligSnitt * antallDager * buffer;

  // 6) Fordeling per silo (andel = forbruk / totalForbruk)
  const fordelinger = siloer.map((silo) => {
    const siloForbruk = parseFloat(silo.forbruk) || 0;
    const andel =
      totalForbruk > 0 ? (siloForbruk / totalForbruk) * anbefaltBestilling : 0;
    return {
      ...silo,
      andel,
    };
  });

  // 7) Håndter input-endringer
  const handleAntallDagerChange = (val) => {
    const parsed = parseInt(val, 10);
    if (parsed > 0) {
      setAntallDager(parsed);
    } else {
      setAntallDager(7); // fallback
    }
  };

  const handleBufferChange = (value) => {
    const numeric = parseFloat(value);
    // Validering: unngå negative buffer
    if (numeric < 0) {
      alert(t.negativeError);
      setBuffer(0);
    } else {
      setBuffer(numeric || 0);
    }
  };

  const handleSiloChange = (index, field, val) => {
    const updated = [...siloer];

    if (field === "forbruk") {
      const numeric = parseFloat(val);
      if (numeric < 0) {
        alert(t.negativeError);
        updated[index].forbruk = 0;
      } else {
        updated[index].forbruk = numeric || 0;
      }
    } else {
      updated[index][field] = val;
    }

    setSiloer(updated);
  };

  const leggTilSilo = () => {
    const nyttNavn = `${t.siloName}${siloer.length + 1}`;
    setSiloer([
      ...siloer,
      { navn: nyttNavn, fortype: "", forbruk: 0 },
    ]);
  };

  const fjernSilo = (index) => {
    const nye = siloer.filter((_, i) => i !== index);
    setSiloer(nye);
  };

  // 8) Summer per fortype (inkludert justering for sekker på 750 kg)
  const summerPerFortype = {};
  fordelinger.forEach(({ fortype, andel }) => {
    if (!summerPerFortype[fortype]) {
      summerPerFortype[fortype] = 0;
    }
    summerPerFortype[fortype] += andel;
  });

  const summerPerFortypeMedSekker = Object.entries(summerPerFortype).map(
    ([fortype, sum]) => {
      const sekkeAntall = Math.round(sum / 750);
      const justertVekt = sekkeAntall * 750;
      return { fortype, sum, justertVekt };
    }
  );

  // 9) Hjelp-knapp
  const [visHjelp, setVisHjelp] = useState(false);
  const toggleHjelp = () => {
    setVisHjelp(!visHjelp);
  };

  // Språk-bytte
  const toggleLanguage = () => {
    setLang(lang === "no" ? "en" : "no");
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      {/* Topp-overskrift */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-center">{t.title}</h1>
        <button
          onClick={toggleLanguage}
          className="border px-2 py-1 rounded text-sm hover:bg-gray-100"
        >
          {t.language}
        </button>
      </div>

      {/* Antall dager */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">{t.daysLabel}</label>
        <input
          type="number"
          value={antallDager}
          onChange={(e) => handleAntallDagerChange(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      {/* Buffer */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">{t.bufferLabel}</label>
        <input
          type="number"
          step="0.1"
          value={buffer}
          onChange={(e) => handleBufferChange(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      {/* Siloer-liste */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">{t.siloSection}</h2>
        {siloer.map((silo, index) => (
          <div key={index} className="bg-gray-100 p-4 rounded-md mb-4">
            <h3 className="text-lg font-semibold mb-2">{silo.navn.toUpperCase()}</h3>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.fortypeLabel}</label>
              <input
                type="text"
                value={silo.fortype}
                onChange={(e) => handleSiloChange(index, "fortype", e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.forbrukLabel(antallDager)}
              </label>
              <input
                type="number"
                value={silo.forbruk}
                onChange={(e) => handleSiloChange(index, "forbruk", e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <button
              onClick={() => fjernSilo(index)}
              className="text-sm text-red-600 hover:underline"
            >
              {t.removeSilo}
            </button>
          </div>
        ))}

        <button
          onClick={leggTilSilo}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {t.addSilo}
        </button>
      </div>

      {/* Anbefalt bestilling + fordeling */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">{t.totalLabel}</h2>
        <p className="mb-2 font-medium">
          {t.totalText}: {anbefaltBestilling.toFixed(2)} kg
        </p>
        <ul className="list-disc pl-5">
          {fordelinger.map((silo, index) => (
            <li key={index}>
              {silo.navn.toUpperCase()} ({silo.fortype}): {silo.andel.toFixed(2)} kg
            </li>
          ))}
        </ul>
      </div>

      {/* Total per fôrtype + sekkekorrigering */}
      <div>
        <h2 className="text-xl font-semibold mb-2">{t.totalFortype}</h2>
        <ul className="list-disc pl-5">
          {summerPerFortypeMedSekker.map(({ fortype, sum, justertVekt }) => (
            <li key={fortype}>
              {fortype}: {sum.toFixed(2)} kg → {t.nearest} <strong>{justertVekt} kg</strong>
            </li>
          ))}
        </ul>
      </div>

      {/* Hjelp-knapp */}
      <div className="mt-6">
        <button
          onClick={toggleHjelp}
          className="bg-gray-200 text-sm px-3 py-1 rounded hover:bg-gray-300"
        >
          {visHjelp ? t.helpClose : t.help}
        </button>

        {visHjelp && (
          <div className="mt-2 text-sm text-gray-700 border rounded p-2">
            <p className="mb-2 font-semibold">{t.why750}</p>
            <p>{t.why750Explain}</p>
            <p className="mt-1">{t.smallDeviation}</p>
            <hr className="my-2"/>
            <p className="mb-2 font-semibold">{t.howToTitle}</p>
            <ul className="list-disc ml-4">
              {t.howToSteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
            <p className="mt-2">{t.helpSummary}</p>
          </div>
        )}
      </div>
    </div>
  );
}
