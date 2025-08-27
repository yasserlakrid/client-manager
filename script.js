//localStorage.clear("clients")
import { clientsListPage } from "../pages.js";
import { initialPage } from "./pages.js";
import { bod } from './pages.js'


import { todayClientPage } from "../pages.js";
export let clientsList = JSON.parse(localStorage.getItem("clients")) || [];
let clientsListBtn = document.querySelector('.clientsList');

// === show the clients page when button is clicked ===
function renderClientsPage(){
    
    bod.innerHTML = initialPage+clientsListPage;

    // now that the page is inserted, query DOM elements
    let listHtml = document.querySelector('.list');
    let addBtn = document.querySelector('.add');
    let addwindowHtlm = document.querySelector('.addwindow');
    let clientPayMore = document.querySelector('.plus')
    let clientPayLess = document.querySelector('.less')
    let clientNameInput = document.querySelector('.clientNameInput');
    let clientDateInput = document.querySelector('.clientDateInput');
    let clientCaseInput = document.querySelector('.clientCaseInput');
    let searchInput = document.querySelector('.searchClient');

    let subBtn = document.querySelector('.finalAdd');
    let cancelBtn = document.querySelector('.cancel');
    function render(filter = "") {
        listHtml.innerHTML = "";
    
        clientsList
          .filter(client =>
            client.name.toLowerCase().includes(filter.toLowerCase()) ||
            client.case.toLowerCase().includes(filter.toLowerCase())
          )
          .forEach(client => {
            listHtml.innerHTML += `
                <div class="nameJs">${client.name}</div>
                <div class="dateJs">${client.date}</div>
                <div class="clientcaseJs">${client.case}</div>
                <div class="clientPay">
                    <div>${client.pay} DA</div>
                    <button class='plus' id="${client.clientID}">
                        <img src="plus.png" alt="plus" width="30" height="30">
                    </button>
                    <button class='less' id="${client.clientID}">
                        <img src="minus.png" alt="minus" width="30" height="30">
                    </button>
                </div>
                <div class="editBtn">
                    <button class="remove" id="${client.clientID}">
                        <img src="delete.png" alt="remove" width="33" height="33">
                    </button>
                </div>
            `;
          });
    
        listHtml.style.gridTemplateRows = `repeat(${clientsList.length}, 40px)`;
    }
    
    render()
    // === hide the scroll bar ==
    if (clientsList.length<10){
        listHtml.style.overflow = 'hidden'
    }else{
        listHtml.style.overflow = 'scroll'

    }
    // === hide add window ===
    cancelBtn.addEventListener('click', () => {
        addwindowHtlm.style.display = 'none';
    });

    // === add client ===
    subBtn.addEventListener('click', () => {
        if (clientNameInput.value && clientDateInput.value) {
            
            let newClient = {
                name: clientNameInput.value,
                date: clientDateInput.value,
                case: clientCaseInput.value,
                pay:0,
                clientID: Date.now()
            };
            clientsList.push(newClient);
            
            localStorage.setItem("clients", JSON.stringify(clientsList));
            addwindowHtlm.style.display = 'none';

            // clear inputs
            clientNameInput.value = "";
            clientCaseInput.value = "";
            clientDateInput.value = "";
            
            // === render clients ===
            
            render();
        } else {
            console.log('no data');
        }
    });

    

    

    // === handle remove ===
    listHtml.addEventListener("click", (e) => {
        if (e.target.closest(".remove")) {
            let btn = e.target.closest(".remove");
            let clientID = parseInt(btn.id);

            // remove client by ID
            clientsList = clientsList.filter(c => c.clientID !== clientID);

            localStorage.setItem("clients", JSON.stringify(clientsList));
            render();
        }
    });
     // === edit payment ===
     listHtml.addEventListener("click", (e) => {
        if (e.target.closest(".plus")) {
            let btn = e.target.closest(".plus");
            let clientID = parseInt(btn.id);

            for(let i = 0 ; i<clientsList.length ; i++){
                if(clientsList[i].clientID==clientID){
                    eval(clientsList[i].pay) 
                    clientsList[i].pay=eval(clientsList[i].pay) 
                    
                    clientsList[i].pay+=500
                    localStorage.setItem("clients", JSON.stringify(clientsList));
                    render();
                }
            }
            
            

            
        }
    });
    listHtml.addEventListener("click", (e) => {
        if (e.target.closest(".less")) {
            let btn = e.target.closest(".less");
            let clientID = parseInt(btn.id);

            for(let i = 0 ; i<clientsList.length ; i++){
                if(clientsList[i].clientID==clientID){
                    eval(clientsList[i].pay) 
                    clientsList[i].pay=eval(clientsList[i].pay) 
                    if(clientsList[i].pay>=500){
                        clientsList[i].pay-=500
                    }
                    
                    localStorage.setItem("clients", JSON.stringify(clientsList));
                    render();
                }
            }
            
            

            
        }
    });
    // === show add window ===
    addBtn.addEventListener('click', () => {
        addwindowHtlm.style.display = 'grid';
    });

    searchInput.addEventListener("input", () => {
        let keyword = searchInput.value;
        render(keyword);
    });
    

}


function renderTodayPage(){
    let today = new Date();
    let day = today.getDate();
    let month = today.getMonth() + 1; 
    let year = today.getFullYear();
    let formatted = `${year}-${month.toString().padStart(2, '0')}-${day}`;

        bod.innerHTML =initialPage  + todayClientPage
        let todaydateHtml = document.querySelector('.todaydate')
        let todayclientlistHtml = document.querySelector('.todayclientlist')
        let todaysClientsBtn = document.querySelector('.today')

        for (let i = 0; i < 15; i++) {
            todaydateHtml.innerHTML += Date()[i]
        }
        todaydateHtml.innerHTML += " :"
        function todayrender() {
            todayclientlistHtml.innerHTML = ""; // ✅ clear old content
        
            let todaysclient = [];
            clientsList.forEach(client => {
                if (client.date === formatted) {
                    todaysclient.push(client);
                    todayclientlistHtml.innerHTML += `
                        <div class='todayClientName'>${client.name}</div>
                        <div class='todayClientCase'>${client.case}</div>
                        <button class="removeT" id="${client.clientID}">
                            <img src="delete.png" alt="remove" width="33" height="33">
                        </button>
                    `;
                }
            });
        
            // ✅ show message if empty
            if (todaysclient.length === 0) {
                todayclientlistHtml.innerHTML = `<div>No client for today</div>`;
            }
        
            todayclientlistHtml.style.gridTemplateRows = `repeat(${todaysclient.length}, 50px)`;
        }
        
        todayrender()
        // === handle remove ===
        todayclientlistHtml.addEventListener("click", (e) => {
            if (e.target.closest(".removeT")) {
       let btn = e.target.closest(".removeT");
       let clientID = parseInt(btn.id);
       // remove client by ID
       clientsList = clientsList.filter(c => c.clientID !== clientID);

       localStorage.setItem("clients", JSON.stringify(clientsList));
      
        todayrender()
        
       }
       });
           
    
    
}

bod.addEventListener('click', (e) => {
    if (e.target.closest('.today')) {
        renderTodayPage();
    }
    if (e.target.closest('.clientsList')) {
        renderClientsPage();
    }
});
renderTodayPage()