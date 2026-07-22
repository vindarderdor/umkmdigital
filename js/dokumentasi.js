/**
 * Dokumentasi Page Logic & Supabase CRUD
 */

// --- Supabase Data Fetchers & Savers ---
async function getDocs() {
    try {
        const { data, error } = await supabase
            .from('documentation')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching documentation:', error.message);
        showToast('Gagal memuat data dokumentasi', 'error');
        return [];
    }
}

async function insertDoc(docData) {
    try {
        showLoading();
        const { error } = await supabase.from('documentation').insert([docData]);
        if (error) throw error;
        showToast('Berhasil menambahkan dokumentasi', 'success');
    } catch (error) {
        console.error('Error inserting documentation:', error.message);
        showToast('Gagal menambahkan dokumentasi', 'error');
        throw error;
    } finally {
        hideLoading();
    }
}

async function deleteDoc(id) {
    try {
        showLoading();
        const { error } = await supabase
            .from('documentation')
            .delete()
            .eq('id', id);
        if (error) throw error;
        showToast('Berhasil menghapus dokumentasi', 'success');
    } catch (error) {
        console.error('Error deleting documentation:', error.message);
        showToast('Gagal menghapus dokumentasi', 'error');
        throw error;
    } finally {
        hideLoading();
    }
}

// --- Public Page UI Logic ---
document.addEventListener('DOMContentLoaded', async () => {
    const docsList = document.getElementById('docsList');
    if (!docsList) return; // Not on the dokumentasi public page

    showLoading();
    const docs = await getDocs();
    hideLoading();

    if (docs.length === 0) {
        docsList.innerHTML = `<div class="col-span-full text-center py-5"><p class="text-muted">Belum ada dokumentasi.</p></div>`;
        return;
    }

    docs.forEach((doc, index) => {
        const delay = (index % 5) + 1;
        const card = document.createElement('div');
        card.className = `card reveal stagger-${delay}`;
        
        // Format Date
        const dateObj = new Date(doc.date);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = isNaN(dateObj) ? doc.date : dateObj.toLocaleDateString('id-ID', options);

        card.innerHTML = `
            <div class="card-img-wrapper" style="height: 250px;">
                <img src="${doc.image || 'https://via.placeholder.com/800'}" alt="${doc.title}" class="card-img">
            </div>
            <div class="card-body" style="padding: 1.25rem;">
                <h4 style="font-size: 1.1rem; margin-bottom: 0.5rem; font-weight: 600;">${doc.title}</h4>
                <small class="text-muted flex items-center gap-2"><i class="fas fa-calendar-alt text-primary"></i> ${formattedDate}</small>
            </div>
        `;
        docsList.appendChild(card);
    });
    
    setTimeout(() => { if (typeof initScrollReveal === 'function') initScrollReveal(); }, 100);
});
