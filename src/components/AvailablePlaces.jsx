import Places from "./Places.jsx";
import Error from "./Error.jsx";
import { sortPlacesByDistance } from "../loc.js"
import { useState, useEffect } from "react";

export default function AvailablePlaces({ onSelectPlace }) {
  const [availablePlaces, setAvailablePlaces] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState()

  //FETCH con async/await necessito di un'altra funzione interna perchè non posso mettere async direttamente a useEffect
  useEffect(() => {
    async function fetchData() {
      setIsFetching(true);
      try {
        const res = await fetch("http://localhost:3000/places");
        const data = await res.json();
        if (!res.ok) {
          throw new Error("Failed to fetch places");
        }
        navigator.geolocation.getCurrentPosition((position) => {
          const sortedPlaces = sortPlacesByDistance(data.places, position.coords.latitude, position.coords.longitude)
          setAvailablePlaces(sortedPlaces);
        })
      } catch (error) {
        setError(error)
      } finally{
        setIsFetching(false);
      }
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

  if(error){
    return <Error title="An error occured" message={error.message} />
  }

  return (
    <Places
      title="Available Places"
      places={availablePlaces}
      fallbackText="No places available."
      loadingText="Fetching data..."
      isLoading={isFetching}
      onSelectPlace={onSelectPlace}
    />
  );
}
