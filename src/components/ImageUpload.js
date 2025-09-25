import React, { useRef } from 'react';
import axios from 'axios';
import mythologyData from '../data/mythologyData.json';

function ImageUpload({ setResult, setLoading, setError, addToUploadHistory }) {
  const fileInputRef = useRef(null);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      // ✅ Use environment variables for security
      const apiKey = process.env.REACT_APP_IMAGGA_API_KEY;
      const apiSecret = process.env.REACT_APP_IMAGGA_API_SECRET;

      const imaggaResponse = await axios.post(
        'https://api.imagga.com/v2/tags',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Basic ' + btoa(apiKey + ':' + apiSecret)
          },
          params: { limit: 5 }
        }
      );

      const tags = imaggaResponse.data.result?.tags || [];
      const objectName = tags.length > 0 ? tags[0].tag.en : null;

      if (!objectName) {
        throw new Error('No object identified in the image.');
      }

      addToUploadHistory(objectName);

      const wikiData = await fetchWikipediaData(objectName);
      const mythologyInfo = mythologyData[objectName.toLowerCase()] || { description: 'No mythological data available.' };

      setResult({
        objectName,
        wikiSummary: wikiData.summary || 'No Wikipedia data found.',
        mythology: mythologyInfo.description,
      });
    } catch (err) {
      let errorMessage = 'Error processing image.';
      if (err.response) {
        errorMessage = `Error: ${err.response.data.status.text || err.message}`;
      } else {
        errorMessage = `Error: ${err.message}`;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchWikipediaData = async (query) => {
    try {
      const response = await axios.get(
        `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(query)}&origin=*`,
        { timeout: 5000 }
      );
      const pages = response.data.query.pages;
      const pageId = Object.keys(pages)[0];
      return { summary: pages[pageId].extract || 'No summary available.' };
    } catch {
      return { summary: null };
    }
  };

  return (
    <div className="mb-6">
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleImageUpload}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
    </div>
  );
}

export default ImageUpload;