import React, { useState, useEffect, useCallback } from 'react';

// ✅ API key is now loaded securely from environment variables.
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

function ResultCard({ result }) {
  const [story, setStory] = useState('');
  const [choice, setChoice] = useState('');
  const [loadingMyth, setLoadingMyth] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  // ✅ BEST PRACTICE: Manage object URLs inside useEffect to prevent memory leaks.
  // This creates the URL when the file changes and cleans it up when the component unmounts.
  useEffect(() => {
    if (result?.file) {
      const newImageUrl = URL.createObjectURL(result.file);
      setImageUrl(newImageUrl);

      // Cleanup function to revoke the object URL
      return () => {
        URL.revokeObjectURL(newImageUrl);
      };
    }
  }, [result?.file]);

  // ✅ BEST PRACTICE: Wrap async functions in useCallback.
  const generateMyth = useCallback(async () => {
    if (!result?.objectName || !choice.trim() || !GEMINI_API_KEY) {
        if (!GEMINI_API_KEY) {
            setStory("Error: Gemini API key is missing. Please check your .env file.");
        }
        return;
    }

    setLoadingMyth(true);
    setStory('');

    const prompt = `Rewrite the myth of the ${result.objectName} with this twist: ${choice}. Keep the story short, engaging, and in a mythical style.`;

    try {
      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text;
      
      setStory(generatedText || 'The model returned an empty story. Try a different twist!');

    } catch (error) {
      setStory(`Error: ${error.message}. Please check your API key and connection.`);
      console.error('Myth generation error:', error);
    } finally {
      setLoadingMyth(false);
    }
  }, [result?.objectName, choice]); // Dependencies for the callback

  // Effect to reset the story when a new result comes in
  useEffect(() => {
    setStory('');
    setChoice('');
  }, [result]);

  if (!result) return null;

  return (
    <div className="mt-6 bg-white bg-opacity-90 p-6 rounded-xl shadow-lg w-full max-w-2xl mx-auto animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Your Mythological Discovery</h2>
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={result.objectName}
            className="w-48 h-48 object-cover rounded-lg border-2 border-gray-200 shadow-md"
          />
        )}
        <div className="text-center md:text-left flex-1">
          <p className="text-2xl text-gray-800 capitalize font-semibold">{result.objectName}</p>
          <p className="text-gray-700 mt-2"><strong>Mythology:</strong> {result.mythology}</p>
          <p className="text-gray-600 mt-1"><strong>Wikipedia:</strong> {result.wikiSummary}</p>
        </div>
      </div>

      <div className="mt-6 w-full border-t border-gray-200 pt-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">Myth Weaver</h3>
        <p className="text-center text-gray-500 mb-4">Now, add your own twist to the legend.</p>
        <div className="w-full max-w-lg mx-auto">
          <input
            type="text"
            value={choice}
            onChange={(e) => setChoice(e.target.value)}
            placeholder="e.g., 'it was found on the moon'"
            className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={generateMyth}
            className="w-full bg-purple-600 text-white p-3 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
            disabled={loadingMyth || !choice.trim()}
          >
            {loadingMyth ? 'Weaving Your Tale...' : 'Weave a New Myth'}
          </button>
        </div>
        {story && (
          <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg max-w-lg mx-auto">
            <p className="text-gray-800 whitespace-pre-wrap">{story}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultCard;