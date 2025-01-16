import { clientId, clientSecret } from "./env/client.js";
//Playlist

const URL = "https://accounts.spotify.com/authorize";
const redirectUri = "http://127.0.0.1:5500/PRACTICASPOTIFY/playlist.html";
const scopes =
  "playlist-modify-private user-library-modify playlist-modify-public";


let tokenAcces = ""; // Store Spotify access token
const btnBuscar = document.querySelector("#buscador");
const btnClear = document.querySelector("#borrador");
const inputTrackObj = document.querySelector("#searchField");
const resultSection = document.querySelector(".resultatBusqueda");
const artistDetails = document.querySelector(".artistDetails");

const btnPlaylist = document.querySelector("#Playlist");



// Fetch Spotify Access Token
const getSpotifyAccessToken = function (clientId, clientSecret) {
  const url = "https://accounts.spotify.com/api/token";
  const credentials = btoa(`${clientId}:${clientSecret}`);

  const header = {
    Authorization: `Basic ${credentials}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };

  fetch(url, {
    method: "POST",
    headers: header,
    body: "grant_type=client_credentials",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      tokenAcces = data.access_token;
      btnBuscar.disabled = false; // Enable search button
      console.log("Access Token:", tokenAcces);
    })
    .catch((error) => {
      console.error("Error fetching access token:", error);
    });
};
const artistDetailsSection = document.querySelector(".informacioGrup");

// Function to fetch and display artist details
const fetchArtistDetails = function (artistId) {
  const artistUrl = `https://api.spotify.com/v1/artists/${artistId}`;

  fetch(artistUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${tokenAcces}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      return response.json();
    })
    .then((artist) => {
      // Display artist details in the artistDetailsSection
      artistDetailsSection.innerHTML = `
        <div class="artist-info" style="font-size: 0.9rem; margin-bottom: 8px;">
          <img src="${artist.images[0]?.url}" alt="${artist.name}" class="artist-image" style="width:150px; height:150px;">
          <h2 style="font-size: 0.7rem; margin-bottom: 2px;">${artist.name}</h2>
          <p style="font-size: 0.6rem; margin-bottom: 4px;"><strong>Popularity:</strong> ${artist.popularity}</p>
          <p style="font-size: 0.6rem; margin-bottom: 4px;"><strong>Genres:</strong> ${artist.genres.join(", ") || "N/A"}</p>
          <p style="font-size: 0.6rem; margin-bottom: 8px;"><strong>Followers:</strong> ${artist.followers.total.toLocaleString()}</p>
        </div>
      `;

      // Fetch top tracks of the artist
      const topTracksUrl = `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`;

      return fetch(topTracksUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${tokenAcces}`,
          "Content-Type": "application/json",
        },
      });
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      const topTracks = data.tracks.slice(0, 3); // Get top 3 tracks

      // Display the top tracks in the artistDetailsSection
      let topTracksHtml = "<p style='font-size: 0.7rem;'>Top 3 Tracks:</p><ol style='font-size: 0.2 rem;'>";
      topTracks.forEach((track) => {
        topTracksHtml += `
          <li>
            <p style ='font-size: 0.5rem;'>${track.name}</p>
          </li>
        `;
      });
      topTracksHtml += "</ol>";

      // Append the top tracks to the artist details section
      artistDetailsSection.innerHTML += topTracksHtml;
    })
    .catch((error) => {
      console.error("Error fetching artist details:", error);
      artistDetailsSection.innerHTML = `<p>Error fetching artist details.</p>`;
    });
};
const getArtistInfo = function (artistId) {
  fetchArtistDetails(artistId); // Call the fetchArtistDetails function to display artist info
};

// Add Song to Local Storage
function addSongToLocalStorage(songId) {
  let storedSongs = localStorage.getItem("savedSongs");
  if (storedSongs) {
    // If songs exist, add the new song ID to the list
    storedSongs = storedSongs.split(";");
    if (!storedSongs.includes(songId)) {
      storedSongs.push(songId);
      localStorage.setItem("savedSongs", storedSongs.join(";"));
    }
  } else {
    // If no songs exist, save the first song ID
    localStorage.setItem("savedSongs", songId);
  }
  console.log("Saved songs:", localStorage.getItem("savedSongs"));
}
// Search Tracks
const search = function () {
  const value = inputTrackObj.value.trim();

  if (!value) {
    alert("Has d'introduir un nom d’una cançó");
    return;
  }
  if (value.length <= 2) {
    alert("Has d’introduir almenys 2 caràcters");
    return;
  }

  const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(value)}&type=track&limit=12`;

  fetch(searchUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${tokenAcces}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      const infoTrack = data.tracks.items;

      resultSection.innerHTML = ""; // Clear previous results

      if (!infoTrack || infoTrack.length === 0) {
        resultSection.innerHTML = "<p>No hi han resultats</p>";
        return;
      }

      infoTrack.forEach((track) => {
        const trackElement = document.createElement("div");
        trackElement.classList.add("track");

        // HTML structure for each track
        trackElement.innerHTML = `
          <div class="track-info">
            <img src="${track.album.images[0]?.url}" alt="${track.name}" style="width:100px; height:100px;">
            <h5 style='font-size: 0.5rem;' >Nom de la cançó: ${track.name}</h5>
            <p style ='font-size: 0.5rem;'>Artista: ${track.artists[0]?.name}</p>
            <p style ='font-size: 0.5rem;'>Àlbum: ${track.album.name}</p>
            <button class="afegir-canço" data-song-id="${track.id}">+ Afegir Canço</button>
          </div>
        `;
        // Add click listener to "Add Song" button
        const addSongButton = trackElement.querySelector(".afegir-canço");
        addSongButton.addEventListener("click", (event) => {
          event.stopPropagation(); // Prevent triggering artist info fetch
          addSongToLocalStorage(track.id);
        });

        // Add click event to fetch and display artist information
        trackElement.addEventListener("click", () => {
          getArtistInfo(track.artists[0].id); // Fetch artist info
        });

        // Append the track element to the result section
        resultSection.appendChild(trackElement);


      });
    })
    .catch((error) => {
      console.error("Error al buscar cançons:", error);
    });
};


// Clear Search Results
btnClear.addEventListener("click", () => {
  inputTrackObj.value = ""; // Clear input
  resultSection.innerHTML = ""; // Clear results
  artistDetails.innerHTML = ""; // Clear artist details
});

//Playlist
// Initialize
getSpotifyAccessToken(clientId, clientSecret);
btnBuscar.addEventListener("click", search);

const autoritzar = function () {
  const authUrl =
    URL +
    `?client_id=${clientId}` +
    `&response_type=token` +
    `&redirect_uri=${redirectUri}` +
    `&scope=${scopes}`;


  window.location.assign(authUrl);
  
};

btnPlaylist.addEventListener("click", autoritzar);
