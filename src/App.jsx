import { useRef, useState, useCallback, useEffect } from "react";
import Error from "./components/Error.jsx";
import Places from "./components/Places.jsx";
import Modal from "./components/Modal.jsx";
import DeleteConfirmation from "./components/DeleteConfirmation.jsx";
import logoImg from "./assets/logo.png";
import AvailablePlaces from "./components/AvailablePlaces.jsx";

function App() {
  const selectedPlace = useRef();
  const [userPlaces, setUserPlaces] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [errorUpdatingPlaces, setErrorUpdatingPlaces] = useState();
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState()

  //TODO: aggiungi fetch get per i posti già selezionati
  useEffect(() => {
    async function fetchData() {
      setIsFetching(true);
      try {
        const res = await fetch("http://localhost:3000/user-places");
        const data = await res.json();
        console.log(data) // questo dà un array da 3
        setUserPlaces(data.places)
        console.log(userPlaces) //questo è vuoto perchè?
        if (!res.ok) {
          throw new Error("Failed to fetch places");
        }
      } catch (error) {
        setError(error)
      } finally{
        setIsFetching(false);
      }
    }

    fetchData();
  }, []);

  function handleStartRemovePlace(place) {
    setModalIsOpen(true);
    selectedPlace.current = place;
  }

  function handleStopRemovePlace() {
    setModalIsOpen(false);
  }

  async function handleSelectPlace(selectedPlace) {
    //avrei potuto mettere qui la fetch put ma utilizzo l'optimistic updating e passo di sotto dopo aver aggiornato lo state
    setUserPlaces((prevPickedPlaces) => {
      if (!prevPickedPlaces) {
        prevPickedPlaces = [];
      }
      if (prevPickedPlaces.some((place) => place.id === selectedPlace.id)) {
        return prevPickedPlaces;
      }
      return [selectedPlace, ...prevPickedPlaces];
    });

    try {
      const res = await fetch("http://localhost:3000/user-places", {
        method: "PUT",
        body: JSON.stringify({ places: [selectedPlace, ...userPlaces] }), //scritto così perchè altrimenti ottengo il vecchio state
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error("Failed to update user data");
      }

      return data.message;
    } catch (error) {
      setUserPlaces(userPlaces); //rivoglio il precedente state se qualcosa va storto, posso scriverlo così perchè react sta programmando di aggiornarlo in questa funzione
      setErrorUpdatingPlaces({
        message: error.message || "Failed to update places.",
      });
    }
  }

  const handleRemovePlace = useCallback(async function handleRemovePlace() {
    setUserPlaces((prevPickedPlaces) =>
      prevPickedPlaces.filter((place) => place.id !== selectedPlace.current.id)
    );

    //TODO: aggiungi DELETE method
    try {
      const res = await fetch("http://localhost:3000/user-places", {
        method: "PUT",
        body: JSON.stringify({ places: userPlaces.filter((place) => place.id !== selectedPlace.current.id) }), //prova delete
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error("Failed to update user data");
      }

      setModalIsOpen(false)
      return data.message;
    } catch (error) {
      setUserPlaces(userPlaces); //rivoglio il precedente state se qualcosa va storto, posso scriverlo così perchè react sta programmando di aggiornarlo in questa funzione
      setErrorUpdatingPlaces({
        message: error.message || "Failed to update places.",
      });
    }

    setModalIsOpen(false);
  }, [userPlaces]);

  function handleError() {
    setErrorUpdatingPlaces(null);
  }

  return (
    <>
      <Modal open={errorUpdatingPlaces} onClose={handleError}>
        {errorUpdatingPlaces && (
          <Error
            title="An error occured"
            message={errorUpdatingPlaces.message}
            onConfirm={handleError}
          />
        )}
      </Modal>

      <Modal open={modalIsOpen} onClose={handleStopRemovePlace}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        {error && <Error title="An error occured" message={error.message} />}
        {!error && <Places
          title="I'd like to visit ..."
          fallbackText="Select the places you would like to visit below."
          places={userPlaces}
          loadingText="Fetching your places.."
          isLoading={isFetching}
          onSelectPlace={handleStartRemovePlace}
        />}
        <AvailablePlaces onSelectPlace={handleSelectPlace} />
      </main>
    </>
  );
}

export default App;
