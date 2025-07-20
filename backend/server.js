const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const GOOGLE_API_KEY = "AIzaSyDki4k3wRgR7TEw1ugkkaWqe1tBxxnDfDk";

// Dummy images per category
const DUMMY_IMAGES = {
  schools: "https://source.unsplash.com/400x300/?school,education,campus",
  colleges: "https://source.unsplash.com/400x300/?college,university,students",
  theaters: "https://source.unsplash.com/400x300/?theater,cinema,film",
  "medical shops": "https://source.unsplash.com/400x300/?pharmacy,medicine,health",
};

app.get("/api/places", async (req, res) => {
  const { location } = req.query;
  const categories = ["schools", "colleges", "theaters", "medical shops"];

  try {
    const results = {};

    for (const category of categories) {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${category} in ${location}&key=${GOOGLE_API_KEY}`
      );

      let placesArray = response.data.results.map((place) => {
        let photoUrl = DUMMY_IMAGES[category];
        if (place.photos && place.photos.length > 0) {
          const photoReference = place.photos[0].photo_reference;
          photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${GOOGLE_API_KEY}`;
        }

        return {
          name: place.name,
          formatted_address: place.formatted_address,
          rating: place.rating || null,
          photo_url: photoUrl,
          place_id: place.place_id,
          category: category,
        };
      });

      if (placesArray.length === 0) {
        placesArray = [
          {
            name: `Popular ${category}`,
            formatted_address: `Main Street, ${location}`,
            rating: 4.2,
            photo_url: DUMMY_IMAGES[category],
            place_id: `dummy_${category}`,
            category: category,
          },
        ];
      }

      results[category] = placesArray;
    }

    res.json(results);
  } catch (error) {
    console.error("Google API error:", error);
    res.status(500).json({ error: "Failed to fetch places" });
  }
});

app.get("/api/place-details", async (req, res) => {
  const { place_id } = req.query;

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=${GOOGLE_API_KEY}`
    );

    const place = response.data.result;
    res.json({
      name: place.name,
      formatted_address: place.formatted_address,
      rating: place.rating || null,
      photo_url: place.photos?.[0] 
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`
        : DUMMY_IMAGES[place.types?.[0]] || DUMMY_IMAGES.schools,
    });
  } catch (error) {
    console.error("Error fetching place details:", error);
    res.status(500).json({ error: "Failed to fetch place details" });
  }
});

app.get("/api/place-reviews", async (req, res) => {
  const { place_id } = req.query;
  
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=reviews&key=${GOOGLE_API_KEY}`
    );
    
    const reviews = response.data.result?.reviews || [];
    res.json(reviews.slice(0, 5));
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});