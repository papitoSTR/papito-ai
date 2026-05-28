const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Membaca database JSON
function readDatabase() {
    if (!fs.existsSync(DB_FILE)) {
        const defaultData = [{ email: 'free@gmail.com', pass: 'free', role: 'user' }];
        fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2));
        return defaultData;
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

// Menulis ke database JSON
function writeDatabase(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// API Ambil User
app.get('/api/users', (req, res) => {
    res.json(readDatabase());
});

// API Tambah User
app.post('/api/users', (req, res) => {
    const { email, pass } = req.body;
    if (!email || !pass) return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
    
    let db = readDatabase();
    if (db.some(user => user.email === email)) {
        return res.status(400).json({ success: false, message: 'User sudah ada' });
    }
    
    db.push({ email, pass, role: 'user' });
    writeDatabase(db);
    res.json({ success: true, message: 'Berhasil disimpan' });
});

// API Hapus User
app.delete('/api/users', (req, res) => {
    const { email } = req.body;
    let db = readDatabase();
    const initialLength = db.length;
    
    db = db.filter(user => user.email !== email);
    if (db.length === initialLength) return res.status(400).json({ success: false, message: 'Gagal menghapus' });
    
    writeDatabase(db);
    res.json({ success: true, message: 'Berhasil dihapus' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
