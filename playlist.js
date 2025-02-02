const accesToken = window.location.href.split("access_token=")[1];
const API_URL_SEVERALTRACKS = "https://api.spotify.com/v1/tracks";
console.log(accesToken);

// Get track IDs from localStorage
function getIdTracksLocalStorage() {
    return localStorage.getItem("savedSongs");
}
// Add event listener to the return button
document.querySelector(".tornar").addEventListener("click", function () {
    window.location.href = "spotify.html"; // Redirect to spotify.html
});

// Fetch user profile to get user ID
const getUser = async function () {
    const url = "https://api.spotify.com/v1/me";

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accesToken}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("User ID:", data.id);
        
        return data.id; // Return user ID
    } catch (error) {
        console.error("Error fetching user profile:", error);
    }
};

// Fetch playlists for the current user
const getPlaylist = async function () {
    try {
        const user_id = await getUser(); // Get user ID dynamically
        const url = `https://api.spotify.com/v1/users/${user_id}/playlists`;
        let playlists = [];
      
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accesToken}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        playlists = playlists.concat(data.items);

        console.log("Playlists:", playlists);

        // Render playlists
        const playlistContainer = document.querySelector(".playlist");
        playlistContainer.innerHTML = ""; // Clear previous playlists

        playlists.forEach((playlist) => {
            const playlistDiv = document.createElement("div");
            playlistDiv.textContent = playlist.name;
            playlistDiv.dataset.id = playlist.id; 
            playlistDiv.classList.add("playlist-item");

            playlistDiv.addEventListener("click", () => {
                getPlaylistTracks(playlist.id, playlist.name);
                getSelectedTrack(); 
            });

            playlistContainer.appendChild(playlistDiv);
        });

    } catch (error) {
        console.error("Error fetching playlists:", error);
    }
};

// Fetch tracks from a playlist
const getPlaylistTracks = async function (playlistId, playlistName) {
    const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accesToken}`,
            },
        });

        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

        const data = await response.json();
        console.log(`Tracks for playlist "${playlistName}":`, data);

        const canconsContainer = document.querySelector(".cancons");
        canconsContainer.innerHTML = ""; 

        data.items.forEach((item) => {
            const track = item.track;
            const trackDiv = document.createElement("div");
            trackDiv.classList.add("track");

            const trackName = document.createElement("p");
            trackName.textContent = `${track.name} - ${track.artists[0].name}`;

            const trackDate = document.createElement("p");
            trackDate.textContent = `Added on: ${new Date(item.added_at).toLocaleDateString()}`;

            const delButton = document.createElement("button");
            delButton.classList.add("del");
            delButton.textContent = "DEL";
            delButton.addEventListener("click", async () => {
                const confirmDelete = confirm(`Are you sure you want to remove "${track.name}"?`);
                if (confirmDelete) {
                    await removeTrackFromPlaylist(playlistId, track.uri);
                    getPlaylistTracks(playlistId, playlistName);
                }
            });

            trackDiv.appendChild(trackName);
            trackDiv.appendChild(trackDate);
            trackDiv.appendChild(delButton);
            canconsContainer.appendChild(trackDiv);
        });
    } catch (error) {
        console.error(`Error fetching tracks for playlist ${playlistName}:`, error);
    }
};

// Add songs from localStorage to .cancionsSeleccionada

function getSelectedTrack() {
    let trackIds = getIdTracksLocalStorage();
    if (!trackIds) {
        console.log("No tracks found in localStorage.");
        const cancionsSeleccionadaContainer = document.querySelector(".cancionsSeleccionada");
        cancionsSeleccionadaContainer.innerHTML = "<p>No tracks available in localStorage.</p>";
        return;
    }

    trackIds = trackIds.replaceAll(";", ",");
    const url = `${API_URL_SEVERALTRACKS}?ids=${trackIds}`;

    fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accesToken}`,
        },
    })
        .then(response => {
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
            return response.json();
        })
        .then(data => {
            const cancionsSeleccionadaContainer = document.querySelector(".cançonsSeleccionades");
            cancionsSeleccionadaContainer.innerHTML = ""; // Clear previous content

            data.tracks.forEach((track) => {
                const trackDiv = document.createElement("div");
                trackDiv.classList.add("track");

                const trackName = document.createElement("p");
                trackName.textContent = `${track.name} - ${track.artists[0].name}`;

                // ADD Button
                const addButton = document.createElement("button");
                addButton.classList.add("add");
                addButton.textContent = "ADD";
                addButton.addEventListener("click", () => {
                    const selectedPlaylist = document.querySelector(".playlist-item.selected");
                    if (!selectedPlaylist) {
                        alert("You must select a playlist first!");
                        return;
                    }

                    const playlistId = selectedPlaylist.dataset.id;
                    const confirmAdd = confirm(`Are you sure you want to add "${track.name}" to this playlist?`);
                    if (confirmAdd) {
                        addTrackToPlaylist(track.uri, playlistId);
                    }
                });

                // DEL Button to remove from localStorage
                const delButton = document.createElement("button");
                delButton.classList.add("del");
                delButton.textContent = "DEL";
                delButton.addEventListener("click", () => {
                    const confirmDelete = confirm(`Are you sure you want to remove "${track.name}" from localStorage?`);
                    if (confirmDelete) {
                        removeTrackFromLocalStorage(track.id);
                        getSelectedTrack();
                    }
                });

                trackDiv.appendChild(trackName);
                trackDiv.appendChild(addButton);
                trackDiv.appendChild(delButton);
                cancionsSeleccionadaContainer.appendChild(trackDiv);
            });
        })
        .catch(error => console.error("Error fetching selected tracks:", error));
}

// Add track to the selected playlist
const addTrackToPlaylist = async function (trackUri, playlistId) {
    const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accesToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ uris: [trackUri] }),
        });

        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

        alert("The song has been successfully added to the selected playlist.");

        // Remove from LocalStorage after adding
        removeTrackFromLocalStorage(trackUri);
        getSelectedTrack();
    } catch (error) {
        console.error(`Error adding track:`, error);
    }
};

// Event listener to track playlist selection
document.addEventListener("click", function (event) {
    if (event.target.classList.contains("playlist-item")) {
        document.querySelectorAll(".playlist-item").forEach(item => item.classList.remove("selected"));
        event.target.classList.add("selected");
    }
});


// Remove track from localStorage
function removeTrackFromLocalStorage(trackId) {
    let trackIds = getIdTracksLocalStorage();
    if (!trackIds) return;

    let trackArray = trackIds.split(";");
    trackArray = trackArray.filter(id => id !== trackId);
    localStorage.setItem("savedSongs", trackArray.join(";"));
}

// Initialize the playlist page
async function init() {
    await getPlaylist(); 
    getSelectedTrack(); // Load and display saved tracks in .cancionsSeleccionada
}
document.addEventListener("DOMContentLoaded", init);
init();
