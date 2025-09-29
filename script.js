//localStorage.clear("doctors")
import { clientsListPage, todayClientPage, initialPage, doctorsPage } from "./pages.js";
let bod = document.querySelector('.bod');
let doctorHtml, doctorNameHtml, chosenDoc;

export let doctorsList = JSON.parse(localStorage.getItem("doctors")) || [];

let clientsListBtn = document.querySelector('.clientsList');

bod.innerHTML = doctorsPage
let addNewDocWind = document.querySelector('.addNewDocWind')
let cancelBtn = document.querySelector('.cancelDocBtn')
let docNameInput = document.querySelector('.docNameInput')
let docTypeInput = document.querySelector('.doctorTypeInput')
let subDocBtn = document.querySelector('.finalDocAdd')
let doctorShow = document.querySelector('.doctorShow')
let addNewDocBtn = document.querySelector('.addNewDocBtn')
let homeBtn = document.querySelector('.home')

if(homeBtn){
    homeBtn.addEventListener('click',()=>{
        console.log("fuck")
        renderDoctorsPage()
    })
}

doctorShow.addEventListener("click", (e) => {

    if (e.target.closest(".addNewDocBtn")) {

        addNewDocWind.style.display = 'grid'

        subDocBtn.addEventListener('click', () => {
            if(docNameInput.value!==''){
                doctorsList.push({ name: docNameInput.value,type:docTypeInput.value, clients: [],id:Date.now()})
                localStorage.setItem("doctors", JSON.stringify(doctorsList));
                addNewDocWind.style.display = 'none'
            }

            console.log(doctorsList)


            renderDoctorsPage()
            docNameInput.value = ''
        })
        cancelBtn.addEventListener('click', () => {
            addNewDocWind.style.display = 'none'
            docNameInput.value = ''
        })


    }
});


addNewDocBtn.addEventListener('click', () => {

})
function renderDoctorsPage() {

    doctorShow.innerHTML = `
    <div class="addNewDoc">
        <div class='addNewDocBtn'>
        <img src="user-add.png" width="50" height="50">
        </div>
    </div>`

    let modifiedDocLenght = doctorsList.length + 1
    doctorShow.style.gridTemplateColumns = `repeat(${modifiedDocLenght}, 240px)`;

    doctorsList.forEach(doctor => {

        doctorShow.innerHTML += `
            <div class='doctor'  >
            
                    <div class='deleteDocBtn' >
                    <div class='deleteFin' id=${doctor.id}>
                    <img src="cross-small.png" alt="Aujourd'hui" width="30" height="30">
                    </div>
                    </div>
                    <div class='doctorAv' id=${doctor.name}>
                        <img src="docAv.jpeg" alt="Aujourd'hui" width="120" height="150">
                        
                    </div>
                    <div class='doctorName'>
                        ${doctor.name}
                    </div>
                         
            </div> 

        `

        selectDoc()
        
        
        
    })
    let doctor = document.querySelectorAll('.doctor')

    // === handle doctors remove ===
    if(doctor){
        doctor.forEach((doctor)=>{
            doctor.addEventListener("click", (e) => {
                console.log("hello")
                if (e.target.closest(".deleteFin")) {
                    let btn = e.target.closest(".deleteFin");
                    let clientID = parseInt(btn.id);
                    console.log(clientID)
                    doctorsList = doctorsList.filter(d => d.id !== clientID);

                    localStorage.setItem("doctors", JSON.stringify(doctorsList));
                    renderDoctorsPage()
                }
            })
        })

    }

}

function selectDoc() {
    doctorHtml = document.querySelectorAll('.doctorAv') || undefined
    if (doctorHtml) {
        doctorHtml.forEach((doc) => {
            doc.addEventListener('click', () => {

                chosenDoc = doc.id;
                
                renderTodayPage()
                bod.style.backgroundImage='none'
                console.log(chosenDoc)
            })
        })
    }

}


renderDoctorsPage()


 

