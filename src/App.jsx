import { useState } from "react";

export default function ForKalkulator() {
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
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Fôrbestillingskalkulator</h1>

      <div className="mt-4">
        <label className="block">Buffer (f.eks. 1.2 for 20% ekstra):</label>
        <input
          type="number"
          value={buffer}
          step="0.1"
          onChange={(e) => handleBufferChange(e.target.value)}
          className="border p-2 w-full rounded"
        />
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold">Siloer</h2>
        {siloer.map((silo, index) => (
          <div key={index} className="border p-2 rounded mb-2">
            <label className="block font-medium">{silo.navn.toUpperCase()}</label>
            <label htmlFor="fortype" className="block text-sm font-medium text-gray-700 mb-1">
    Fôrtype
  </label>
  <input
    id="fortype"
    name="fortype"
    type="text"
    value={silo.fortype}
    onChange={(e) => handleSiloChange(index, "fortype", e.target.value)}
    className="border p-2 w-full rounded"
  />
  <label htmlFor="kgBrukt" className="block text-sm font-medium text-gray-700 mb-1">Kg brukt siste 7 dager</label>
            <input
            name="kgBrukt"
              type="number"
              value={silo.forbruk}
              placeholder="Forbruk (kg)"
              onChange={(e) => handleSiloChange(index, "forbruk", e.target.value)}
              className="border p-1 w-full rounded mt-1"
            />
            <button
              onClick={() => fjernSilo(index)}
              className="mt-2 bg-red-300 p-2 border rounded-md text-red-600 hover:underline"
            >
              Fjern silo
            </button>
          </div>
        ))}
        <button
          onClick={leggTilSilo}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Legg til silo
        </button>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold">Anbefalt bestilling:</h2>
        <p>Total: {anbefaltBestilling.toFixed(2)} kg</p>
        {fordelinger.map((silo, index) => (
          <p key={index}>
            {silo.navn.toUpperCase()} ({silo.fortype}): {silo.andel.toFixed(2)} kg
          </p>
        ))}
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold">Total per fôrtype:</h2>
        {summerPerFortypeMedSekker.map(({ fortype, sum, justertVekt }) => (
          <p key={fortype}>
            {fortype}: {sum.toFixed(2)} kg → Bestill nærmeste mengde: <strong>{justertVekt} kg</strong>
          </p>
        ))}
      </div>
    </div>
  );
}
