const root = 'https://warasapi-default-rtdb.asia-southeast1.firebasedatabase.app', body = document.getElementsByTagName('body')[0];
// const root = 'https://warasapi02-default-rtdb.asia-southeast1.firebasedatabase.app', body = document.getElementsByTagName('body')[0];
const tabBtn = document.getElementsByClassName('nav-tab')[0];
const nav = document.getElementsByTagName('nav')[0];
const settBtn = document.getElementById('sett-btn');
const settMenus = document.getElementById('setting-contents');
const logout = document.getElementById('logout');
const theme = document.getElementById('theme');
let curr = window.location.pathname.split('/').pop(), uid;

// Current & btns
document.querySelectorAll('body > header > nav > a').forEach(link => {
    link.getAttribute('href') == '#' ? link.classList.add('current') : link;
});

if(localStorage.getItem('theme') == 'l') body.classList.replace('dark', 'light');
else body.classList.replace('light', 'dark');

if(tabBtn){
    tabBtn.addEventListener('click', () => {
        nav.classList.toggle('active');
    });
}

if(settBtn){
    settBtn.addEventListener('click', () => {
        settMenus.classList.toggle('hideX');

    });

    document.querySelectorAll('#setting-contents li').forEach((menu, idx) => {
        menu.addEventListener('click', () => {
            if(!idx){
                if(confirm('Apakah Anda yakin ingin keluar?')){
                    localStorage.removeItem('uid'); 
                    window.location.replace('/index.html');
                }
            }else{
                if(body.classList.contains('light')){
                    body.classList.replace('light', 'dark');
                    localStorage.setItem('theme', 'd');
                }else{
                    body.classList.replace('dark', 'light');
                    localStorage.setItem('theme', 'l');
                }
            }
        });
    })
}

if(theme){
    localStorage.getItem('uid') ? logout.classList.remove('hidden') : logout.classList.add('hidden');
}