// === show the clients page when button is clicked ===
function renderClientsPage() {

    bod.innerHTML = initialPage + clientsListPage;

    let listHtml = document.querySelector('.list');
    let addBtn = document.querySelector('.add');
    let addwindowHtlm = document.querySelector('.addwindow');
    let clientPayMore = document.querySelector('.plus')
    let clientPayLess = document.querySelector('.less')
    let clientNameInput = document.querySelector('.clientNameInput');
    let clientDateInput = document.querySelector('.clientDateInput');
    let clientCaseInput = document.querySelector('.clientCaseInput');
    let searchInput = document.querySelector('.searchClient');
    let details = document.querySelector('.details')
    let subBtn = document.querySelector('.finalAdd');
    let cancelBtn = document.querySelector('.cancel');
    let pageTitle = document.querySelector('.pageTitle')

    pageTitle.innerHTML = `Liste des patients de Dr ${chosenDoc} :`
    function render(filter = "") {
        listHtml.innerHTML = "";
        doctorsList.forEach((doc) => {
            if (chosenDoc == doc.name) {
                console.log(doc.clients)
                doc.clients
                    .forEach(client => {
                        listHtml.innerHTML += `
                    <div class="nameJs">${client.name}</div>
                    <div class="dateJs">${client.date}</div>
                    <div class="clientcaseJs">${client.case}</div>
                    <div class="clientPay">
                        <div>${client.pay} DA</div>
                        <button class='plus' id="${client.clientID}">
                            <img src="plus.png" alt="ajouter" width="30" height="30">
                        </button>
                        <button class='less' id="${client.clientID}">
                            <img src="minus.png" alt="retirer" width="30" height="30">
                        </button>
                    </div>
                    <div class="editBtn">
                        <button class="remove" id="${client.clientID}">
                            <img src="delete.png" alt="supprimer" width="33" height="33">
                        </button>
                    </div>
                `;
                    });

                listHtml.style.gridTemplateRows = `repeat(${doc.clients.length}, 40px)`;

                if (doc.clients.length < 10) {
                    listHtml.style.overflow = 'hidden'
                    details.style.gridTemplateColumns =' 30% 15% 15% 15% 25% '

                } else {
                    listHtml.style.overflow = 'scroll'
                    details.style.gridTemplateColumns ='29.5% 14.8% 14.8% 14.8% 24% '

                }
            }
        })

    }

    render()

    cancelBtn.addEventListener('click', () => {
        addwindowHtlm.style.display = 'none';
    });

    subBtn.addEventListener('click', () => {
        if (clientNameInput.value && clientDateInput.value) {

            let newClient = {
                name: clientNameInput.value,
                date: clientDateInput.value,
                case: clientCaseInput.value,
                pay: 0,
                clientID: Date.now()
            };

            doctorsList.forEach((doc) => {
                if (doc.name == chosenDoc) {
                    doc.clients.push(newClient)
                    localStorage.setItem("doctors", JSON.stringify(doctorsList));
                    console.log(doctorsList)
                    newClient = undefined
                }
            })

            addwindowHtlm.style.display = 'none';

            clientNameInput.value = "";
            clientCaseInput.value = "";
            clientDateInput.value = "";

            render();
        } else {
            console.log('aucune donnée');
        }
    });

    doctorsList.forEach((doc) => {
        if (doc.name == chosenDoc) {
            listHtml.addEventListener("click", (e) => {
                if (e.target.closest(".remove")) {
                    let btn = e.target.closest(".remove");
                    let clientID = parseInt(btn.id);

                    doc.clients = doc.clients.filter(c => c.clientID !== clientID);

                    localStorage.setItem("doctors", JSON.stringify(doctorsList));
                    render();
                }
            });
        }
    })

    listHtml.addEventListener("click", (e) => {
        doctorsList.forEach((doc) => {
            if (doc.name == chosenDoc) {
                if (e.target.closest(".plus")) {
                    let btn = e.target.closest(".plus");
                    let clientID = parseInt(btn.id);

                    for (let i = 0; i < doc.clients.length; i++) {
                        if (doc.clients[i].clientID == clientID) {
                            eval(doc.clients[i].pay)
                            doc.clients[i].pay = eval(doc.clients[i].pay)

                            doc.clients[i].pay += 500
                            localStorage.setItem("doctors", JSON.stringify(doctorsList));
                            render();
                        }
                    }
                }
            }
        })

    });
    listHtml.addEventListener("click", (e) => {
        doctorsList.forEach(doc => {
            if (doc.name == chosenDoc) {
                if (e.target.closest(".less")) {
                    let btn = e.target.closest(".less");
                    let clientID = parseInt(btn.id);

                    for (let i = 0; i < doc.clients.length; i++) {
                        if (doc.clients[i].clientID == clientID) {
                            eval(doc.clients[i].pay)
                            doc.clients[i].pay = eval(doc.clients[i].pay)
                            if (doc.clients[i].pay >= 500) {
                                doc.clients[i].pay -= 500
                            }

                            localStorage.setItem("doctors", JSON.stringify(doctorsList));
                            render();
                        }
                    }
                }
            }
        });

    });
    addBtn.addEventListener('click', () => {
        addwindowHtlm.style.display = 'grid';
    });

    searchInput.addEventListener("input", () => {
        let keyword = searchInput.value;
        render(keyword);
    });

}


