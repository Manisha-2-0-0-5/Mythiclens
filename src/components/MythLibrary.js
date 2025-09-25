import React, { useState, useEffect, useCallback } from 'react';

// ✅ API key is now loaded securely from environment variables.
const API_NINJAS_KEY = process.env.REACT_APP_API_NINJAS_KEY;

// ✅ PERFORMANCE: Moved constant data outside the component.
const LOCAL_MYTHS = {
  // Greek Mythology
  zeus: { name: "Zeus", culture: "Greek", description: "King of the gods, ruler of Mount Olympus. Wields the thunderbolt.", related: ["Hera", "Poseidon", "Hades", "Athena"] },
  hera: { name: "Hera", culture: "Greek", description: "Queen of the gods, goddess of marriage and family.", related: ["Zeus", "Ares", "Hephaestus"] },
  poseidon: { name: "Poseidon", culture: "Greek", description: "God of the sea, earthquakes, and horses. Wields a trident.", related: ["Zeus", "Hades", "Amphitrite"] },
  athena: { name: "Athena", culture: "Greek", description: "Goddess of wisdom, courage, and strategic warfare.", related: ["Zeus", "Ares"] },
  apollo: { name: "Apollo", culture: "Greek", description: "God of music, arts, knowledge, prophecy, and the sun.", related: ["Artemis", "Zeus", "Leto"] },
  artemis: { name: "Artemis", culture: "Greek", description: "Goddess of the hunt, the wilderness, and wild animals.", related: ["Apollo", "Zeus", "Leto"] },
  aphrodite: { name: "Aphrodite", culture: "Greek", description: "Goddess of love, beauty, pleasure, and procreation.", related: ["Hephaestus", "Ares", "Eros"] },
  ares: { name: "Ares", culture: "Greek", description: "God of war, representing the violent and untamed aspects of battle.", related: ["Zeus", "Hera", "Aphrodite"] },
  
  // Norse Mythology
  odin: { name: "Odin", culture: "Norse", description: "The Allfather. King of the Æsir, god of wisdom, poetry, war, and death.", related: ["Thor", "Loki", "Frigg", "Baldr"] },
  thor: { name: "Thor", culture: "Norse", description: "God of thunder, lightning, and strength. Wields the hammer Mjölnir.", related: ["Odin", "Loki", "Sif"] },
  loki: { name: "Loki", culture: "Norse", description: "A cunning trickster god who has the ability to change his shape and sex.", related: ["Odin", "Thor", "Hel"] },
  freya: { name: "Freya", culture: "Norse", description: "Goddess associated with love, beauty, fertility, war, and death.", related: ["Odin", "Frigg"] },
  tyr: { name: "Tyr", culture: "Norse", description: "A one-handed god associated with law, justice, and heroic glory in battle.", related: ["Odin", "Fenrir"] },
  hel: { name: "Hel", culture: "Norse", description: "Goddess who presides over the realm of the dead, also named Hel.", related: ["Loki", "Angrboða"] },

  // Egyptian Mythology
  anubis: { name: "Anubis", culture: "Egyptian", description: "God of the dead, mummification, and the afterlife. Has the head of a jackal.", related: ["Osiris", "Nephthys"] },
  ra: { name: "Ra", culture: "Egyptian", description: "The ancient sun god, a primary deity in Egyptian mythology.", related: ["Horus", "Isis", "Thoth"] },
  osiris: { name: "Osiris", culture: "Egyptian", description: "God of the afterlife, the underworld, and rebirth.", related: ["Isis", "Horus", "Set"] },
  isis: { name: "Isis", culture: "Egyptian", description: "A major goddess, associated with magic, motherhood, and healing.", related: ["Osiris", "Horus", "Set"] },
  horus: { name: "Horus", culture: "Egyptian", description: "A sky god, most often depicted as a falcon. Son of Isis and Osiris.", related: ["Isis", "Osiris", "Set", "Ra"] },
  set: { name: "Set", culture: "Egyptian", description: "God of deserts, storms, disorder, and violence. Murderer of Osiris.", related: ["Osiris", "Horus", "Ra"] },
  thoth: { name: "Thoth", culture: "Egyptian", description: "God of writing, magic, wisdom, and the moon. Depicted with the head of an ibis.", related: ["Ra", "Ma'at"] },
  bastet: { name: "Bastet", culture: "Egyptian", description: "Goddess of the home, domesticity, cats, fertility, and childbirth.", related: ["Ra"] },

  // Aztec Mythology
  quetzalcoatl: { name: "Quetzalcoatl", culture: "Aztec", description: "The 'Feathered Serpent.' God of wind, wisdom, and creation.", related: ["Tezcatlipoca", "Tlaloc", "Huitzilopochtli"] },
  tezcatlipoca: { name: "Tezcatlipoca", culture: "Aztec", description: "The 'Smoking Mirror.' God of night, sorcery, and destiny.", related: ["Quetzalcoatl", "Huitzilopochtli", "Xipe Totec"] },
};

