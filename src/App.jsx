import { useState, useEffect } from "react";



const TEXTS = {
  no: {
    title: "🧮 Fôrbestillingskalkulator",
    daysLabel: "Antall dager:",
    bufferLabel: "Buffer (f.eks. 1.2 for 20% ekstra):",
    siloSection: "📦 Siloer",
    removeSilo: "Fjern silo",
    addSilo: "Legg til silo",
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
    addSilo: "Add silo",
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
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved === "true";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "no");
  useEffect(() => localStorage.setItem("lang", lang), [lang]);
  const t = TEXTS[lang];

  const [antallDager, setAntallDager] = useState(() => {
    const saved = localStorage.getItem("antallDager");
    return saved ? parseInt(saved, 10) : 7;
  });
  useEffect(() => localStorage.setItem("antallDager", antallDager), [antallDager]);

  const [buffer, setBuffer] = useState(() => {
    const saved = localStorage.getItem("buffer");
    return saved ? parseFloat(saved) : 1.2;
  });
  useEffect(() => localStorage.setItem("buffer", buffer), [buffer]);

  const [siloer, setSiloer] = useState(() => {
    const saved = localStorage.getItem("siloer");
    return saved
      ? JSON.parse(saved)
      : [
          { navn: "silo1", fortype: "200", forbruk: 0 },
          { navn: "silo2", fortype: "200", forbruk: 0 },
          { navn: "silo3", fortype: "1000", forbruk: 0 },
          { navn: "silo4", fortype: "1000", forbruk: 0 },
        ];
  });
  useEffect(() => localStorage.setItem("siloer", JSON.stringify(siloer)), [siloer]);

  const [visHjelp, setVisHjelp] = useState(false);
  const [visTotalUtregning, setVisTotalUtregning] = useState(false);
  const [visSiloDetaljer, setVisSiloDetaljer] = useState({});

  const toggleLanguage = () => setLang(lang === "no" ? "en" : "no");

  const handleAntallDagerChange = (val) => {
    const parsed = parseInt(val, 10);
    setAntallDager(parsed > 0 ? parsed : 7);
  };

  const handleBufferChange = (val) => {
    const numeric = parseFloat(val);
    if (numeric < 0) {
      alert(t.negativeError);
      setBuffer(0);
    } else {
      setBuffer(numeric || 0);
    }
  };

  const handleSiloChange = (index, field, value) => {
    const updated = [...siloer];
    if (field === "forbruk") {
      const num = parseFloat(value);
      updated[index].forbruk = num >= 0 ? num : 0;
    } else {
      updated[index][field] = value;
    }
    setSiloer(updated);
  };

  const leggTilSilo = () => {
    const nyNavn = `${t.siloName}${siloer.length + 1}`;
    setSiloer([...siloer, { navn: nyNavn, fortype: "", forbruk: 0 }]);
  };

  const fjernSilo = (index) => {
    const ny = siloer.filter((_, i) => i !== index);
    setSiloer(ny);
  };

  const totalForbruk = siloer.reduce(
    (sum, silo) => sum + (parseFloat(silo.forbruk) || 0),
    0
  );
  const dagligSnitt = antallDager > 0 ? totalForbruk / antallDager : 0;
  const anbefaltBestilling = dagligSnitt * antallDager * buffer;

  const fordelinger = siloer.map((silo) => {
    const siloForbruk = parseFloat(silo.forbruk) || 0;
    const prosent = totalForbruk > 0 ? siloForbruk / totalForbruk : 0;
    return {
      ...silo,
      andel: prosent * anbefaltBestilling,
    };
  });

  const summerPerFortype = {};
  fordelinger.forEach(({ fortype, andel }) => {
    summerPerFortype[fortype] = (summerPerFortype[fortype] || 0) + andel;
  });

  const summerPerFortypeMedSekker = Object.entries(summerPerFortype).map(
    ([fortype, sum]) => {
      const sekkeAntall = Math.round(sum / 750);
      return { fortype, sum, justertVekt: sekkeAntall * 750 };
    }
  );

  return (
    <div className="max-w-2xl mx-auto p-4 my-0 sm:my-6 bg-white dark:bg-gray-900 text-black dark:text-white rounded shadow-md">
      {/* Header */}
      <div className="flex-row place-items-center items-center justify-between mb-6 sm:flex">
        <h1 className="text-lg font-bold sm:text-3xl">{t.title}</h1>
        <div className="flex gap-2">
          <button
            onClick={toggleLanguage}
            className="border px-2 py-1 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {t.language}
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="border px-2 py-1 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      {/* Inputs */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">{t.daysLabel}</label>
        <input
          type="number"
          value={antallDager}
          onChange={(e) => handleAntallDagerChange(e.target.value)}
          className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-700"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">{t.bufferLabel}</label>
        <input
          type="number"
          step="0.1"
          value={buffer}
          onChange={(e) => handleBufferChange(e.target.value)}
          className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 dark:border-gray-700"
        />
      </div>

      {/* Siloer */}
      <h2 className="text-xl font-semibold mt-4 mb-2">{t.siloSection}</h2>
      {siloer.map((silo, idx) => {
        const bestillingSilo = (parseFloat(silo.forbruk) || 0) * buffer;
        const isOpen = visSiloDetaljer[idx] || false;

        return (
          <div key={idx} className="bg-gray-100 dark:bg-gray-800 p-3 mb-3 rounded">
            <h3 className="text-lg font-semibold mb-2">{silo.navn.toUpperCase()}</h3>

            <label className="block text-sm font-medium">{t.fortypeLabel}</label>
            <input
              type="text"
              value={silo.fortype}
              onChange={(e) => handleSiloChange(idx, "fortype", e.target.value)}
              className="border p-2 w-full rounded mb-2 bg-white dark:bg-gray-700 dark:border-gray-600"
            />

            <label className="block text-sm font-medium">
              {t.forbrukLabel(antallDager)}
            </label>
            <input
              type="number"
              value={silo.forbruk}
              onChange={(e) => handleSiloChange(idx, "forbruk", e.target.value)}
              className="border p-2 w-full rounded mb-2 bg-white dark:bg-gray-700 dark:border-gray-600"
            />

            <button
              onClick={() => fjernSilo(idx)}
              className="text-sm text-white bg-red-500 hover:bg-red-400 p-2 rounded-md mb-2"
            >
              <i class="bi mr-1 bi-trash3"></i>
              {t.removeSilo}
            </button>

            <p className="text-sm">
              <strong>{lang === "no" ? "Enkel silo-bestilling" : "Simple silo order"}</strong>: {bestillingSilo.toFixed(2)} kg
            </p>

            <button
              className="mt-2 bg-gray-200 dark:bg-gray-700 text-sm px-2 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              onClick={() =>
                setVisSiloDetaljer((prev) => ({ ...prev, [idx]: !prev[idx] }))
              }
            >
              {isOpen
                ? lang === "no" ? "Skjul detaljer" : "Hide details"
                : lang === "no" ? "Vis detaljer" : "Show details"}
            </button>

            {isOpen && (
              <div className="mt-2 text-sm border rounded p-2 dark:border-gray-600">
                <p>
                  <strong>{lang === "no" ? "Totalt forbruk på silo" : "Total usage on silo"}</strong>: {(parseFloat(silo.forbruk) || 0).toFixed(2)} kg
                </p>
                <p>
                  <strong>Buffer</strong>: {buffer.toFixed(2)}
                </p>
                <p>
                  <strong>{lang === "no" ? "Anbefalt bestilling" : "Recommended order"}</strong>: {bestillingSilo.toFixed(2)} kg
                </p>
              </div>
            )}
          </div>
        );
      })}
      <button
      
        onClick={leggTilSilo}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500"
      >
        <i class="bi mr-2 bi-plus-square text-primary"></i>
        {t.addSilo}
      </button>

      {/* Totaler */}
      <div className="mt-6 bg-gray-100 dark:bg-gray-800 p-4 rounded">
        <h2 className="text-xl font-semibold mb-2">{t.totalLabel}</h2>
        <p>{t.totalText}: {anbefaltBestilling.toFixed(2)} kg</p>

        <button
          onClick={() => setVisTotalUtregning(!visTotalUtregning)}
          className="mt-2 bg-gray-200 dark:bg-gray-700 text-sm px-2 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          {visTotalUtregning ? (lang === "no" ? "Skjul utregning" : "Hide calc") : (lang === "no" ? "Vis utregning" : "Show calc")}
        </button>

        {visTotalUtregning && (
          <div className="mt-2 text-sm border rounded p-2 dark:border-gray-600">
            <ul className="list-disc pl-5">
              <li>{lang === "no" ? "Totalt forbruk" : "Total usage"}: {totalForbruk.toFixed(2)} kg</li>
              <li>{lang === "no" ? "Daglig snitt" : "Daily average"}: {dagligSnitt.toFixed(2)} kg</li>
              <li>× {antallDager} × {buffer.toFixed(2)} = <strong>{anbefaltBestilling.toFixed(2)} kg</strong></li>
            </ul>
          </div>
        )}

        {fordelinger.map((s, i) => (
          <p key={i}>
            {s.navn.toUpperCase()} ({s.fortype}): {s.andel.toFixed(2)} kg
          </p>
        ))}

        <div className="mt-4">
          <h3 className="font-semibold">{t.totalFortype}</h3>
          {summerPerFortypeMedSekker.map(({ fortype, sum, justertVekt }) => (
            <p key={fortype}>
              {fortype}: {sum.toFixed(2)} kg → {t.nearest} <strong>{justertVekt} kg</strong>
            </p>
          ))}
        </div>
      </div>

      {/* Hjelpe-seksjon */}
      <div className="mt-6">
        <button
          onClick={() => setVisHjelp(!visHjelp)}
          className="bg-gray-200 dark:bg-gray-700 text-sm px-3 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          {visHjelp ? t.helpClose : t.help}
        </button>

        {visHjelp && (
          <div className="mt-2 text-sm text-gray-800 dark:text-gray-200 border dark:border-gray-600 rounded p-2">
            <p className="mb-2 font-semibold">{t.why750}</p>
            <p>{t.why750Explain}</p>
            <p className="mt-1">{t.smallDeviation}</p>
            <hr className="my-2" />
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