window.addEventListener('click', (e) => {
    if(e.target != tabBtn && e.target != nav && e.target != settBtn && e.target != settMenus.childNodes){
        nav.classList.remove('active');
        settMenus.classList.add('hideX');
    }
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
                const red = reg ? 'log-reg.html' : '/index.html';
                window.location.replace(red);
            }, 500);
            body.classList.remove('loading');
            return resolve(null);
        }

        try{
            body.classList.add('loading');
            const usersMeta = await Conlose.take('users_meta', 'users_meta');
            const user = usersMeta?.[uidCheck];

            if(!user){
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
        const database = await Conlose.take('users_meta', 'users_meta') || null;
        if(!key) if(database == null) return true;

        // The falsy or truthy
        let data = Object.entries(database);
        for(let i = 0; i < data.length; i++){
            if(data[i][1].email == datas[0]){
                if(key && data[i][1].password == datas[1]) return [data[i][0], data[i][1].nama];
                else return false;
            }
        }
        if(!key) return true;
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

// Univers
let showAll = async (key, resContainer) => {
    let datas = await Conlose.take('Ra$caL', 'Ra$caL'); if(!datas) return 0; // Ambil root
    let temp = datas.users_data; if(!temp) return false; 
    let valid = datas.users_meta;
    body.classList.remove('loading');

    uid = localStorage.getItem('uid');
    // console.log(uid);
    if(!Object.keys(valid).some(meta => meta == uid)){
        alert('Sesi tidak valid..');
        localStorage.removeItem('uid');
        window.location.replace('/index.html'); return 0;
    }else if(!temp[uid] || !temp[uid].barang) return 0;

    // MAIN //
    Object.keys(datas).forEach((path, pathIdx) => {
        if(pathIdx <= key[1] && pathIdx >= key[0]){
            [Object.keys(datas[path][uid])].forEach((ids) => {
                if(pathIdx === 0){ // Histori
                    const div = document.createElement('div');
                    div.setAttribute('id', "container-histori");
                    const histori = document.createElement('table');
                    const thead = document.createElement('thead');
                    const tbody = document.createElement('tbody');
                    ["No", "ID Histori", "ID Barang", "ID Transaksi", "Tanggal", "Jenis", "Nominal", "Deskripsi"].forEach(head => {
                        const th = document.createElement('th');
                        th.textContent = head;
                        thead.appendChild(th);
                    });

                    ids.forEach((entry, idx) => {
                        const no = document.createElement('td');
                        const id = document.createElement('td');
                        const tr = document.createElement('tr');

                        no.textContent = idx + 1;
                        tr.appendChild(no);

                        id.textContent = entry;
                        tr.appendChild(id);

                        Object.values(datas[path][uid][entry]).forEach(item => {
                            const td = document.createElement('td');
                            td.textContent = item;
                            tr.appendChild(td);
                        });
                        tbody.appendChild(tr);
                    });
                    histori.appendChild(thead);
                    histori.appendChild(tbody);
                    div.appendChild(histori);
                    resContainer.appendChild(div);

                }else if(pathIdx === 1){ // Transaksi
                    const title = ["Pemasukkan", "Pengeluaran"];
                    Object.values(datas[path][uid]).forEach((branch, idx) => { // Many tables?
                        const div = document.createElement('div');
                        div.setAttribute('id', `container-${title[idx].toLocaleLowerCase()}`);
                        const h2 = document.createElement('h2');
                        const table = document.createElement('table');
                        const tbody = document.createElement('tbody');
                        const thead = document.createElement('thead');
                        ["No", "ID Transaksi", "Nama Barang", "Jumlah",
                            "Satuan", "Harga Satuan", "Total", "Tanggal"]
                            .forEach(head => {
                                const th = document.createElement('th');
                                th.textContent = head;
                                thead.appendChild(th);
                            });
                            h2.textContent = title[idx];
                            
                        Object.values(branch).forEach((val, cls) => { // tr, num
                            const tr = document.createElement('tr');
                            const no = document.createElement('td');
                            const id = document.createElement('td');
                            no.textContent = cls + 1;
                            id.textContent = Object.keys(branch)[cls];
                            tr.appendChild(no);
                            tr.appendChild(id);
                            
                            Object.values(val).forEach((jenis, index) => {
                                if(index != 0 && index < 7){
                                    const td = document.createElement('td');
                                    td.textContent = jenis;
                                    tr.appendChild(td);
                                }
                                tbody.appendChild(tr);
                            });
                            table.appendChild(thead);
                            table.appendChild(tbody);
                            div.appendChild(h2);
                            div.appendChild(table);
                            resContainer.appendChild(div);
                        });
                    });

                }else if(pathIdx === 2){ // Barang

                    const title = document.createElement('h2');
                    const table = document.createElement('table');
                    const tbody = document.createElement('tbody');
                    const thead = document.createElement('thead');
                    title.textContent = 'Data Barang';
                    ["No", "ID Barang", "Nama Barang", "Jumlah", "Satuan", "Tanggal update"].forEach(head => {
                        const th = document.createElement('th');
                        th.textContent = head;
                        thead.appendChild(th);
                    });
            
                    Object.values(datas[path][uid]).forEach(data => {
                        Object.keys(data).forEach((id, idx) => {
                            const tr = document.createElement('tr');
                            const td = document.createElement('td');
                            const no = document.createElement('td');
                            no.textContent = idx + 1;
                            td.textContent = id;
                            td.setAttribute('id', id);
                            tr.appendChild(no);
                            tr.appendChild(td);
            
                            Object.values(data[id]).forEach(data => {
                                const td = document.createElement('td');
                                td.textContent = data;
                                tr.appendChild(td);
                            });
                            tbody.appendChild(tr);
                        });
                    });
            
                    const div = document.createElement('div');
                    div.setAttribute('id', 'container-barang');
                    table.appendChild(thead);
                    table.appendChild(tbody);
                    div.appendChild(title);
                    div.appendChild(table);
                    resContainer.appendChild(div);
                }
            });
        }else return;
    });
    return true;
}

const clearEl = (tag) => {
    while(tag.firstChild){
        tag.removeChild(tag.firstChild);
    }
}

const hisMatch = async () => {
    let database = await Conlose.take('Ra$caL', 'Ra$caL');

}

// Pages
if(curr == 'index.html'){
    const registBtn = document.getElementById('regist');
    let uidCheck = localStorage.getItem('uid');

    if(uidCheck){
        registBtn.classList.add('hidden');
    }else{
        registBtn.classList.remove('hidden');
    }
}else if(curr == 'inventori.html'){

    const resContainer = document.getElementById('res-container');

    (async () => {
        const val = async (fx) => {
            if(!await fx()){
                const h3 = document.createElement('h3');
                h3.textContent = "Anda belum memiliki data apapun disini";
                resContainer.appendChild(h3);
                return;
            }
        }

        try{ await val(() => showAll([1, 2], resContainer)); }
        catch(error){ alert('Maaf terjadi kesalahan'); }
        
        const navBtns = document.querySelectorAll('main > aside ul li');
        const searchContainer = resContainer.previousElementSibling.children[1];
        let searchVal = searchContainer.children[0];
        
        navBtns[0].addEventListener('click', () => {
            searchContainer.classList.toggle('hideY');
            searchVal.addEventListener('input', (e) => { e.preventDefault();
                const query = e.target.value.toLowerCase().trim();
                const trs = document.querySelectorAll('tbody tr');

                trs.forEach(tr => {
                    const tds = [...tr.children];
                    const fn = tds.some(td => td.textContent.toLowerCase().includes(query));
                    
                    if(fn){
                        tr.classList.add('shown');
                        tr.classList.remove('hidden');
                    }else{
                        tr.classList.add('hidden');
                        tr.classList.remove('shown');
                    }
                });
            });
        });


        navBtns[1].addEventListener('click', () => { clearEl(resContainer);
            val(() => showAll([1, 2], resContainer));
        });

        navBtns[2].addEventListener('click', () => { clearEl(resContainer);
            val(() => showAll([2, 2], resContainer));
        });

        navBtns[3].addEventListener('click', () => { clearEl(resContainer);
            val(() => showAll([1, 1], resContainer));
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
            values.filter((val, idx) => { if(!val.value.trim() && idx != 7) vals.push(val) });
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
            
            if(!values[7].value){
                values[7].value = parseInt(values[4].value) * parseInt(values[6].value);
                console.log(values[7].value);
            }
            if(!confirm('Apakah Anda yakin?')) return alert('Transaksi dibatalkan...');

            uid = await valUser();
            let temp = await Conlose.take('users_data', 'users_data');
            values.forEach(kolom => { kolom.classList.remove('empty'); });
            values = values.map(val => val.value);

            let stok = parseInt(values[4]), exist = temp && temp[uid] && temp[uid].barang && Object.keys(temp[uid].barang).some(id => id == values[2]);
            if(exist){
                let jumlah = await temp[uid].barang[values[2]].b_stok;  
                if(values[0] == 'pemasukan') stok += jumlah;    
                else{
                    if(jumlah - stok < 0) return alert(`Stok ${values[2]} sebanyak ${jumlah}, tidak mencukupi untuk melanjutkan transaksi`);
                    stok = jumlah - stok;
                }
            }else{
                if(values[0] == 'pengeluaran') return alert('Anda belum memiliki barang ini');
            }
            const trId = `tr${Date.now()}`;
            const hisId = `his${Date.now()}`;

            const dataBarang = {
                a_namaBarang: values[3],
                b_stok: stok,
                c_satuan: values[5],
                d_tanggal: values[1]
            };

            const dataTransaksi = {
                a_idBarang: values[2],
                b_namaBarang: values[3],
                c_jumlah: parseInt(values[4]),
                d_satuan: values[5],
                e_hargaSatuan: parseInt(values[6]),
                d_total: parseInt(values[7]),
                f_tanggal: values[1],
                g_supplier: values[8],
                h_keterangan: values[9]
            };

            const dataHistori = {
                a_idBarang: values[2],
                aa_idTransaksi: trId,
                b_tanggal: values[1],
                c_jenis: values[0],
                d_nominal: parseInt(values[7]),
                e_deskripsi: values[9]
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
                let res = await accVal([...inputs].map(input => input.value), 1);
                if(res){
                    alert('Login berhasil!!\nSelamat datang di Warehouse Aswan'); uid = res[0];
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
                    theme: 'l'
                };
                try{
                    await patching(meta, `users_meta/${uid}`);
                    alert(`Pendaftaran berhasil dilakukan!\nSelamat datang ${inputs[0].value}`);
                    localStorage.setItem('uid', uid);
                    localStorage.setItem('theme', 'l');
                    window.location.replace('dashboard.html');
                }catch{
                    alert('Maaf terjadi kesalahan');
                }
            }
        });
    });

}else if(curr == 'histori.html'){
    const resContainer = document.getElementById('result');
    const filterBtn = document.getElementById('filter-btn');
    const filterContainer = document.querySelectorAll('#filter-form label');
    const filter = document.querySelectorAll('#filter-form > label > button, #filter-form select, #filter-form input');

    (async () => {
        try{
            await showAll([0, 0], resContainer);
        }catch(err){
            console.error(err);
        }
        
        filterBtn.addEventListener('click', () => {
            [...filterContainer].forEach(child => {
                child.classList.toggle('hide');
            });
        });

        filter[0].addEventListener('click', (e) => { e.preventDefault();
            const table = document.querySelector('#container-histori table');
            if (!table) return;
            if (!filter[1].value.trim()) return alert(`Harap filter tanggal`);

            const tgl = filter[1].value.trim();
            const jenis = (filter[2].value == 'semua') ? true : filter[2].value;

            table.querySelectorAll('tbody tr').forEach(tr => {
                const data = tr.children;
                const targetTgl = data[4].textContent.trim();
                const targetJns = data[5].textContent.trim();

                if(targetTgl.includes(tgl) && (jenis == true || targetJns == jenis)) tr.classList.remove('hidden');
                else tr.classList.add('hidden');
            });
        });
        const table = document.querySelector('#container-histori table');
        
        if(!table){
            const msg = document.createElement('h3');
            msg.textContent = 'Tidak Ada histori tersedia';
            resContainer.appendChild(msg);
        }

    })();

}else if(curr == 'dashboard.html'){

    uid = localStorage.getItem('uid');
    if(!uid){
        localStorage.removeItem('uid');
        alert('Anda belum terdaftar');
        window.location.replace('/index.html');
    }
    
    (async () => { 
        uid = await valUser();
        const userDatas = await Conlose.take('Ra$caL', 'Ra$caL');
        const aktivitasCtr = document.getElementById('container-aktivitas');
        const daftarBrg = document.getElementById('container-barang');
        const aktivitas = [];
        let res = [];
        let trans = 0, stok = 0, today = new Date().toISOString().split('T')[0];

        if(!Object.keys(userDatas.users_meta).some(user => user == uid)){
            alert('Sesi tidak valid');
            localStorage.removeItem('uid');
            localStorage.removeItem('theme');
            window.location.replace('/index.html');
        }
        else if(!userDatas.users_data?.[uid]){
            const msg = document.createElement('h3');
            msg.textContent = 'Tidak ada data tersedia';
            daftarBrg.appendChild(msg);
            const mes = document.createElement('h5');
            mes.textContent = 'Tidak ada transaksi hari ini';
            aktivitasCtr.appendChild(mes);

            return alert('Anda belum memiliki barang apapun');
        }


        // Top Menu
        const show = (text) => {
            [...document.querySelectorAll('.container-card > .card')].forEach((data, idx) => {
                [...data.children].forEach((p) => {
                    p.textContent = text[idx];
                });
            });
        };
        Object.values(userDatas.users_data[uid].barang).forEach((data) => {
            stok += data.b_stok;
        });
        Object.values(userDatas.transaksi[uid]).forEach(jenis => {
            Object.values(jenis).forEach(data => {
                if(data.f_tanggal == today){
                    aktivitas.push(data);
                    trans++;
                }
            });
        });
        show([Object.keys(userDatas.users_data[uid].barang).length, stok, trans]);

        document.getElementsByTagName('title')[0].textContent = `${userDatas.users_meta[uid].nama} - Dashboard`;
        Object.values(userDatas.transaksi[uid]).forEach(data => {
            let total = 0;
            Object.values(data).forEach(tr => {
                total += tr.d_total;
            });
            res.push(total);
        });
        if(typeof(res[1]) != 'number') res[1] = 0;
        
        const shown = res[0] - res[1] >= 0 ? res[0] - res[1] : `Loss ${-(res[0] - res[1])}`;
        document.querySelector('.usr-income h1').textContent = shown;
        

        // Today trans
        const table = document.createElement('table');
        const tbody = document.createElement('tbody');
        const thead = document.createElement('thead');
        ["No", "ID  Barang", "Nama Barang", "Jumlah", "Satuan", "Total", "Harga satuan", "Tanggal", "Supplier", "Keterangan"]
        .forEach(head => {
            const th = document.createElement('th');
            th.textContent = head;
            thead.appendChild(th);
        });
        Object.values(aktivitas).forEach((row, idx) => {
            const tr = document.createElement('tr');
            const no = document.createElement('td');
            no.textContent = idx + 1;
            tr.appendChild(no);
            Object.values(row).forEach(data => {
                const td = document.createElement('td');
                td.textContent = data;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(thead);
        table.appendChild(tbody);
        if(!tbody.children.length){
            const msg = document.createElement('h5');
            msg.textContent = 'Tidak ada transaksi hari ini';
            aktivitasCtr.appendChild(msg);
            
        }else aktivitasCtr.appendChild(table);
        

        document.getElementById('income').textContent = res[0];
        document.getElementById('loss').textContent = res[1];


        // Daftar barang
        Object.values(userDatas.users_data[uid].barang).forEach(barang => {
            const h3 = document.createElement('h3'); h3.textContent = barang.a_namaBarang;
            const h5 = document.createElement('h5'); h5.textContent = `Stok : ${barang.b_stok}`;
            const p = document.createElement('h5'); p.textContent = barang.c_satuan;
            const date = document.createElement('p'); date.textContent = barang.d_tanggal;

            const stk = document.createElement('div'); stk.className = 'stok';
            stk.appendChild(h5); stk.appendChild(p);

            const div = document.createElement('div'); div.className = 'card';
            div.appendChild(h3);
            div.appendChild(stk);
            div.appendChild(date);
            daftarBrg.appendChild(div);
        });

    })();

}