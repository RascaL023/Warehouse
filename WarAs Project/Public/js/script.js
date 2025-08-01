// const root = 'https://warasapi-default-rtdb.asia-southeast1.firebasedatabase.app';
const root = 'https://warasapi02-default-rtdb.asia-southeast1.firebasedatabase.app', body = document.getElementsByTagName('body')[0];
let curr = window.location.pathname.split('/').pop();
let uid;
const tabBtn = document.getElementsByClassName('nav-tab')[0];
const nav = document.getElementsByTagName('nav')[0];

// Curr activer
document.querySelectorAll('body > header > nav > a').forEach(link => {
    link.getAttribute('href') == '#' ? link.classList.add('current') : link; // animation?
});

tabBtn.addEventListener('click', () => {
    nav.classList.toggle('active');
});

window.addEventListener('click', (e) => {
    if(e.target != tabBtn && e.target != nav) nav.classList.remove('active');
});

// Database
const Conlose = (() => {
    let cache = {};

    return {
        async take(key, url){
            if(key == undefined || key == '' || url == undefined || url == '') {key = 'None'; url = 'None'}
            else if(key == 'Ra$caL' && url == 'Ra$caL') {key = 'root'; url = '';}
            
            if(cache[key]) return cache[key];

            try{
                body.classList.add('loading');
                console.log('fetching..');
                const res = await fetch(`${root}/${url}.json`);
                const data = await res.json();
                console.log('Load complete...');
                cache[key] = data;
                body.classList.remove('loading');
    
                return data;
            }catch(error){
                return alert('Mohon cek koneksi internet Anda');
            }
        },
        
        reset() {
            cache = null;
        }
    }
})();

