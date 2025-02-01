const accesToken = window.location.href.split("access_token=")[1];
const API_URL_SEVERALTRACKS = "https://api.spotify.com/v1/tracks";
console.log(accesToken);



// Retrieve track IDs from localStorage
function getIdTracksLocalStorage() {
    return localStorage.getItem("savedSongs");
}

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
        //La variable user_id l'obtenim de l'endpoint Get Current User's Profile
      
      
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
            nextUrl = data.next; // Get the next page URL
        

        console.log("Playlists:", playlists);

        // Render playlists
        const playlistContainer = document.querySelector(".playlist");
        playlistContainer.innerHTML = ""; // Clear previous playlists

        playlists.forEach((playlist) => {
            const playlistDiv = document.createElement("div");
            playlistDiv.textContent = playlist.name;
            playlistDiv.dataset.id = playlist.id; // Store playlist ID for reference
            playlistDiv.classList.add("playlist-item");

            playlistDiv.addEventListener("click", () => getPlaylistTracks(playlist.id, playlist.name));
            // Display playlist name

            playlistContainer.appendChild(playlistDiv);
        });


    } catch (error) {
        console.error("Error fetching playlists:", error);
    }
};

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


// Fetch and display tracks from localStorage
function getSelectedTrack() {
    let llistaTracks = getIdTracksLocalStorage();
    if (!llistaTracks) {
        console.log("No tracks found in localStorage.");
        return;
    }
    console.log("Track list:", llistaTracks);
    llistaTracks = llistaTracks.replaceAll(";", ",");
    getTrack(llistaTracks); // Fetch and display tracks
}


 // Remove a track from a playlist
    const removeTrackFromPlaylist = async function (playlistId, trackUri) {
        const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
        try {
            const response = await fetch(url, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${accesToken}`,
                    
                },
                body: JSON.stringify({
                    tracks: [{ uri: trackUri }],
                }),
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            alert("Track removed successfully.");
        }
        catch (error) {
            alert("Error removing track from playlist:", error);
        }
    };

// Fetch and render tracks
const getTrack = async function (llistaTracks) {
    const url_endpoint = `${API_URL_SEVERALTRACKS}?ids=${llistaTracks}`;

    try {
        const response = await fetch(url_endpoint, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accesToken}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const tracks = await response.json();
        console.log("Tracks:", tracks);


        // Render tracks
        // Fetch and the songs to  "Cançons" section

       
    } catch (error) {
        console.error("Error fetching tracks:", error);
    }
};


// Retrieve and process selected tracks from localStorage


// Initialize the playlist page
async function init() {
    await getPlaylist(); // Load and display playlists
    getSelectedTrack(); // Load and display saved tracks
}
document.addEventListener("DOMContentLoaded", init);
// Call the initializer function when the page loads
init();
