import Places from "./Places.jsx";
import { useState, useEffect } from "react";

export default function AvailablePlaces({ onSelectPlace }) {
  const [availablePlaces, setAvailablePlaces] = useState([]);

  //FETCH con async/await necessito di un'altra funzione interna perchè non posso mettere async direttamente a useEffect
  useEffect(() => {
    async function fetchData() {
      const res = await fetch("http://localhost:3000/places");
      const data = await res.json();
      setAvailablePlaces(data.places);
    }

    fetchData();
  }, []);
  /* FETCH CON .THEN
   useEffect(() => {
    fetch('http://localhost:3000/places')
    .then(res => res.json())
    .then(data => {
      setAvailablePlaces(data.places)
    }
    )
  }, []) */

  return (
    <Places
      title="Available Places"
      places={availablePlaces}
      fallbackText="No places available."
      onSelectPlace={onSelectPlace}
    />
  );
}