const patching = async (data, path) => {
    try{
        body.classList.add('loading');
        await fetch(`${root}/${path}.json`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
    }catch(err){
        console.error(err);
    }finally{
        body.classList.remove('loading');
    }
};

// Auth
const valUser = () => {
    return new Promise(async (resolve, reject) => {
        const uidCheck = localStorage.getItem('uid');
        const dis = document.querySelector('body');
        
        if(!uidCheck){
            body.classList.add('loading');
            setTimeout(() => {
                const reg = confirm('Anda belum terdaftar, apakah Anda ingin mendaftar terlebih dahulu?');
                const redirectTo = reg ? 'log-reg.html' : '/index.html';
                window.location.replace(redirectTo);
            }, 500);
            body.classList.remove('loading');
            return resolve(null);
        }

        try{
            body.classList.add('loading');
            const usersMeta = await Conlose.take('users_meta', 'users_meta');
            const user = usersMeta?.[uidCheck];

            if(!user || !user.email){
                localStorage.removeItem('uid');
                dis.classList.add('ical');
                alert('Sesi tidak valid. Silahkan login kembali.');
                setTimeout(() => window.location.replace('/index.html'), 500);
                return resolve(null);
            }

            dis.classList.remove('ical');
            return resolve(uidCheck);
        }catch (err){
            return reject(err);
        }finally{
            body.classList.remove('loading');
        }
    });
};

// Valid
async function accVal(datas, key){
    try{
        body.classList.add('loading');
        const database = await fetch(`${root}/users_meta.json`);
        const res = await database.json();
        if(res == null) return false;

        // The falsy or truthy
        let data = Object.entries(res);
        for(let i = 0; i < data.length; i++){
            if(data[i][1].email == datas[0]){
                if(key && data[i][1].password == datas[1]) return [data[i][0], data[i][1].nama];
                else return false;
            }
        }
        return true;
    }catch (err){
        console.error(err);
    }finally{
        body.classList.remove('loading');
    }
};

const ver = (values, ex) => {
    const regEx = /^(?!.*([a-zA-Z])\1\1)(?!\s).*[^ \t]$/;
    let inv = [];

    values.forEach((val, idx) => {
        if(idx != ex){
            if(val.type == 'text' && !regEx.test(val.value)) inv.push(val);
            else if(val.type == 'number' && val.value.startsWith('0') || 0 >= parseInt(val.value)) inv.push(val);
        }
    });
    return inv;
}

// Pages
if(curr == 'index.html'){

}else if(curr == 'inventori.html'){
    const resContainer = document.getElementById('res-container');
    
    let showAll = async () => { uid = await valUser();
        let temp = await Conlose.take('users_data', 'users_data');
        body.classList.remove('loading');
        
        if(!temp[uid] || !temp[uid].barang) return 0;
        let alldatas = Object.values(temp[uid].barang);
        console.log(uid);
        const table = document.createElement('table');
        const tbody = document.createElement('tbody');
        const thead = document.createElement('thead');
        // ["Nama Barang", "Jumlah", "Satuan", "Tanggal update"].forEach(head => {
        //     const th = document.createElement('th');
        //     th.textContent = head;
        // });

        // alldatas.forEach(datas => {
        //     const tr = createElement('tr');
        //     // const td
            
        // });
        return true;
    }

    (async () => {
        try{
            if(!await showAll()){
                console.log('null');
                return;
            }
        }catch(error){
            console.log(error);
        }
        
        const searchContainer = resContainer.previousElementSibling.children[1];
        let searchVal = searchContainer.children[0];
        const searchBtn = searchVal.nextElementSibling;
        const navBtns = document.querySelectorAll('main > aside ul li');
        
        navBtns[0].addEventListener('click', () => {
            searchContainer.classList.toggle('hideY');
            searchBtn.addEventListener('click', async (e) => { e.preventDefault();
                const query = searchVal.value;
                console.log(query);

            });
        });
    })();

}else if(curr == 'transaksi.html'){

    const clear = () => {
        const form = document.getElementById('transaksi-form');
        form.reset();
        window.addEventListener('DOMContentLoaded', () => {
            document.querySelector('#transaksi-form > .form-filter .filter input').value = new Date().toISOString().split('T')[0];
        });
    }
    clear();

    (async () => {
        const submit = document.querySelectorAll('form .btns button')[1];
        
        submit.addEventListener('click', async (e) => { e.preventDefault();
            let values = [...document.querySelectorAll('#main-transaksi form input, #main-transaksi form select')];

            let vals = ver(values, values.length);
            values.filter(val => { if(!val.value.trim()) vals.push(val) });
            values.forEach(kolom => { kolom.classList.remove('empty'); });
            if(vals.length){
                alert('Harap isi kolom dengan benar');
                vals.forEach(val => {
                    val.classList.add('empty');
                    if(val.hasAttribute('placeholder')){
                        let placeholder = val.getAttribute('placeholder');
                        if(!val.getAttribute('placeholder').includes('*')) val.setAttribute('placeholder', `${placeholder} *`);
                    }
                });
                return;
            }

            if(!confirm('Apakah Anda yakin?')) return alert('Transaksi dibatalkan...');

            uid = await valUser();
            let temp = await Conlose.take('users_data', 'users_data');
            values.forEach(kolom => { kolom.classList.remove('empty'); });
            values = values.map(val => val.value);

            let stok = parseInt(values[4]), exist = temp[uid].barang && Object.keys(temp[uid].barang).some(id => id == values[2]);
            console.log(temp[uid].barang);
            if(exist){
                let jumlah = await temp[uid].barang[values[2]].jumlah;  
                if(values[0] == 'pemasukan') stok += jumlah;
                else{
                    if(jumlah - stok < 0) return alert(`Stok ${values[2]} sebanyak ${jumlah}, tidak mencukupi untuk melanjutkan transaksi`);
                    jumlah -= stok;
                }
            }else{
                console.log('deb');
                if(values[0] == 'pengeluaran') return alert('Anda belum memiliki barang ini');
            }
            const dataBarang = {
                namaBarang: values[3],
                stok: stok,
                satuan: values[5],
                tanggal: values[1]
            };

            const trId = `tr${Date.now()}`;
            const dataTransaksi = {
                tanggal: values[1],
                idBarang: values[2],
                namaBarang: values[3],
                jumlah: parseInt(values[4]),
                satuan: values[5],
                hargaSatuan: parseInt(values[6]),
                total: parseInt(values[7]),
                supplier: values[8],
                keterangan: values[9]
            };

            const hisId = `his${Date.now()}`;
            const dataHistori = {
                tanggal: values[1],
                jenis: values[0],
                nominal: parseInt(values[7]),
                deskripsi: values[9]
            };
            
            const templates = {
                [`users_data/${uid}/barang/${values[2]}`]: dataBarang,
                [`histori/${uid}/${hisId}`]: dataHistori,
                [`transaksi/${uid}/${values[0]}/${trId}`]: dataTransaksi
            };
            patching(templates, '');
            alert('Transaksi berhasil ditambahkan!');
            clear();
        });
    })();

}else if(curr == 'log-reg.html'){

    const panel = document.getElementsByClassName('panel')[0];
    const form = document.querySelectorAll('form');
    const toggleBtn = document.getElementsByClassName('toggler');
    const submitBtns = document.querySelectorAll('.form-container form button');

    [...toggleBtn].forEach(btn => {
        btn.addEventListener('click', () => {
            form.forEach(f => f.reset());
            form[0].classList.toggle('act');
            form[1].classList.toggle('act');
            panel.classList.toggle('act');
        });
    });

    [...submitBtns].forEach((btn, idx) => {
        btn.addEventListener('click', async (e) => { e.preventDefault();
            if(idx){    // login
                const inputs = document.querySelectorAll('#log input');
                let res = await accVal([...inputs].map(input => input.value ), 1);
                if(res){
                    alert(`Login berhasil!!\nSelamat datang ${res[1]}`); uid = res[0];
                    localStorage.setItem('uid', uid);
                    window.location.replace('dashboard.html');
                }else{
                    alert('Username atau password salah');
                }
            }else{    // regist
                const inputs = document.querySelectorAll('#daftar input');

                let res = await accVal([inputs[1].value], 0);
                if(!res) return alert('Email sudah terdaftar');
                let uid = `uid${Date.now()}`;
                const meta = {
                    nama: inputs[0].value,
                    email: inputs[1].value,
                    password: inputs[2].value,
                    theme: true
                };
                try{
                    await patching(meta, `users_meta/${uid}`);
                    alert(`Pendaftaran berhasil dilakukan!\nSelamat datang ${inputs[0].value}`);
                    localStorage.setItem('uid', uid);
                    localStorage.setItem('theme', true);
                    window.location.replace('dashboard.html');
                }catch{
                    alert('Maaf terjadi kesalahan');
                }
            }
        });
    });

}