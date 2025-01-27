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
        getPlaylistUser();   //remove
        return data.id; // Return user ID
    } catch (error) {
        console.error("Error fetching user profile:", error);
    }
};


// Fetch playlists for the current user
const getPlaylist = async function () {
    getUser().then(function () {
        getPlaylistUser();
    });

    try {
        const user_id = await getUser(); // Get user ID dynamically
        const url = `https://api.spotify.com/v1/users/${user_id}/playlists`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accesToken}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const playlists = await response.json();
        console.log("Playlists:", playlists);

        // Render playlists
       // const renderPlaylists = function (playlists) {
            const playlistContainer = document.querySelector(".playlist");
            playlistContainer.innerHTML = ""; // Clear previous playlists

            playlists.items.forEach((playlist) => {
                const playlistDiv = document.createElement("div");
                playlistDiv.textContent = playlist.name; 
                playlistDiv.dataset.id = playlist.id; // Store playlist ID for reference
                playlistDiv.classList.add("playlist-item");
            
                playlistDiv.addEventListener("click", () => getPlaylistTracks(playlist.id, playlist.name));
                // Display playlist name
        
                playlistContainer.appendChild(playlistDiv);
            
            });
            
            // Get 
            const getPlaylistTracks = async function (playlistId, playlistName) {
                const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
            
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
                    console.log(`Tracks for playlist "${playlistName}":`, data);
                

                } catch (error) {
                    console.error(`Error fetching tracks for playlist ${playlistName}:`, error);
                }
            };
        
    } catch (error) {
        console.error("Error fetching playlists:", error);
    }
};

const getPlaylistUser = function () {
    console.log();
}


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

        const renderSelectedTracks = async function () {
            //  Get track IDs from localStorage
            let trackIds = localStorage.getItem("savedSongs");
            if (!trackIds) {
                console.log("No tracks found in localStorage.");
                const container = document.querySelector(".cancons");
                container.innerHTML = "<p>No tracks available in localStorage.</p>";
                return;
            }

            // Replace `;` with `,`
            trackIds = trackIds.replaceAll(";", ",");

            // Fetch track details from Spotify 
            const url = `${API_URL_SEVERALTRACKS}?ids=${trackIds}`;
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

                const tracks = await response.json();

                // Render tracks in cancions section
                const container = document.querySelector(".cancons");
                container.innerHTML = ""; // Clear previous content

                tracks.tracks.forEach((track) => {
                    // Create a container for each track
                    const trackDiv = document.createElement("div");
                    trackDiv.classList.add("track");

                    // Create track details
                    trackDiv.innerHTML = `
                <p style="font-size: 0.7rem;">${track.name} - ${track.artists[0].name}</p>
                
            `;

                    // Add event listeners for ADD and DEL buttons
                    const addButton = trackDiv.querySelector(".add");
                    const delButton = trackDiv.querySelector(".del");

             
                    // Append  to the container
                    container.appendChild(trackDiv);
                });
            } catch (error) {
                console.error("Error fetching selected tracks:", error);
            }
        };

        renderSelectedTracks(tracks);
    } catch (error) {
        console.error("Error fetching tracks:", error);
    }
};


// Retrieve and process selected tracks from localStorage
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


// Initialize the playlist page
async function init() {
    await getPlaylist(); // Load and display playlists
    getSelectedTrack(); // Load and display saved tracks
}
document.addEventListener("DOMContentLoaded", init);
// Call the initializer function when the page loads
init();
