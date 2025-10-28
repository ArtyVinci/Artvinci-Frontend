import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../utils/constants";
import Modal from "../../components/common/Modal";

const AIArt = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [artworks, setArtworks] = useState([]);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const listUrl = `${API_BASE_URL}/gallery`;
  const generateUrl = `${API_BASE_URL}/gallery/generate/`;

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchList = async () => {
    try {
      const res = await fetch(listUrl);
      const j = await res.json();
      setArtworks(j.results || []);
    } catch (e) {
      console.error("Failed to fetch gallery list", e);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError("");
    if (!prompt.trim()) return setError("Please enter a prompt.");

    setLoading(true);
    try {
      const res = await fetch(generateUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const j = await res.json();
      if (!res.ok) {
        setError(j.error || "Generation failed");
      } else {
        // prepend new artwork
        setArtworks((s) => [j, ...s]);
        setPrompt("");
      }
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-10">
      <h1 className="text-3xl font-bold mb-6">AI Art Generator</h1>

      <form onSubmit={handleGenerate} className="mb-6">
        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
        <div className="flex gap-3">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the art you want to generate"
            className="flex-1 px-4 py-3 border rounded-lg"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-3 bg-gradient-to-r from-[#6d2842] to-[#a64d6d] text-white rounded-lg"
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {artworks.map((a) => (
          <div
            key={a.id || a._id}
            className="bg-white rounded-lg shadow-sm overflow-hidden"
          >
            {a.image_url ? (
              <img
                src={a.image_url}
                alt={a.prompt}
                className="w-full h-56 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedImage(a)}
              />
            ) : (
              <div className="w-full h-56 flex items-center justify-center bg-gray-100">
                No image
              </div>
            )}
            <div className="p-4">
              <h3 className="font-medium mb-2">{a.prompt}</h3>
              <p className="text-xs text-gray-500">
                {new Date(a.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Image Viewer Modal */}
      <Modal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        title={selectedImage?.prompt || "AI Generated Art"}
        size="xl"
      >
        <div className="flex flex-col items-center">
          {selectedImage?.image_url && (
            <img
              src={selectedImage.image_url}
              alt={selectedImage.prompt}
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
          )}
          <div className="mt-4 text-sm text-gray-600 text-center">
            <p className="mb-2">
              <span className="font-semibold">Prompt:</span>{" "}
              {selectedImage?.prompt}
            </p>
            <p className="text-xs text-gray-500">
              Generated on{" "}
              {selectedImage?.created_at &&
                new Date(selectedImage.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AIArt;
