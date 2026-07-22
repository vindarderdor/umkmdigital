/**
 * Admin Dashboard Logic (CRUD Operations)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Session Check
    if (typeof checkAuth === 'function') {
        checkAuth();
    }

    // Sidebar Toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (typeof logout === 'function') logout();
            window.location.href = '../login.html';
        });
    }

    // Image Upload Preview Logic (Shared)
    const imageInput = document.getElementById('imageInput');
    const previewImg = document.getElementById('previewImg');
    const uploadPlaceholder = document.querySelector('.upload-placeholder');
    let currentBase64 = '';

    if (imageInput && previewImg && uploadPlaceholder) {
        imageInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                // Validation
                const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
                if (!validTypes.includes(file.type)) {
                    showToast('Format file tidak didukung! Gunakan JPG, PNG, atau WEBP.', 'error');
                    e.target.value = '';
                    return;
                }

                if (file.size > 5 * 1024 * 1024) { // 5MB
                    showToast('Ukuran file maksimal 5MB!', 'error');
                    e.target.value = '';
                    return;
                }

                try {
                    const base64 = await compressImage(file);
                    currentBase64 = base64;
                    previewImg.src = base64;
                    previewImg.style.display = 'block';
                    uploadPlaceholder.style.display = 'none';
                } catch (error) {
                    showToast('Gagal memproses gambar.', 'error');
                }
            }
        });
    }

    function resetImagePreview() {
        currentBase64 = '';
        if (imageInput) imageInput.value = '';
        if (previewImg) {
            previewImg.src = '';
            previewImg.style.display = 'none';
        }
        if (uploadPlaceholder) {
            uploadPlaceholder.style.display = 'flex';
        }
    }

    // --- Dashboard Stats Logic ---
    const statsContainer = document.getElementById('statsContainer');
    if (statsContainer) {
        const umkm = getUMKM();
        const products = getProducts();
        const docs = getDocs();
        
        // Count Categories
        const categories = new Set(umkm.map(u => u.category));

        document.getElementById('statUmkmCount').setAttribute('data-target', umkm.length);
        document.getElementById('statProductCount').setAttribute('data-target', products.length);
        document.getElementById('statCategoryCount').setAttribute('data-target', categories.size);
        document.getElementById('statDocsCount').setAttribute('data-target', docs.length);
    }

    // ==========================================
    // 1. CRUD UMKM Logic
    // ==========================================
    const umkmTableBody = document.getElementById('umkmTableBody');
    if (umkmTableBody) {
        let umkmData = getUMKM();
        let deleteTargetId = null;

        function renderUMKMTable() {
            umkmTableBody.innerHTML = '';
            if (umkmData.length === 0) {
                umkmTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">Belum ada data UMKM</td></tr>`;
                return;
            }

            umkmData.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>
                        <div class="flex items-center gap-2">
                            <img src="${item.image}" alt="${item.name}" style="width: 40px; height: 40px; border-radius: var(--radius-sm); object-fit: cover;">
                            <span>${item.name}</span>
                        </div>
                    </td>
                    <td>${item.owner}</td>
                    <td><span class="badge badge-primary">${item.category}</span></td>
                    <td>RT ${item.rt}/RW ${item.rw}</td>
                    <td>
                        <div class="action-btns">
                            <button class="btn-icon edit" onclick="editUMKM(${item.id})" title="Edit"><i class="fas fa-edit"></i></button>
                            <button class="btn-icon delete" onclick="deleteUMKM(${item.id})" title="Hapus"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                `;
                umkmTableBody.appendChild(tr);
            });
        }
        renderUMKMTable();

        const umkmForm = document.getElementById('umkmForm');
        if (umkmForm) {
            umkmForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const id = document.getElementById('umkmId').value;
                const name = document.getElementById('name').value;
                const owner = document.getElementById('owner').value;
                const category = document.getElementById('category').value;
                const desc = document.getElementById('desc').value;
                const phone = document.getElementById('phone').value;
                const wa = document.getElementById('wa').value;
                const hours = document.getElementById('hours').value;
                const address = document.getElementById('address').value;
                const rt = document.getElementById('rt').value;
                const rw = document.getElementById('rw').value;
                const lat = document.getElementById('lat').value;
                const lng = document.getElementById('lng').value;
                const year = document.getElementById('year').value;

                if (!currentBase64 && !id) {
                    showToast('Wajib mengunggah foto!', 'error');
                    return;
                }

                if (id) {
                    const index = umkmData.findIndex(u => u.id == id);
                    if (index !== -1) {
                        umkmData[index] = {
                            ...umkmData[index],
                            name, owner, category, desc, phone, wa, hours, address, rt, rw, lat, lng, year,
                            image: currentBase64 || umkmData[index].image
                        };
                        showToast('Berhasil Edit Data UMKM', 'success');
                    }
                } else {
                    umkmData.push({
                        id: Date.now(),
                        name, owner, category, desc, phone, wa, hours, address, rt, rw, lat, lng, year,
                        image: currentBase64
                    });
                    showToast('Berhasil Menambah Data UMKM', 'success');
                }

                saveUMKM(umkmData);
                renderUMKMTable();
                closeModal('umkmModal');
            });
        }

        window.editUMKM = (id) => {
            const item = umkmData.find(u => u.id == id);
            if (item) {
                document.getElementById('modalTitle').innerText = 'Edit UMKM';
                document.getElementById('umkmId').value = item.id;
                document.getElementById('name').value = item.name;
                document.getElementById('owner').value = item.owner;
                document.getElementById('category').value = item.category;
                document.getElementById('desc').value = item.desc;
                document.getElementById('phone').value = item.phone;
                document.getElementById('wa').value = item.wa;
                document.getElementById('hours').value = item.hours;
                document.getElementById('address').value = item.address;
                document.getElementById('rt').value = item.rt;
                document.getElementById('rw').value = item.rw;
                document.getElementById('lat').value = item.lat || '';
                document.getElementById('lng').value = item.lng || '';
                document.getElementById('year').value = item.year || '';
                
                currentBase64 = item.image;
                if(previewImg) {
                    previewImg.src = item.image;
                    previewImg.style.display = 'block';
                }
                if(uploadPlaceholder) uploadPlaceholder.style.display = 'none';

                openModal('umkmModal');
            }
        };

        window.deleteUMKM = (id) => {
            deleteTargetId = id;
            openModal('deleteModal');
        };

        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', () => {
                if (deleteTargetId) {
                    umkmData = umkmData.filter(u => u.id != deleteTargetId);
                    // Cascade delete products
                    let products = getProducts();
                    products = products.filter(p => p.umkmId != deleteTargetId);
                    saveProducts(products);

                    saveUMKM(umkmData);
                    renderUMKMTable();
                    closeModal('deleteModal');
                    showToast('Berhasil Hapus Data UMKM', 'success');
                    deleteTargetId = null;
                }
            });
        }
        
        const btnCreate = document.getElementById('btnCreateUMKM');
        if(btnCreate) {
             btnCreate.addEventListener('click', () => {
                document.getElementById('modalTitle').innerText = 'Tambah UMKM Baru';
                if(umkmForm) umkmForm.reset();
                document.getElementById('umkmId').value = '';
                resetImagePreview();
                openModal('umkmModal');
            });
        }
    }

    // ==========================================
    // 2. CRUD Produk Logic
    // ==========================================
    const productTableBody = document.getElementById('productTableBody');
    if (productTableBody) {
        let productsData = getProducts();
        const umkmData = getUMKM();
        let deleteTargetId = null;

        // Populate UMKM Select
        const umkmSelect = document.getElementById('umkmSelect');
        if (umkmSelect) {
            umkmData.forEach(u => {
                const opt = document.createElement('option');
                opt.value = u.id;
                opt.innerText = u.name;
                umkmSelect.appendChild(opt);
            });
        }

        function renderProductTable() {
            productTableBody.innerHTML = '';
            if (productsData.length === 0) {
                productTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">Belum ada data produk</td></tr>`;
                return;
            }

            productsData.forEach(item => {
                const tr = document.createElement('tr');
                const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.price);
                tr.innerHTML = `
                    <td>
                        <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; border-radius: var(--radius-sm); object-fit: cover;">
                    </td>
                    <td class="font-bold">${item.name}</td>
                    <td><span class="badge badge-accent"><i class="fas fa-store"></i> ${item.umkmName}</span></td>
                    <td class="text-primary font-bold">${formattedPrice}</td>
                    <td>
                        <div class="action-btns">
                            <button class="btn-icon edit" onclick="editProduct(${item.id})" title="Edit"><i class="fas fa-edit"></i></button>
                            <button class="btn-icon delete" onclick="deleteProduct(${item.id})" title="Hapus"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                `;
                productTableBody.appendChild(tr);
            });
        }
        renderProductTable();

        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const id = document.getElementById('productId').value;
                const umkmId = document.getElementById('umkmSelect').value;
                const name = document.getElementById('name').value;
                const price = document.getElementById('price').value;

                if (!currentBase64 && !id) {
                    showToast('Wajib mengunggah foto produk!', 'error');
                    return;
                }
                
                const selectedUMKM = umkmData.find(u => u.id == umkmId);
                const umkmName = selectedUMKM ? selectedUMKM.name : 'Unknown UMKM';

                if (id) {
                    const index = productsData.findIndex(p => p.id == id);
                    if (index !== -1) {
                        productsData[index] = {
                            ...productsData[index],
                            umkmId, umkmName, name, price,
                            image: currentBase64 || productsData[index].image
                        };
                        showToast('Berhasil Edit Data Produk', 'success');
                    }
                } else {
                    productsData.push({
                        id: Date.now(),
                        umkmId, umkmName, name, price,
                        image: currentBase64
                    });
                    showToast('Berhasil Menambah Produk Baru', 'success');
                }

                saveProducts(productsData);
                renderProductTable();
                closeModal('productModal');
            });
        }

        window.editProduct = (id) => {
            const item = productsData.find(p => p.id == id);
            if (item) {
                document.getElementById('modalTitle').innerText = 'Edit Produk';
                document.getElementById('productId').value = item.id;
                document.getElementById('umkmSelect').value = item.umkmId;
                document.getElementById('name').value = item.name;
                document.getElementById('price').value = item.price;
                
                currentBase64 = item.image;
                if(previewImg) {
                    previewImg.src = item.image;
                    previewImg.style.display = 'block';
                }
                if(uploadPlaceholder) uploadPlaceholder.style.display = 'none';

                openModal('productModal');
            }
        };

        window.deleteProduct = (id) => {
            deleteTargetId = id;
            openModal('deleteModal');
        };

        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', () => {
                if (deleteTargetId) {
                    productsData = productsData.filter(p => p.id != deleteTargetId);
                    saveProducts(productsData);
                    renderProductTable();
                    closeModal('deleteModal');
                    showToast('Berhasil Hapus Produk', 'success');
                    deleteTargetId = null;
                }
            });
        }
        
        const btnCreate = document.getElementById('btnCreateProduct');
        if(btnCreate) {
             btnCreate.addEventListener('click', () => {
                if (umkmData.length === 0) {
                    showToast('Tambahkan UMKM terlebih dahulu!', 'error');
                    return;
                }
                document.getElementById('modalTitle').innerText = 'Tambah Produk Baru';
                if(productForm) productForm.reset();
                document.getElementById('productId').value = '';
                resetImagePreview();
                openModal('productModal');
            });
        }
    }

    // ==========================================
    // 3. CRUD Dokumentasi Logic
    // ==========================================
    const docTableBody = document.getElementById('docTableBody');
    if (docTableBody) {
        let docsData = getDocs();
        let deleteTargetId = null;

        function renderDocTable() {
            docTableBody.innerHTML = '';
            if (docsData.length === 0) {
                docTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center;">Belum ada dokumentasi</td></tr>`;
                return;
            }

            docsData.forEach(item => {
                const tr = document.createElement('tr');
                const dateObj = new Date(item.date);
                const formattedDate = isNaN(dateObj) ? item.date : dateObj.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
                
                tr.innerHTML = `
                    <td>
                        <img src="${item.image}" alt="${item.title}" style="width: 80px; height: 50px; border-radius: var(--radius-sm); object-fit: cover;">
                    </td>
                    <td class="font-bold">${item.title}</td>
                    <td>${formattedDate}</td>
                    <td>
                        <div class="action-btns">
                            <button class="btn-icon delete" onclick="deleteDoc(${item.id})" title="Hapus"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                `;
                docTableBody.appendChild(tr);
            });
        }
        renderDocTable();

        const docForm = document.getElementById('docForm');
        if (docForm) {
            docForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const id = document.getElementById('docId').value;
                const title = document.getElementById('title').value;
                const date = document.getElementById('date').value;

                if (!currentBase64 && !id) {
                    showToast('Wajib mengunggah foto kegiatan!', 'error');
                    return;
                }
                
                if (id) {
                    const index = docsData.findIndex(d => d.id == id);
                    if (index !== -1) {
                        docsData[index] = {
                            ...docsData[index],
                            title, date,
                            image: currentBase64 || docsData[index].image
                        };
                        showToast('Berhasil Edit Dokumentasi', 'success');
                    }
                } else {
                    docsData.push({
                        id: Date.now(),
                        title, date,
                        image: currentBase64
                    });
                    showToast('Berhasil Menambah Dokumentasi Baru', 'success');
                }

                saveDocs(docsData);
                renderDocTable();
                closeModal('docModal');
            });
        }

        window.deleteDoc = (id) => {
            deleteTargetId = id;
            openModal('deleteModal');
        };

        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', () => {
                if (deleteTargetId) {
                    docsData = docsData.filter(d => d.id != deleteTargetId);
                    saveDocs(docsData);
                    renderDocTable();
                    closeModal('deleteModal');
                    showToast('Berhasil Hapus Dokumentasi', 'success');
                    deleteTargetId = null;
                }
            });
        }
        
        const btnCreate = document.getElementById('btnCreateDoc');
        if(btnCreate) {
             btnCreate.addEventListener('click', () => {
                document.getElementById('modalTitle').innerText = 'Tambah Foto Baru';
                if(docForm) docForm.reset();
                document.getElementById('docId').value = '';
                resetImagePreview();
                openModal('docModal');
            });
        }
    }
});
