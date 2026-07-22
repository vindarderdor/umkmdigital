/**
 * Supabase Storage Handler
 */

function compressImage(file, maxWidth = 800) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to compressed WebP
                resolve(canvas.toDataURL('image/webp', 0.8));
            };
        };
    });
}

function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}

async function uploadImage(file, bucket = 'umkm-images') {
    try {
        // 1. Compress image to Base64 (WebP)
        const base64 = await compressImage(file);
        
        // 2. Convert Base64 back to Blob
        const blob = dataURLtoBlob(base64);
        
        // 3. Generate unique filename
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.webp`;

        // 4. Upload to Supabase
        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(fileName, blob, {
                contentType: 'image/webp',
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            throw uploadError;
        }

        // 5. Get Public URL
        const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);

        return data.publicUrl;
    } catch (error) {
        console.error('Error uploading image:', error.message);
        throw error;
    }
}
