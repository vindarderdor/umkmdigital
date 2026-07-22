/**
 * Dashboard Admin Stats Logic
 */
document.addEventListener('DOMContentLoaded', async () => {
    const statsContainer = document.getElementById('statsContainer');
    if (!statsContainer) return; // Not on dashboard page

    try {
        // Fetch data
        const [umkmData, productsData, docsData] = await Promise.all([
            getUMKM(),
            getProducts(),
            getDocs()
        ]);

        // Calculate stats
        const umkmCount = umkmData.length;
        const productsCount = productsData.length;
        const docsCount = docsData.length;
        
        // Count unique categories
        const categories = new Set(umkmData.map(u => u.category));
        const categoryCount = categories.size;

        // Update DOM
        const elUmkm = document.getElementById('statUmkmCount');
        const elProduct = document.getElementById('statProductCount');
        const elCategory = document.getElementById('statCategoryCount');
        const elDocs = document.getElementById('statDocsCount');

        if (elUmkm) elUmkm.setAttribute('data-target', umkmCount);
        if (elProduct) elProduct.setAttribute('data-target', productsCount);
        if (elCategory) elCategory.setAttribute('data-target', categoryCount);
        if (elDocs) elDocs.setAttribute('data-target', docsCount);

        // Re-initialize counters if function exists
        if (typeof initCounter === 'function') {
            initCounter();
        }

    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        showToast('Gagal memuat statistik dashboard', 'error');
    }
});