function renderTodayPage() {
    let today = new Date();
    let day = today.getDate();
    let month = today.getMonth() + 1;
    let year = today.getFullYear();
    let formatted = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

    bod.innerHTML = initialPage + todayClientPage

    let todaydateHtml = document.querySelector('.todaydate')
    let todayclientlistHtml = document.querySelector('.todayclientlist')
    let todaysClientsBtn = document.querySelector('.today')
    let pageTitle = document.querySelector('.pageTitle')
    console.log(chosenDoc)
    pageTitle.innerHTML = `Patients de Dr ${chosenDoc} aujourd'hui :`
    for (let i = 0; i < 15; i++) {
        todaydateHtml.innerHTML += Date()[i]
    }
    todaydateHtml.innerHTML += " :"
    function todayrender() {
        todayclientlistHtml.innerHTML = `<div class='back'>
    <img src="back.jpeg"  >
</div>`;
        
        doctorsList.forEach((doc) => {
            if (chosenDoc == doc.name) {
                // Collect today's clients once per doctor
                let todaysclients = doc.clients.filter(client => client.date === formatted);
    
                if (todaysclients.length === 0) {
                    todayclientlistHtml.innerHTML = `<div>Aucun patient pour aujourd'hui</div>
                                                        <div class='back'>
                                                        <img src="back.jpeg"  >
                                                    </div>`;
                } else {
                    todaysclients.forEach(client => {
                        todayclientlistHtml.innerHTML += `
                            
                                <div class='todayClientName'>${client.name}</div>
                                <div class='todayClientCase'>${client.case}</div>
                                <button class="removeT" id="${client.clientID}">
                                    <img src="delete.png" alt="supprimer" width="33" height="33">
                                </button>
                            
                        `;
                    });
    
                    // Fix grid rows
                    todayclientlistHtml.style.gridTemplateRows = `repeat(${todaysclients.length}, 50px)`;
                }
    
                // Attach event listener once per render
                todayclientlistHtml.addEventListener("click", (e) => {
                    if (e.target.closest(".removeT")) {
                        let btn = e.target.closest(".removeT");
                        let clientID = parseInt(btn.id);
    
                        // Remove client from this doctor
                        doc.clients = doc.clients.filter(c => c.clientID !== clientID);
    
                        // Save back to localStorage
                        localStorage.setItem("doctors", JSON.stringify(doctorsList));
    
                        // Re-render
                        todayrender();
                    }
                });
            }
        });
    }
    
    todayrender()
}
function renderMyspacePage(){
   
    let doctorIncome = 0
    let doctorContribution = 0
    if(doctorsList.length>0){
        doctorsList.forEach((doc)=>{
            if(chosenDoc==doc.name){
                console.log(doc.types)
                doc.clients.forEach((client)=>{
                    doctorIncome+=client.pay
                    
                })
                if(doc.type=='coworker'){
                    doctorContribution += (doctorIncome*70)/100
                }
                
                
                bod.innerHTML = initialPage+`
                <div class="pr">
                    <div class="myspacetools">
                        <div class="pageTitle">${chosenDoc} espace :</div>
                    </div>
                    <div class="myspacemain">
                    
                    <p>
                        total clients number : ${doc.clients.length}
                    </p>
                    <p>
                        total income : ${doctorIncome} DA
                    </p>
                    <p>
                        contribution to the cabinet income: ${doctorContribution } DA
                    </p>
                      <p>
                         doctor ${chosenDoc} pure income : ${doctorIncome - doctorContribution } DA
                    </p>
                    </div>
                </div>`
                console.log()
            }
        })
    }


}


bod.addEventListener('click', (e) => {
    if (e.target.closest('.today')) {
        renderTodayPage();
    }
    if (e.target.closest('.clientsList')) {
        renderClientsPage();
    }
    if (e.target.closest('.mySpace')) {
        renderMyspacePage()
    }
   
});
