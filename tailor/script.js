function go(page){
    window.location.href = page;
}

/* DATE */
function getDate(offset=0){
    let d=new Date();
    d.setDate(d.getDate()+offset);
    return d.toISOString().slice(0,10);
}

/* WORK DATA */
function getData(){
    return JSON.parse(localStorage.getItem("work")||"[]");
}

function saveData(d){
    localStorage.setItem("work",JSON.stringify(d));
}

/* ADD WORK */
function addWork(type,price){
    let d=getData();
    let today=getDate();

    let item=d.find(x=>x.type==type && x.date==today);
    if(item){
        item.qty++;
        item.total+=price;
    }else{
        d.push({type,qty:1,total:price,date:today});
    }

    saveData(d);
    renderToday();
}

/* TODAY TOTAL */
function renderToday(){
    let el=document.getElementById("todayTotal");
    if(!el) return;

    let d=getData();
    let today=getDate();
    let total=0;

    d.filter(x=>x.date==today).forEach(x=> total+=x.total);

    el.innerText=total;
}
renderToday();

/* CUSTOMERS */
function getCust(){
    return JSON.parse(localStorage.getItem("cust")||"{}");
}
function saveCust(c){
    localStorage.setItem("cust",JSON.stringify(c));
}

function searchCustomer(){
    let phone=document.getElementById("phone").value;
    let box=document.getElementById("custBox");

    if(phone.length!==10){
        box.innerHTML="";
        return;
    }

    let c=getCust();
    if(!c[phone]) c[phone]={pending:0};

    let data=c[phone];

    box.innerHTML=`
        <h3>Pending: ₹${data.pending}</h3>
        <button onclick="updateAmt(1)">+ Add</button>
        <button onclick="updateAmt(-1)">- Remove</button>
    `;
}

function updateAmt(type){
    let phone=document.getElementById("phone").value;
    let amt=prompt("Enter amount:");
    if(!amt) return;

    let c=getCust();
    if(!c[phone]) c[phone]={pending:0};

    c[phone].pending += type*parseInt(amt);
    if(c[phone].pending<0) c[phone].pending=0;

    saveCust(c);
    searchCustomer();
}

/* SUMMARY */
function loadSummary(type){
    let d=getData();
    let total=0;

    let today=getDate();
    let yesterday=getDate(-1);

    if(type==='today'){
        d=d.filter(x=>x.date==today);
    }else if(type==='yesterday'){
        d=d.filter(x=>x.date==yesterday);
    }else{
        let m=new Date().getMonth();
        d=d.filter(x=>new Date(x.date).getMonth()==m);
    }

    d.forEach(x=>total+=x.total);

    document.getElementById("summaryData").innerHTML=
        `<h2>Total: ₹${total}</h2>`;
}