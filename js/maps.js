/**
 * Maps Logic for Details Page
 */

document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('mapContainer');
    if (!mapContainer) return; // Only run on pages with a map container

    // Get UMKM ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    if (id) {
        const umkm = getUMKMById(id);
        if (umkm && umkm.lat && umkm.lng) {
            // Using Google Maps Embed API or simple iframe approach
            // Simple iframe using google maps coordinates
            const embedUrl = `https://maps.google.com/maps?q=${umkm.lat},${umkm.lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
            
            mapContainer.innerHTML = `
                <iframe 
                    width="100%" 
                    height="100%" 
                    frameborder="0" 
                    scrolling="no" 
                    marginheight="0" 
                    marginwidth="0" 
                    src="${embedUrl}"
                    style="border-radius: var(--radius-md);"
                ></iframe>
            `;
            
            const btnMaps = document.getElementById('btnOpenMaps');
            if(btnMaps) {
                btnMaps.href = `https://www.google.com/maps/search/?api=1&query=${umkm.lat},${umkm.lng}`;
            }
        } else {
            mapContainer.innerHTML = `<div class="flex items-center justify-center h-full text-muted"><p>Lokasi Peta tidak tersedia</p></div>`;
        }
    }
});
