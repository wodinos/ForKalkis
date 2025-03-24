import { useState } from "react";

export default function App() {
  const [buffer, setBuffer] = useState(1.2);
  const [siloer, setSiloer] = useState([
    { navn: "silo1", fortype: "200", forbruk: 0 },
    { navn: "silo2", fortype: "200", forbruk: 0 },
    { navn: "silo3", fortype: "1000", forbruk: 0 },
    { navn: "silo4", fortype: "1000", forbruk: 0 },
  ]);

  const totalForbruk = siloer.reduce((sum, silo) => sum + parseFloat(silo.forbruk || 0), 0);
  const dagligSnitt = totalForbruk / 7;
  const anbefaltBestilling = dagligSnitt * 7 * buffer;

  const fordelinger = siloer.map((silo) => ({
    ...silo,
    andel: totalForbruk > 0 ? (silo.forbruk / totalForbruk) * anbefaltBestilling : 0,
  }));

  const handleBufferChange = (value) => {
    setBuffer(parseFloat(value) || 0);
  };

  const handleSiloChange = (index, field, value) => {
    const nyeSiloer = [...siloer];
    nyeSiloer[index][field] = field === "forbruk" ? parseFloat(value) || 0 : value;
    setSiloer(nyeSiloer);
  };

  const leggTilSilo = () => {
    const nyttNavn = `silo${siloer.length + 1}`;
    setSiloer([...siloer, { navn: nyttNavn, fortype: "", forbruk: 0 }]);
  };

  const fjernSilo = (index) => {
    const nyeSiloer = siloer.filter((_, i) => i !== index);
    setSiloer(nyeSiloer);
  };

  const summerPerFortype = {};
  fordelinger.forEach(({ fortype, andel }) => {
    if (!summerPerFortype[fortype]) summerPerFortype[fortype] = 0;
    summerPerFortype[fortype] += andel;
  });

  const summerPerFortypeMedSekker = Object.entries(summerPerFortype).map(([fortype, sum]) => {
    const sekkeAntall = Math.round(sum / 750);
    const justertVekt = sekkeAntall * 750;
    return { fortype, sum, justertVekt };
  });

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-6">🧮 Fôrbestillingskalkulator</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Buffer (f.eks. 1.2 for 20% ekstra):</label>
        <input
          type="number"
          value={buffer}
          step="0.1"
          onChange={(e) => handleBufferChange(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">📦 Siloer</h2>
        {siloer.map((silo, index) => (
          <div key={index} className="bg-gray-100 p-4 rounded-md mb-4">
            <h3 className="text-lg font-semibold mb-2">{silo.navn.toUpperCase()}</h3>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Fôrtype</label>
              <input
                type="text"
                value={silo.fortype}
                onChange={(e) => handleSiloChange(index, "fortype", e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kg brukt siste 7 dager
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
              Fjern silo
            </button>
          </div>
        ))}

        <button
          onClick={leggTilSilo}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ➕ Legg til silo
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">📊 Anbefalt bestilling:</h2>
        <p className="mb-2 font-medium">Total: {anbefaltBestilling.toFixed(2)} kg</p>
        <ul className="list-disc pl-5">
          {fordelinger.map((silo, index) => (
            <li key={index}>
              {silo.navn.toUpperCase()} ({silo.fortype}): {silo.andel.toFixed(2)} kg
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">📦 Total per fôrtype:</h2>
        <ul className="list-disc pl-5">
          {summerPerFortypeMedSekker.map(({ fortype, sum, justertVekt }) => (
            <li key={fortype}>
              {fortype}: {sum.toFixed(2)} kg → Bestill nærmeste mengde:{" "}
              <strong>{justertVekt} kg</strong>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