const CULTURE_TERMS = {
  Greek: ['zeus', 'hera', 'poseidon', 'athena', 'apollo', 'artemis', 'aphrodite', 'ares', 'hermes', 'dionysus', 'demeter', 'persephone', 'hephaestus', 'hestia'],
  Norse: ['odin', 'thor', 'loki', 'freya', 'tyr', 'hel'],
  Egyptian: ['anubis', 'ra', 'osiris', 'isis', 'horus', 'set', 'thoth', 'bastet'],
  Aztec: ['quetzalcoatl', 'tezcatlipoca'],
  All: [...Object.keys(LOCAL_MYTHS)]
};

function MythLibrary() {
  const [myths, setMyths] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [topic, setTopic] = useState('Greek');

  const fetchMyth = async (name) => {
    if (LOCAL_MYTHS[name]) {
      return { ...LOCAL_MYTHS[name], name, source: 'Local' };
    }
    try {
      const response = await fetch(`https://api.api-ninjas.com/v1/mythology?name=${encodeURIComponent(name)}`, {
        headers: { 'X-Api-Key': API_NINJAS_KEY },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (data.length > 0) {
        const myth = data[0];
        return {
          name: myth.name,
          culture: myth.culture,
          description: myth.description || 'No description available.',
          related: myth.related_figures || [],
          source: 'API Ninjas'
        };
      }
    } catch (error) {
      console.warn(`Failed to fetch ${name}:`, error);
    }
    return { name, culture: 'Unknown', description: `No data found for "${name}".`, related: [], source: 'Fallback' };
  };

  const handleSearch = useCallback(async () => {
    setLoading(true);
    const termsToFetch = searchTerm.trim()
      ? searchTerm.split(',').map(t => t.trim().toLowerCase())
      : (CULTURE_TERMS[topic] || CULTURE_TERMS.All);
    
    const promises = termsToFetch.map(name => fetchMyth(name));
    const results = await Promise.all(promises);

    setMyths(results);
    setLoading(false);
  }, [searchTerm, topic]);

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">⚡ Myth Explorer</h2>
        <p className="text-gray-600 mt-2">Discover gods, heroes, and legends from across the world.</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="bg-white p-4 rounded-lg shadow-md mb-8 flex flex-col md:flex-row items-center gap-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name (e.g., zeus, odin)"
          className="w-full md:flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={topic}
          onChange={(e) => {
            setTopic(e.target.value);
            setSearchTerm('');
          }}
          className="w-full md:w-auto p-3 border border-gray-300 rounded-lg bg-white"
        >
          <option value="Greek">Greek</option>
          <option value="Norse">Norse</option>
          <option value="Egyptian">Egyptian</option>
          <option value="Aztec">Aztec</option>
          <option value="All">All Myths</option>
        </select>
        <button type="submit" className="w-full md:w-auto bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition">
          🔍 Search
        </button>
      </form>

      <div>
        {loading ? (
          <p className="text-center text-gray-500 py-10">Loading myths...</p>
        ) : myths.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {myths.map((myth, index) => (
              <MythCard key={`${myth.name}-${index}`} myth={myth} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 bg-yellow-50 p-6 rounded-lg">
            No myths found. Try a different search.
          </p>
        )}
      </div>
    </div>
  );
}

function MythCard({ myth }) {
  const cultureColorMap = {
    Greek: 'from-blue-500 to-indigo-600',
    Norse: 'from-red-500 to-orange-600',
    Egyptian: 'from-yellow-500 to-amber-600',
    Aztec: 'from-green-500 to-emerald-600',
    Unknown: 'from-gray-500 to-gray-600'
  };
  const bgColor = cultureColorMap[myth.culture] || cultureColorMap.Unknown;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
      <div className={`h-24 bg-gradient-to-r ${bgColor} flex items-center justify-center p-2`}>
        <h3 className="text-xl font-bold text-white text-center">{myth.name}</h3>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <span className="text-xs font-semibold text-gray-500 mb-2">Culture: {myth.culture}</span>
        <p className="text-gray-700 text-sm leading-relaxed flex-grow">{myth.description}</p>
        {myth.related && myth.related.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 font-medium mb-1">RELATED</p>
            <div className="flex flex-wrap gap-1">
              {myth.related.map((rel, i) => (
                <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                  {rel}
                </span>
              ))}
            </div>
          </div>
        )}
        <p className="text-xs text-gray-400 mt-3 text-right">Source: {myth.source}</p>
      </div>
    </div>
  );
}

export default MythLibrary;